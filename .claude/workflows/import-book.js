/*
 * WriteAssist IMPORT-BOOK workflow. Onboard an EXISTING manuscript (a directory of chapter .md
 * files) into the WriteAssist project by building a per-chapter intent map, then RECONCILING the
 * facts it asserts against each other and against any existing story compendium (bible).
 *
 * This workflow RECONCILES; it does NOT extract-and-overwrite. Asserted facts conflict with one
 * another and with stale canon, and stale canon throws FALSE failures on chapters that are fine.
 * So the job is diff + adjudicate: cluster the agreeing facts, and for every disagreement, surface
 * BOTH sides and the chapters they touch, never silently picking a winner. A single canon decision
 * can ripple across 20+ chapters, so each conflict-ledger entry lists its affected chapters.
 *
 * Usage: run this saved workflow with args set to an object
 *   { manuscript: "<dir of existing chapter .md files>", bible: "<story-compendium path or null>" }
 *
 * PHASE 'Scout': one full-tool agent lists the chapter files (ordered array of paths). Then ONE
 * reader agent per chapter runs in parallel, each returning a structured per-chapter intent map.
 * This map is the keystone and is cheap: a single structured read per chapter.
 *
 * PHASE 'Reconcile': one full-tool synthesis agent takes ALL scout outputs plus the existing bible
 * (if any), clusters facts, DETECTS CONTRADICTIONS (prose-vs-prose and prose-vs-bible), and writes
 * three reviewable files under 04-Project-Management/import/ : scout-map.md (the per-chapter map),
 * candidate-compendium.md (only the facts that AGREE), and conflict-ledger.md (the keystone, where
 * each entry presents options for the author and is NEVER auto-resolved).
 *
 * Judging stays on ONE consistent model: NO model overrides anywhere, so every agent inherits the
 * capable main model and score noise never drives a reconcile decision. The workflow itself has no
 * filesystem or shell and uses no wall-clock or randomness; only agent() calls touch files and any
 * needed variation is derived from the chapter index.
 *
 * Returns { chapters_scanned, facts_agreed, conflicts:[{id, topic, affected_count}], files_written }.
 */

export const meta = {
  name: 'import-book',
  description: 'Onboard an existing manuscript: build a per-chapter intent map, then reconcile asserted facts against each other and any existing bible, surfacing every conflict without auto-resolving.',
  phases: [
    { title: 'Scout' },
    { title: 'Reconcile' },
  ],
};

// ---- Static configuration ------------------------------------------------

// Where the three reviewable artifacts are written. Fixed, inside the repo's PM import area.
const IMPORT_DIR = '04-Project-Management/import';
const SCOUT_MAP_PATH = `${IMPORT_DIR}/scout-map.md`;
const CANDIDATE_COMPENDIUM_PATH = `${IMPORT_DIR}/candidate-compendium.md`;
const CONFLICT_LEDGER_PATH = `${IMPORT_DIR}/conflict-ledger.md`;

// The file-listing agent returns an ORDERED array of chapter file paths.
const FILE_LIST_SCHEMA = {
  type: 'object',
  required: ['chapters'],
  additionalProperties: false,
  properties: {
    chapters: {
      type: 'array',
      items: { type: 'string' },
    },
    note: { type: 'string' },
  },
};

// The per-chapter intent map. This is the keystone structured read, one per chapter.
const SCOUT_SCHEMA = {
  type: 'object',
  required: [
    'chapter',
    'summary',
    'entities',
    'facts_asserted',
    'intent_beats',
    'voice_tells',
    'canon_conflicts',
    'work_needed',
    'severity',
  ],
  additionalProperties: false,
  properties: {
    chapter: { type: 'string' },
    summary: { type: 'string' },
    entities: { type: 'array', items: { type: 'string' } },
    facts_asserted: {
      type: 'array',
      items: {
        type: 'object',
        required: ['fact', 'about', 'evidence'],
        additionalProperties: false,
        properties: {
          fact: { type: 'string' },
          about: { type: 'string' },
          evidence: { type: 'string' },
        },
      },
    },
    intent_beats: { type: 'array', items: { type: 'string' } },
    voice_tells: { type: 'array', items: { type: 'string' } },
    canon_conflicts: { type: 'array', items: { type: 'string' } },
    work_needed: { type: 'string' },
    severity: { type: 'string', enum: ['none', 'low', 'medium', 'high'] },
  },
};

