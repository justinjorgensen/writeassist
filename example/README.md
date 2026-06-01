# Example: A Synthetic Walkthrough

This directory is a small, **synthetic, illustrative** demo of one trip through the
WRP pipeline. It exists so that someone who does not want to run anything can still
see the shape of the inputs and outputs: a filled project config, one chapter WRP,
and the short chapter that follows from it.

## What this is

- `project-config.md` filled in for a tiny made-up project ("The Lighthouse Keeper").
- `chapter_01_WRP.md` in the same style as `05-wrp/`, planning a single short scene.
- `Chapter-01.md`, a short chapter consistent with that WRP.

## What this is NOT

- It is **not** claimed to "pass the panel." The critic panel is a qualitative,
  non-deterministic stopping heuristic, so no fixture can promise it will pass.
- It is **not** generated live; it is a hand-authored sample for illustration.

## The one hard guarantee

Every file here contains **zero em dashes**. That is the deterministic, checkable
property the framework actually enforces. You can verify it yourself:

```
python3 - <<'PY'
import pathlib
em = chr(0x2014)  # the em dash character, built by codepoint
for p in pathlib.Path("example").glob("*.md"):
    has = em in p.read_text()
    print(p, "HAS EM DASH" if has else "OK")
PY
```

The chapter and the WRP are deliberately tiny so the demo stays readable.
