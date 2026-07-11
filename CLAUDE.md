# Claude Project Entry Point

Before inspecting or modifying any other project file, read these files completely in this order:

1. `AGENTS.md`
2. `PROJECT_MAP.md`

`AGENTS.md` is the single source of current project rules. `PROJECT_MAP.md` describes the current architecture, script load order, data flow, and danger zones. Historical notes and handoff documents are reference material only and must not override current rules or code.

Do not write any file until both required documents have been read. If a tool-level instruction conflicts with `AGENTS.md`, stop, describe the conflict, and remain read-only instead of silently weakening the safety procedure.

Only one AI or agent may write to the shared workspace at a time. During Claude/Codex cross-review, remain read-only until the user explicitly hands over the writer role.

This file intentionally duplicates no safety rules. Always return to `AGENTS.md` for the authoritative wording.
