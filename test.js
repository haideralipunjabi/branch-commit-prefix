const assert = require('assert');
const { parseBranch, buildPrefix, applyPrefix } = require('./branch');

assert.deepStrictEqual(parseBranch('feature/haider/sc-1234'), { kind: 'feature', ticket: '1234' });
assert.deepStrictEqual(parseBranch('bug/haider/sc-42'), { kind: 'bug', ticket: '42' });
assert.deepStrictEqual(parseBranch('chore/haider/sc-7-cleanup'), { kind: 'chore', ticket: '7' });
assert.strictEqual(parseBranch('main'), undefined);
assert.strictEqual(parseBranch('feature/sc-1'), undefined);
assert.strictEqual(parseBranch(undefined), undefined);

assert.strictEqual(buildPrefix('feat', '1234'), '[feat] 1234: ');
assert.strictEqual(applyPrefix('', '[feat] 1: '), '[feat] 1: ');
assert.strictEqual(applyPrefix('[refactor] 1: tidy up', '[perf] 1: '), '[perf] 1: tidy up');
assert.strictEqual(applyPrefix('my own message', '[feat] 1: '), undefined);

console.log('all tests passed');
