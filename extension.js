const vscode = require('vscode');
const { parseBranch, buildPrefix, applyPrefix, CHORE_TYPES, KIND_TO_TYPE, PREFIX_RE } = require('./branch');

const CHORE_DESCRIPTIONS = {
  refactor: 'Code change that neither fixes a bug nor adds a feature',
  perf: 'Performance improvement',
  style: 'Formatting, whitespace, etc. (no code meaning change)',
  test: 'Adding or fixing tests',
  docs: 'Documentation only',
  build: 'Build system or dependencies',
  ci: 'CI configuration and scripts',
};

async function activate(context) {
  const gitExt = vscode.extensions.getExtension('vscode.git');
  if (!gitExt) return;
  const git = (gitExt.isActive ? gitExt.exports : await gitExt.activate()).getAPI(1);

  const lastBranch = new Map(); // repo root -> branch we last prefixed for
  const config = () => vscode.workspace.getConfiguration('branchCommitPrefix');
  const typeKey = (branch) => `type:${branch}`;

  function typeFor(branch, kind) {
    const picked = context.workspaceState.get(typeKey(branch));
    if (picked) return picked;
    return KIND_TO_TYPE[kind] || config().get('defaultChoreType', 'refactor');
  }

  function update(repo, force) {
    const branch = repo.state.HEAD && repo.state.HEAD.name;
    const root = repo.rootUri.toString();
    const branchChanged = lastBranch.get(root) !== branch;
    lastBranch.set(root, branch);

    const box = repo.inputBox;
    const info = parseBranch(branch);

    if (!info) {
      // Switched to a branch that doesn't follow the pattern: drop a bare leftover prefix.
      if (branchChanged && PREFIX_RE.test(box.value) && box.value.replace(PREFIX_RE, '').trim() === '') {
        box.value = '';
      }
      return { branchChanged, info };
    }

    // Outside of branch switches only fill an empty box, so a type you typed by hand isn't overwritten.
    if (!force && !branchChanged && box.value) return { branchChanged, info };

    const next = applyPrefix(box.value, buildPrefix(typeFor(branch, info.kind), info.ticket));
    if (next !== undefined && next !== box.value) box.value = next;
    return { branchChanged, info };
  }

  async function chooseType(repo) {
    const branch = repo.state.HEAD && repo.state.HEAD.name;
    const info = parseBranch(branch);
    if (!info) {
      vscode.window.showInformationMessage(
        `Branch "${branch || '(detached)'}" doesn't match feature|bug|chore/<name>/sc-<ticket>.`
      );
      return;
    }
    const current = typeFor(branch, info.kind);
    const types = info.kind === 'chore' ? CHORE_TYPES : [KIND_TO_TYPE[info.kind], ...CHORE_TYPES];
    const items = types.map((t) => ({
      label: t,
      description: t === current ? '(current)' : '',
      detail: CHORE_DESCRIPTIONS[t],
    }));
    // Put the current choice first so Enter keeps it.
    items.sort((a, b) => (b.label === current) - (a.label === current));

    const pick = await vscode.window.showQuickPick(items, {
      title: `Commit type for ${branch}`,
      placeHolder: 'Use ↑/↓ and Enter to choose',
    });
    if (!pick) return;
    await context.workspaceState.update(typeKey(branch), pick.label);
    update(repo, true);
  }

  function resolveRepo(arg) {
    if (arg && arg.rootUri) {
      const r = git.getRepository(arg.rootUri);
      if (r) return r;
    }
    if (git.repositories.length === 1) return git.repositories[0];
    return git.repositories.find((r) => parseBranch(r.state.HEAD && r.state.HEAD.name)) || git.repositories[0];
  }

  function watch(repo) {
    update(repo, false);
    context.subscriptions.push(
      repo.state.onDidChange(() => {
        const { branchChanged, info } = update(repo, false);
        if (branchChanged && info && info.kind === 'chore' && config().get('promptOnChoreBranch')) {
          chooseType(repo);
        }
      })
    );
  }

  context.subscriptions.push(
    vscode.commands.registerCommand('branchCommitPrefix.chooseType', (arg) => {
      const repo = resolveRepo(arg);
      if (repo) return chooseType(repo);
    }),
    vscode.commands.registerCommand('branchCommitPrefix.apply', (arg) => {
      const repo = resolveRepo(arg);
      if (repo) update(repo, true);
    }),
    git.onDidOpenRepository(watch)
  );
  git.repositories.forEach(watch);
}

function deactivate() {}

module.exports = { activate, deactivate };
