#!/usr/bin/env bash
# PreToolUse hook (matcher: Write|Edit|MultiEdit).
# Delegates to em-dash-check.py, which reads the hook JSON payload directly from STDIN.
# This avoids passing large chapter-length Write payloads through an environment variable
# or argv (OS size limits), and keeps the no-heredoc/stdin-collision property.
exec python3 "$(dirname "${BASH_SOURCE[0]}")/em-dash-check.py"
