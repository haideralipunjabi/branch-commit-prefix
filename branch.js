// Pure helpers (no vscode import) so they can be tested with plain node.

const BRANCH_RE = /^(feature|bug|chore)\/[^/]+\/sc-(\d+)/i;
const PREFIX_RE = /^\[[a-z]+\] \d+: ?/i;
const CHORE_TYPES = ['refactor', 'perf', 'style', 'test', 'docs', 'build', 'ci'];
const KIND_TO_TYPE = { feature: 'feat', bug: 'fix' };

function parseBranch(name) {
  const m = BRANCH_RE.exec(name || '');
  if (!m) return undefined;
  return { kind: m[1].toLowerCase(), ticket: m[2] };
}

function buildPrefix(type, ticket) {
  return `[${type}] ${ticket}: `;
}

// Puts `prefix` at the start of `message`, swapping out an existing prefix.
// Returns undefined when the message has user text without a prefix (leave it alone).
function applyPrefix(message, prefix) {
  if (!message) return prefix;
  if (PREFIX_RE.test(message)) return message.replace(PREFIX_RE, prefix);
  return undefined;
}

module.exports = { parseBranch, buildPrefix, applyPrefix, CHORE_TYPES, KIND_TO_TYPE, PREFIX_RE };