// What the reconcile/synthesis agent reports back after writing the three files. The conflicts
// array is the keystone: each entry surfaces BOTH claims, the chapters it ripples across, and the
// author-facing options. The agent NEVER picks a winner.
const RECONCILE_SCHEMA = {
  type: 'object',
  required: ['facts_agreed', 'conflicts', 'files_written'],
  additionalProperties: false,
  properties: {
    facts_agreed: { type: 'number' },
    conflicts: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'topic', 'type', 'claimA', 'claimB', 'affected_chapters', 'options', 'severity'],
        additionalProperties: false,
        properties: {
          id: { type: 'string' },
          topic: { type: 'string' },
          type: { type: 'string', enum: ['internal', 'vs-bible'] },
          claimA: {
            type: 'object',
            required: ['source', 'claim'],
            additionalProperties: false,
            properties: {
              source: { type: 'string' },
              claim: { type: 'string' },
            },
          },
          claimB: {
            type: 'object',
            required: ['source', 'claim'],
            additionalProperties: false,
            properties: {
              source: { type: 'string' },
              claim: { type: 'string' },
            },
          },
          affected_chapters: { type: 'array', items: { type: 'string' } },
          options: { type: 'array', items: { type: 'string' } },
          severity: { type: 'string', enum: ['low', 'medium', 'high'] },
        },
      },
    },
    files_written: { type: 'array', items: { type: 'string' } },
  },
};

// ---- Helpers -------------------------------------------------------------

// Read args into { manuscript, bible }. Accepts the object form or a bare manuscript-dir string.
function parseArgs(input) {
  if (typeof input === 'string') return { manuscript: input.trim() || null, bible: null };
  const obj = input || {};
  const bible = obj.bible === undefined || obj.bible === null || obj.bible === '' ? null : String(obj.bible);
  return {
    manuscript: obj.manuscript ? String(obj.manuscript) : null,
    bible,
  };
}

