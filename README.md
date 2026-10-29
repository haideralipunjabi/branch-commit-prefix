# Branch Commit Prefix

Pre-fills the Source Control commit message box based on the current branch:

| Branch                      | Commit message starts with |
| --------------------------- | -------------------------- |
| `feature/<dev>/sc-<ticket>` | `[feat] <ticket>: `        |
| `bug/<dev>/sc-<ticket>`     | `[fix] <ticket>: `         |
| `chore/<dev>/sc-<ticket>`   | `[refactor] <ticket>: `    |

For chore branches, click the tag icon in the Source Control title bar (or run
**Branch Commit Prefix: Choose Commit Type**) and pick with the arrow keys:
`refactor`, `perf`, `style`, `test`, `docs`, `build`, `ci`. The choice is
remembered per branch.

## Settings

- `branchCommitPrefix.defaultChoreType` — default type for chore branches (`refactor`).
- `branchCommitPrefix.promptOnChoreBranch` — open the picker automatically when switching to a chore branch (off by default).

## Install

Download the `.vsix` from the latest GitHub Release, then run:

```
code --install-extension branch-commit-prefix-0.1.0.vsix
```

**Remote (SSH / WSL / containers):** run that command in a VS Code terminal
connected to the remote, or use *Extensions → ⋯ → Install from VSIX…* in the
remote window. The extension runs on the remote host, next to Git.

## Build

```
npx @vscode/vsce package --allow-missing-repository
```
