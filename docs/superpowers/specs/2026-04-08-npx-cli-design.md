# Design: npx CLI for houtu-project-skills

**Date:** 2026-04-08
**Status:** Approved

---

## Overview

A lightweight Node.js CLI published to npm as `houtu-project-skills`. Users run it via `npx` to install skills from the GitHub repository into their AI coding tool's skills directory. The script has zero runtime dependencies and fetches skill files fresh from GitHub on each install using git sparse checkout.

---

## Project Structure

```
houtu-project-skills/
├── cli/
│   └── cli.js          # CLI entry point
├── skills/             # Skill files (unchanged)
├── package.json        # name, version, bin field
├── README.md
└── .gitignore
```

`package.json` `bin` field points to `cli/cli.js`. Running `npx houtu-project-skills` invokes this file directly.

---

## Commands

### install

```bash
npx houtu-project-skills install <skill> --tool <tool-name>
npx houtu-project-skills install <skill> --tool <tool-name> --global
```

Installs the named skill into the specified AI tool's skills directory.

- Default scope: **project-level** (relative to current working directory)
- `--global` flag: installs to the tool's global skills directory

### list

```bash
npx houtu-project-skills list
```

Fetches the `skills/` directory listing from GitHub API and prints available skill names. Falls back to printing the repository URL if the API request fails.

---

## Tool Name Mapping

| `--tool` value | Project path | Global path |
|---|---|---|
| `claude` | `.claude/skills/` | `~/.claude/skills/` |
| `codex` | `.agents/skills/` | `~/.agents/skills/` |
| `opencode` | `.opencode/skills/` | `~/.config/opencode/skills/` |
| `antigravity` | `.agent/skills/` | `~/.gemini/antigravity/skills/` |
| `cursor` | `.cursor/skills/` | `~/.cursor/skills/` |
| `trae` | `.trae/skills/` | `~/.trae/skills/` |
| `qoder` | `.qoder/skills/` | `~/.qoder/skills/` |

---

## Install Flow

1. Parse `<skill>`, `--tool`, `--global` from `process.argv`
2. Resolve target directory (project or global path for the given tool)
3. Check if target directory already exists — if so, print a skip message and exit
4. Create a system temp directory for the sparse clone
5. Run: `git clone --depth 1 --filter=blob:none --sparse <repo-url> <tmpdir>`
6. Run: `git -C <tmpdir> sparse-checkout set skills/<skill>`
7. Copy `<tmpdir>/skills/<skill>/` to the target directory
8. Delete the temp directory
9. Print success message with the install path

---

## Error Handling

| Condition | Behavior |
|---|---|
| `git` not found on PATH | Print "git is required. Please install git first." and exit 1 |
| Unknown `--tool` value | Print supported tool names and exit 1 |
| Target directory already exists | Print "Already installed at <path>. Remove it first to reinstall." and exit 0 |
| `git clone` fails | Print git stderr output and exit 1 |
| `list` GitHub API fails | Print "Could not fetch skill list. Visit: https://github.com/lujiafa/houtu-project-skills" |

---

## Implementation Notes

- Zero npm dependencies — uses only Node.js built-ins: `child_process`, `fs`, `path`, `os`, `https`
- `execSync` for git commands with `stdio: 'inherit'` so git output is visible
- `os.tmpdir()` for the temporary clone directory, cleaned up with `fs.rmSync(..., { recursive: true })` after copy
- Home directory resolved via `os.homedir()`
- Repository URL: `https://github.com/lujiafa/houtu-project-skills.git`