// ---- Workflow body -------------------------------------------------------

  const { manuscript, bible } = parseArgs(args);

  if (!manuscript) {
    return {
      chapters_scanned: 0,
      facts_agreed: 0,
      conflicts: [],
      files_written: [],
      reason: 'No manuscript directory supplied in args.',
    };
  }

  // --- Phase 1: Scout. List the chapter files, then build the per-chapter intent map in parallel.
  phase('Scout');
  log(`Scouting manuscript directory ${manuscript}` + (bible ? ` (existing bible: ${bible})` : ' (no existing bible)'));

  // Step 1: ONE full-tool agent lists the chapter files and returns an ORDERED array of paths.
  const listing = await agent(
    `You have full tools (Read, Glob, Bash). List the manuscript chapter files in the directory\n` +
      `below and return them as an ORDERED array of paths (reading order).\n\n` +
      `Manuscript directory: ${manuscript}\n\n` +
      `Rules:\n` +
      `  - Include only Markdown chapter files (*.md). Exclude non-chapter files (README, notes,\n` +
      `    templates, hidden files, and anything clearly not manuscript prose).\n` +
      `  - Sort in natural reading order (e.g. Chapter-01 before Chapter-02, 2 before 10), not raw\n` +
      `    lexical order.\n` +
      `  - Return each path as it should be passed to a reader (relative to the project root or the\n` +
      `    same form the directory was given). Do not invent files that do not exist.\n` +
      `Return JSON: { chapters: [...ordered paths...], note }.`,
    { label: 'list-chapters', phase: 'Scout', schema: FILE_LIST_SCHEMA },
  );

  const chapters = Array.isArray(listing.chapters) ? listing.chapters.filter(Boolean) : [];

  if (!chapters.length) {
    return {
      chapters_scanned: 0,
      facts_agreed: 0,
      conflicts: [],
      files_written: [],
      reason: `No chapter .md files found in ${manuscript}.` + (listing.note ? ` (${listing.note})` : ''),
    };
  }

  log(`Found ${chapters.length} chapter file(s). Fanning out one reader per chapter (parallel).`);

  // Step 2: fan out ONE reader agent per chapter (BARRIER). Each returns the per-chapter intent map.
  // No model override: every reader inherits the capable main model so the maps are judged on ONE
  // consistent model and score noise cannot skew the later reconcile.
  const scoutResults = await parallel(
    chapters.map((chapterPath, index) => async () => {
      const map = await agent(
        `You are a WriteAssist import scout. Read ONE existing chapter and return a structured\n` +
          `intent map. This is a READ task: do not edit, rewrite, or "fix" the chapter.\n\n` +
          `Chapter file: ${chapterPath}\n` +
          `Chapter index (reading order, 0-based): ${index}\n\n` +
          `Capture, grounded ONLY in what the prose actually says:\n` +
          `  - summary: 2 to 4 sentences of what happens.\n` +
          `  - entities: named characters, places, factions, objects that appear.\n` +
          `  - facts_asserted: concrete canon claims the prose makes. For each give { fact, about,\n` +
          `    evidence } where "about" is the entity/topic and "evidence" is a short quote or line\n` +
          `    reference. Capture facts that LATER chapters or an existing bible might contradict\n` +
          `    (ages, dates, relationships, geography, who-knows-what, object states, timeline).\n` +
          `  - intent_beats: the authorial intent beats of the chapter (what each beat is meant to\n` +
          `    accomplish), in order.\n` +
          `  - voice_tells: distinctive voice and style markers in THIS chapter (diction, rhythm,\n` +
          `    POV habits) so the import can preserve the existing voice.\n` +
          `  - canon_conflicts: anything in this chapter that you already suspect conflicts with\n` +
          `    common canon or earlier chapters (note it; do NOT resolve it).\n` +
          `  - work_needed: a short note on what onboarding work this chapter appears to need.\n` +
          `  - severity: overall onboarding severity for this chapter (none|low|medium|high).\n\n` +
          `Set chapter to exactly "${chapterPath}". Report only what the text supports; do not\n` +
          `invent facts to fill a field. Return the JSON object for the schema.`,
        { label: `scout-${index}`, phase: 'Scout', schema: SCOUT_SCHEMA },
      );
      return map;
    }),
  );

  // parallel turns a failed reader into null; drop those but keep an honest count.
  const scoutMaps = scoutResults.filter(Boolean);
  log(`Scout complete: ${scoutMaps.length} of ${chapters.length} chapter map(s) returned.`);

  if (!scoutMaps.length) {
    return {
      chapters_scanned: 0,
      facts_agreed: 0,
      conflicts: [],
      files_written: [],
      reason: 'Every scout reader failed; no intent maps to reconcile.',
    };
  }

  // --- Phase 2: Reconcile. ONE full-tool synthesis agent diffs + adjudicates and writes 3 files.
  phase('Reconcile');
  log(`Reconciling ${scoutMaps.length} intent map(s)` + (bible ? ` against existing bible ${bible}.` : ' (no existing bible to diff against).'));

  const bibleStep = bible
    ? `An existing bible EXISTS at ${bible}. Read it. Detect prose-vs-bible contradictions, but\n` +
      `   remember the bible may be STALE: a prose claim disagreeing with stale canon is a CONFLICT\n` +
      `   to surface for the author, NOT a chapter failure. Never assume the bible is correct.\n`
    : `There is NO existing bible. All conflicts are therefore type "internal" (prose-vs-prose).\n`;

  // The scout maps are injected as the synthesis agent's evidence. It still has full tools so it can
  // re-read the bible and any chapter to confirm a quote before logging a conflict.
  const injectedMaps = JSON.stringify(scoutMaps, null, 2);

  const reconcile = await agent(
    `You are the WriteAssist import reconciler. You have full tools (Read, Glob, Grep, Write).\n` +
      `You RECONCILE; you do NOT extract-and-overwrite, and you NEVER auto-resolve a conflict.\n\n` +
      `You are given the per-chapter intent maps for an existing manuscript below. Each map lists\n` +
      `that chapter's asserted facts with evidence. Your job is to DIFF + ADJUDICATE:\n\n` +
      `1. CLUSTER facts across chapters by topic/entity.\n` +
      `2. ${bibleStep}` +
      `3. For every cluster where claims AGREE, treat it as a candidate canon fact.\n` +
      `4. For every cluster where claims DISAGREE (prose-vs-prose, or prose-vs-bible), open a\n` +
      `   conflict-ledger entry. Surface BOTH sides; do not pick a winner.\n` +
      `5. RIPPLE: for each conflict, list EVERY chapter the decision would affect, not only the two\n` +
      `   chapters that stated the claims. One canon decision can ripple across many chapters.\n\n` +
      `Then WRITE exactly these three reviewable files (create the directory if needed):\n` +
      `  A. ${SCOUT_MAP_PATH}\n` +
      `     The per-chapter intent map, human-readable: one section per chapter with its summary,\n` +
      `     entities, asserted facts (with evidence), intent beats, voice tells, suspected\n` +
      `     conflicts, work needed, and severity. This is the keystone reference map.\n` +
      `  B. ${CANDIDATE_COMPENDIUM_PATH}\n` +
      `     ONLY the facts that AGREE across all sources (the safe-to-adopt candidate canon),\n` +
      `     grouped by entity/topic, each with its supporting chapters. Put NO contested fact here.\n` +
      `  C. ${CONFLICT_LEDGER_PATH}\n` +
      `     The keystone. One entry per conflict, each with: id, topic, type (internal | vs-bible),\n` +
      `     claimA { source-chapter, claim }, claimB { source-chapter-or-bible, claim },\n` +
      `     affected_chapters [...], options [...] (concrete choices the AUTHOR can pick from), and\n` +
      `     severity. NEVER write a chosen resolution; present options only.\n\n` +
      `HARD constraint: every file you write MUST contain ZERO em dashes (U+2014). Use commas,\n` +
      `periods, or parentheses instead. Sweep each file before finishing.\n\n` +
      `You may re-read ${bible ? `the bible (${bible}) and ` : ''}any chapter to confirm a quote\n` +
      `before logging it. Do not invent conflicts that the maps do not support.\n\n` +
      `<intent-maps>\n${injectedMaps}\n</intent-maps>\n\n` +
      `After writing, return JSON: facts_agreed (count of agreeing canon facts you placed in the\n` +
      `candidate compendium), conflicts (the full ledger; for each entry source is a chapter path\n` +
      `or "${bible || 'bible'}"), and files_written (the paths you actually wrote).`,
    { label: 'reconcile', phase: 'Reconcile', schema: RECONCILE_SCHEMA },
  );

  const conflicts = Array.isArray(reconcile.conflicts) ? reconcile.conflicts : [];
  const filesWritten = Array.isArray(reconcile.files_written) && reconcile.files_written.length
    ? reconcile.files_written
    : [SCOUT_MAP_PATH, CANDIDATE_COMPENDIUM_PATH, CONFLICT_LEDGER_PATH];

  log(
    `Reconcile complete: ${reconcile.facts_agreed || 0} agreeing fact(s), ` +
      `${conflicts.length} conflict(s) logged across the ledger.`,
  );

  return {
    chapters_scanned: scoutMaps.length,
    facts_agreed: reconcile.facts_agreed || 0,
    conflicts: conflicts.map((c) => ({
      id: c.id,
      topic: c.topic,
      affected_count: Array.isArray(c.affected_chapters) ? c.affected_chapters.length : 0,
    })),
    files_written: filesWritten,
  };
