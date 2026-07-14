# Release-Only Tag Publishing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 提供 `npm run release -- vX.Y.Z`，用不属于 `main` 的发布专用提交保存根目录 userscript，使 GitHub Release Asset 和 Greasy Fork Release webhook 同时可靠工作。

**Architecture:** 本地 Node.js 发布命令在临时 detached worktree 中注入版本、测试并构建，再通过独立 Git index 和 Git plumbing 创建相对 `main` 只新增根目录 userscript 的发布提交。annotated tag 指向该提交并单独推送；现有 tag 工作流重建产物、与 tag 文件逐字节比较后创建 GitHub Release，Greasy Fork 再从 tag 文件树读取同名脚本。

**Tech Stack:** Node.js 22、Node test runner、Rollup、Git plumbing、GitHub Actions、GitHub CLI

## Global Constraints

- `main` 只保存源码、测试和工作流，不跟踪 `dist/` 或根目录 `Zhihu-Beautification.user.js`。
- `src/meta.txt` 在 `main` 和发布专用提交中都保持 `0.0.0`；只有构建后的根目录 userscript 使用发布版本。
- Greasy Fork 同步 URL 固定为 `https://github.com/wangkezun/zhihu-beautification/releases/latest/download/Zhihu-Beautification.user.js`。
- GitHub Webhook 保持 Active，并且只订阅 Release 事件。
- 发布 tag 必须使用 `vX.Y.Z`，创建后不得删除、移动或强制更新。
- 发布命令只推送新 tag，不推送或修改 `main`，也不创建长期发布分支。
- GitHub Actions 不执行 `git commit`、`git push`、`git tag` 或任何强制操作。
- 保留现有 `v4.0.3`、`v4.0.4` tag 和 Release，不删除、不移动。
- tag 推送成功后的失败必须通过更高的新版本修复，不得复用旧 tag。

---

### Task 1: 可单测的发布规则辅助函数

**Files:**
- Create: `scripts/release-helpers.js`
- Create: `test/release-helpers.test.js`

**Interfaces:**
- Consumes: Task 0 已有的 `versionFromTag(tag): string`。
- Produces: `compareReleaseTags(left, right): number`、`latestReleaseTag(tags): string | null`、`selectReleaseParents(head, previousCommit, previousIsAncestor): string[]`、`metadataVersion(userscript): string`、`assertReleaseDiff(diff, artifactPath): void`。

- [ ] **Step 1: 写语义版本、父提交和产物约束的失败测试**

创建 `test/release-helpers.test.js`：

```js
import assert from 'node:assert/strict'
import test from 'node:test'

import {
  assertReleaseDiff,
  compareReleaseTags,
  latestReleaseTag,
  metadataVersion,
  selectReleaseParents,
} from '../scripts/release-helpers.js'

test('按数字而不是字符串比较发布 tag', () => {
  assert.equal(compareReleaseTags('v4.0.10', 'v4.0.9'), 1)
  assert.equal(compareReleaseTags('v4.0.9', 'v4.0.10'), -1)
  assert.equal(compareReleaseTags('v4.0.10', 'v4.0.10'), 0)
})

test('只从有效发布 tag 中选择最高版本', () => {
  assert.equal(latestReleaseTag(['latest', 'v4.0.9', 'v4.0.10', 'v3.9.99']), 'v4.0.10')
  assert.equal(latestReleaseTag(['latest', 'release']), null)
})

test('上一发布已是 main 祖先时只保留 main 父提交', () => {
  assert.deepEqual(selectReleaseParents('main-sha', 'previous-sha', true), ['main-sha'])
})

test('上一发布不是 main 祖先时把它加入第二父提交', () => {
  assert.deepEqual(selectReleaseParents('main-sha', 'previous-sha', false), [
    'main-sha',
    'previous-sha',
  ])
  assert.deepEqual(selectReleaseParents('main-sha', null, false), ['main-sha'])
})

test('读取唯一的 userscript version', () => {
  assert.equal(metadataVersion('// @name test\n// @version      4.0.5\n'), '4.0.5')
  assert.throws(() => metadataVersion('// @name test\n'), /exactly one @version/)
  assert.throws(
    () => metadataVersion('// @version 4.0.5\n// @version 4.0.6\n'),
    /exactly one @version/,
  )
})

test('发布提交相对 main 只能新增根目录 userscript', () => {
  assert.doesNotThrow(() =>
    assertReleaseDiff('A\tZhihu-Beautification.user.js\n', 'Zhihu-Beautification.user.js'),
  )
  assert.throws(
    () =>
      assertReleaseDiff(
        'M\tsrc/meta.txt\nA\tZhihu-Beautification.user.js\n',
        'Zhihu-Beautification.user.js',
      ),
    /must only add/,
  )
})
```

- [ ] **Step 2: 运行测试并确认模块缺失失败**

Run: `node --test test/release-helpers.test.js`

Expected: FAIL，错误包含 `ERR_MODULE_NOT_FOUND` 和 `scripts/release-helpers.js`。

- [ ] **Step 3: 实现最小辅助函数**

创建 `scripts/release-helpers.js`：

```js
import { versionFromTag } from './set-release-version.js'

const ARTIFACT_DIFF = (artifactPath) => `A\t${artifactPath}\n`

function versionParts(tag) {
  return versionFromTag(tag).split('.').map((part) => BigInt(part))
}

export function compareReleaseTags(left, right) {
  const leftParts = versionParts(left)
  const rightParts = versionParts(right)
  for (let index = 0; index < leftParts.length; index += 1) {
    if (leftParts[index] > rightParts[index]) return 1
    if (leftParts[index] < rightParts[index]) return -1
  }
  return 0
}

export function latestReleaseTag(tags) {
  const validTags = tags.filter((tag) => {
    try {
      versionFromTag(tag)
      return true
    } catch {
      return false
    }
  })
  if (validTags.length === 0) return null
  return validTags.sort(compareReleaseTags).at(-1)
}

export function selectReleaseParents(head, previousCommit, previousIsAncestor) {
  if (!previousCommit || previousIsAncestor) return [head]
  return [head, previousCommit]
}

export function metadataVersion(userscript) {
  const matches = [...userscript.matchAll(/^\/\/ @version\s+(\S+)\s*$/gm)]
  if (matches.length !== 1) {
    throw new Error('Expected exactly one @version metadata line')
  }
  return matches[0][1]
}

export function assertReleaseDiff(diff, artifactPath) {
  if (diff !== ARTIFACT_DIFF(artifactPath)) {
    throw new Error(`Release commit must only add ${artifactPath}`)
  }
}
```

- [ ] **Step 4: 运行定向与全量测试**

Run: `node --test test/release-helpers.test.js && npm test`

Expected: 新增 6 个测试通过；全量测试 0 fail。

- [ ] **Step 5: 提交发布规则辅助函数**

```bash
git add scripts/release-helpers.js test/release-helpers.test.js
git commit -m "test: define release-only tag rules"
```

### Task 2: 本地发布命令与发布专用提交

**Files:**
- Create: `scripts/create-release.js`
- Create: `test/create-release.test.js`
- Modify: `package.json`

**Interfaces:**
- Consumes: Task 1 的辅助函数和已有 `scripts/set-release-version.js` CLI。
- Produces: CLI `npm run release -- vX.Y.Z`；创建发布专用提交和 annotated tag，并执行 `git push origin refs/tags/vX.Y.Z`。

- [ ] **Step 1: 写真实临时 Git 仓库的失败集成测试**

创建 `test/create-release.test.js`：

```js
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import test from 'node:test'

const releaseScript = resolve('scripts/create-release.js')

function run(file, args, cwd, options = {}) {
  return execFileSync(file, args, {
    cwd,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
    ...options,
  }).trim()
}

function git(cwd, ...args) {
  return run('git', args, cwd)
}

function write(path, contents) {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, contents)
}

function createFixture() {
  const root = mkdtempSync(join(tmpdir(), 'release-only-tag-test-'))
  const remote = join(root, 'remote.git')
  const repo = join(root, 'repo')
  mkdirSync(repo)
  run('git', ['init', '--bare', remote], root)
  run('git', ['init', '-b', 'main'], repo)
  git(repo, 'config', 'user.name', 'Release Test')
  git(repo, 'config', 'user.email', 'release-test@example.com')

  write(
    join(repo, 'package.json'),
    JSON.stringify(
      {
        name: 'release-fixture',
        type: 'module',
        scripts: {
          test: 'node -e "process.exit(0)"',
          build: 'node build.js',
        },
      },
      null,
      2,
    ) + '\n',
  )
  write(
    join(repo, 'package-lock.json'),
    JSON.stringify(
      {
        name: 'release-fixture',
        lockfileVersion: 3,
        requires: true,
        packages: { '': { name: 'release-fixture' } },
      },
      null,
      2,
    ) + '\n',
  )
  write(
    join(repo, 'src/meta.txt'),
    '// ==UserScript==\n// @name fixture\n// @version      0.0.0\n// ==/UserScript==\n',
  )
  write(
    join(repo, 'build.js'),
    "import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'\n" +
      "mkdirSync('dist', { recursive: true })\n" +
      "writeFileSync('dist/Zhihu-Beautification.user.js', readFileSync('src/meta.txt', 'utf8') + 'console.log(\\\"fixture\\\")\\n')\n",
  )
  write(
    join(repo, 'scripts/set-release-version.js'),
    "import { readFileSync, writeFileSync } from 'node:fs'\n" +
      "const [, , tag, path] = process.argv\n" +
      "const version = /^v(\\d+\\.\\d+\\.\\d+)$/.exec(tag)?.[1]\n" +
      "if (!version) throw new Error('Invalid release tag')\n" +
      "writeFileSync(path, readFileSync(path, 'utf8').replace(/^\\/\\/ @version\\s+.*$/m, `// @version      ${version}`))\n",
  )
  write(join(repo, '.gitignore'), 'node_modules/\ndist/\nZhihu-Beautification.user.js\n')

  git(repo, 'add', '.')
  git(repo, 'commit', '-m', 'initial')
  git(repo, 'remote', 'add', 'origin', remote)
  git(repo, 'push', '-u', 'origin', 'main')
  return { root, remote, repo }
}

test('发布命令只推送包含根目录产物的 annotated tag', () => {
  const fixture = createFixture()
  try {
    const mainBefore = git(fixture.repo, 'rev-parse', 'HEAD')
    run(process.execPath, [releaseScript, 'v1.0.0'], fixture.repo)

    assert.equal(git(fixture.repo, 'rev-parse', 'HEAD'), mainBefore)
    assert.equal(git(fixture.repo, 'status', '--porcelain'), '')
    assert.equal(git(fixture.repo, 'cat-file', '-t', 'v1.0.0'), 'tag')
    assert.equal(git(fixture.repo, 'rev-parse', 'v1.0.0^1'), mainBefore)
    assert.equal(
      git(fixture.repo, 'diff', '--name-status', 'v1.0.0^1', 'v1.0.0^{}'),
      'A\tZhihu-Beautification.user.js',
    )
    assert.match(
      run('git', ['show', 'refs/tags/v1.0.0:Zhihu-Beautification.user.js'], fixture.repo),
      /@version\s+1\.0\.0/,
    )
    assert.notEqual(
      run('git', ['ls-remote', fixture.remote, 'refs/tags/v1.0.0'], fixture.repo),
      '',
    )
  } finally {
    rmSync(fixture.root, { recursive: true, force: true })
  }
})

test('后续发布把上一发布提交作为必要的第二父提交', () => {
  const fixture = createFixture()
  try {
    run(process.execPath, [releaseScript, 'v1.0.0'], fixture.repo)
    write(join(fixture.repo, 'README.md'), 'next release\n')
    git(fixture.repo, 'add', 'README.md')
    git(fixture.repo, 'commit', '-m', 'next change')
    git(fixture.repo, 'push', 'origin', 'main')

    const mainHead = git(fixture.repo, 'rev-parse', 'HEAD')
    run(process.execPath, [releaseScript, 'v1.0.1'], fixture.repo)
    const parents = git(fixture.repo, 'show', '-s', '--format=%P', 'v1.0.1^{}').split(' ')

    assert.equal(parents[0], mainHead)
    assert.equal(parents[1], git(fixture.repo, 'rev-parse', 'v1.0.0^{}'))
    assert.equal(
      spawnSync('git', ['merge-base', '--is-ancestor', 'v1.0.0^{}', 'v1.0.1^{}'], {
        cwd: fixture.repo,
      }).status,
      0,
    )
  } finally {
    rmSync(fixture.root, { recursive: true, force: true })
  }
})

test('脏工作区不会创建或推送 tag', () => {
  const fixture = createFixture()
  try {
    write(join(fixture.repo, 'dirty.txt'), 'dirty\n')
    const result = spawnSync(process.execPath, [releaseScript, 'v1.0.0'], {
      cwd: fixture.repo,
      encoding: 'utf8',
    })

    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /clean worktree and index/)
    assert.equal(
      run('git', ['ls-remote', fixture.remote, 'refs/tags/v1.0.0'], fixture.repo),
      '',
    )
  } finally {
    rmSync(fixture.root, { recursive: true, force: true })
  }
})

test('已有 tag 不会被覆盖且版本必须递增', () => {
  const fixture = createFixture()
  try {
    run(process.execPath, [releaseScript, 'v2.0.0'], fixture.repo)
    const originalTag = run(
      'git',
      ['ls-remote', fixture.remote, 'refs/tags/v2.0.0'],
      fixture.repo,
    )

    const duplicate = spawnSync(process.execPath, [releaseScript, 'v2.0.0'], {
      cwd: fixture.repo,
      encoding: 'utf8',
    })
    const rollback = spawnSync(process.execPath, [releaseScript, 'v1.9.9'], {
      cwd: fixture.repo,
      encoding: 'utf8',
    })

    assert.notEqual(duplicate.status, 0)
    assert.match(duplicate.stderr, /already exists/)
    assert.notEqual(rollback.status, 0)
    assert.match(rollback.stderr, /must be greater than v2\.0\.0/)
    assert.equal(
      run('git', ['ls-remote', fixture.remote, 'refs/tags/v2.0.0'], fixture.repo),
      originalTag,
    )
    assert.equal(
      run('git', ['ls-remote', fixture.remote, 'refs/tags/v1.9.9'], fixture.repo),
      '',
    )
  } finally {
    rmSync(fixture.root, { recursive: true, force: true })
  }
})

test('构建失败不会创建或推送 tag', () => {
  const fixture = createFixture()
  try {
    const packagePath = join(fixture.repo, 'package.json')
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'))
    packageJson.scripts.build = 'node -e "process.exit(1)"'
    write(packagePath, JSON.stringify(packageJson, null, 2) + '\n')
    git(fixture.repo, 'add', 'package.json')
    git(fixture.repo, 'commit', '-m', 'break build')
    git(fixture.repo, 'push', 'origin', 'main')

    const result = spawnSync(process.execPath, [releaseScript, 'v1.0.0'], {
      cwd: fixture.repo,
      encoding: 'utf8',
    })

    assert.notEqual(result.status, 0)
    assert.equal(
      run('git', ['ls-remote', fixture.remote, 'refs/tags/v1.0.0'], fixture.repo),
      '',
    )
  } finally {
    rmSync(fixture.root, { recursive: true, force: true })
  }
})
```

- [ ] **Step 2: 运行测试并确认 CLI 缺失失败**

Run: `node --test test/create-release.test.js`

Expected: FAIL，错误指出 `scripts/create-release.js` 不存在或子进程退出非零。

- [ ] **Step 3: 实现发布 CLI**

创建 `scripts/create-release.js`：

```js
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

import {
  assertReleaseDiff,
  compareReleaseTags,
  latestReleaseTag,
  metadataVersion,
  selectReleaseParents,
} from './release-helpers.js'
import { versionFromTag } from './set-release-version.js'

const ARTIFACT = 'Zhihu-Beautification.user.js'

function run(file, args, { cwd, env = process.env, input, trim = true, stdio } = {}) {
  try {
    const output = execFileSync(file, args, {
      cwd,
      env,
      input,
      encoding: 'utf8',
      stdio: stdio || ['pipe', 'pipe', 'pipe'],
    })
    if (output === null || output === undefined) return ''
    return trim ? output.trim() : output
  } catch (error) {
    const detail = error.stderr?.toString().trim() || error.message
    throw new Error(`${file} ${args.join(' ')} failed: ${detail}`)
  }
}

function git(repo, args, options = {}) {
  return run('git', args, { cwd: repo, ...options })
}

function isAncestor(repo, ancestor, descendant) {
  const result = spawnSync('git', ['merge-base', '--is-ancestor', ancestor, descendant], {
    cwd: repo,
    stdio: 'ignore',
  })
  if (result.status === 0) return true
  if (result.status === 1) return false
  throw new Error('git merge-base --is-ancestor failed')
}

function verifyCleanMain(repo, remote) {
  git(repo, ['fetch', remote, `+refs/heads/main:refs/remotes/${remote}/main`, '--tags'])
  if (git(repo, ['branch', '--show-current']) !== 'main') {
    throw new Error('Release must run from main')
  }
  if (git(repo, ['status', '--porcelain']) !== '') {
    throw new Error('Release requires a clean worktree and index')
  }
  const head = git(repo, ['rev-parse', 'HEAD'])
  const remoteMain = git(repo, ['rev-parse', `${remote}/main`])
  if (head !== remoteMain) {
    throw new Error(`HEAD (${head}) must equal ${remote}/main (${remoteMain})`)
  }
  return head
}

export function createRelease(tag, { cwd = process.cwd(), remote = 'origin' } = {}) {
  const version = versionFromTag(tag)
  const repo = git(cwd, ['rev-parse', '--show-toplevel'])
  const head = verifyCleanMain(repo, remote)
  const tags = git(repo, ['tag', '--list']).split('\n').filter(Boolean)
  if (tags.includes(tag)) throw new Error(`Release tag already exists: ${tag}`)

  const previousTag = latestReleaseTag(tags)
  if (previousTag && compareReleaseTags(tag, previousTag) <= 0) {
    throw new Error(`Release tag ${tag} must be greater than ${previousTag}`)
  }

  const tempRoot = mkdtempSync(join(tmpdir(), 'zhihu-release-'))
  const worktree = join(tempRoot, 'worktree')
  const indexPath = join(tempRoot, 'release-index')
  let worktreeAdded = false
  let worktreeCleanupFailed = false

  try {
    git(repo, ['worktree', 'add', '--detach', worktree, head])
    worktreeAdded = true
    run('npm', ['ci'], { cwd: worktree, stdio: 'inherit' })
    run(process.execPath, ['scripts/set-release-version.js', tag, 'src/meta.txt'], {
      cwd: worktree,
      stdio: 'inherit',
    })
    run('npm', ['test'], { cwd: worktree, stdio: 'inherit' })
    run('npm', ['run', 'build'], { cwd: worktree, stdio: 'inherit' })

    const artifactPath = join(worktree, 'dist', ARTIFACT)
    const artifact = readFileSync(artifactPath, 'utf8')
    if (metadataVersion(artifact) !== version) {
      throw new Error(`Built artifact version must equal ${version}`)
    }

    const indexEnv = { ...process.env, GIT_INDEX_FILE: indexPath }
    git(repo, ['read-tree', head], { env: indexEnv })
    const blob = git(repo, ['hash-object', '-w', '--stdin'], { input: artifact })
    git(repo, ['update-index', '--add', '--cacheinfo', `100644,${blob},${ARTIFACT}`], {
      env: indexEnv,
    })
    const tree = git(repo, ['write-tree'], { env: indexEnv })

    const previousCommit = previousTag ? git(repo, ['rev-parse', `${previousTag}^{}`]) : null
    const previousIsAncestor = previousCommit
      ? isAncestor(repo, previousCommit, head)
      : false
    const parents = selectReleaseParents(head, previousCommit, previousIsAncestor)
    const commitArgs = ['commit-tree', tree]
    for (const parent of parents) commitArgs.push('-p', parent)
    const releaseCommit = git(repo, commitArgs, { input: `release: ${tag}\n` })

    assertReleaseDiff(git(repo, ['diff', '--name-status', head, releaseCommit], { trim: false }), ARTIFACT)
    if (git(repo, ['rev-parse', `${releaseCommit}^1`]) !== head) {
      throw new Error('Release commit first parent must equal main HEAD')
    }
    const taggedArtifact = git(repo, ['show', `${releaseCommit}:${ARTIFACT}`], { trim: false })
    if (taggedArtifact !== artifact) throw new Error('Tagged artifact must equal the local build')
    if (metadataVersion(taggedArtifact) !== version) {
      throw new Error(`Tagged artifact version must equal ${version}`)
    }

    git(repo, ['tag', '-a', tag, releaseCommit, '-m', tag])
    if (git(repo, ['rev-parse', `${tag}^{}`]) !== releaseCommit) {
      throw new Error(`Annotated tag ${tag} does not point to the release commit`)
    }

    try {
      git(repo, ['push', remote, `refs/tags/${tag}`], { stdio: 'inherit' })
    } catch (error) {
      throw new Error(`${error.message}\nLocal tag ${tag} was retained; retry with: git push ${remote} refs/tags/${tag}`)
    }
    process.stdout.write(`Published ${tag} from main ${head}\n`)
  } finally {
    if (worktreeAdded) {
      try {
        git(repo, ['worktree', 'remove', '--force', worktree])
      } catch (error) {
        worktreeCleanupFailed = true
        process.stderr.write(`${error.message}\nTemporary worktree retained at ${worktree}\n`)
      }
    }
    if (!worktreeCleanupFailed) rmSync(tempRoot, { recursive: true, force: true })
  }
}

function main() {
  const [, , tag] = process.argv
  if (!tag) throw new Error('Usage: npm run release -- vX.Y.Z')
  createRelease(tag)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main()
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
```

- [ ] **Step 4: 在 package.json 注册 release 命令**

在 `package.json` 的 `scripts` 中加入：

```json
"release": "node scripts/create-release.js"
```

- [ ] **Step 5: 运行定向测试并修正实现错误**

Run: `node --test test/create-release.test.js`

Expected: 5 tests pass，0 fail；成功用例的裸远端收到 tag，但 fixture 的 `main` SHA 与工作区保持不变；失败用例不创建或移动远端 tag。

- [ ] **Step 6: 运行完整测试与静态差异检查**

Run: `npm test && git diff --check`

Expected: 所有测试通过，`git diff --check` 无输出。

- [ ] **Step 7: 提交本地发布命令**

```bash
git add package.json scripts/create-release.js test/create-release.test.js
git commit -m "feat: create release-only tags locally"
```

### Task 3: CI 校验 tag 产物与重建产物一致

**Files:**
- Modify: `.github/workflows/release.yml`
- Modify: `test/release-workflow.test.js`

**Interfaces:**
- Consumes: Task 2 创建的 tag 根目录 `Zhihu-Beautification.user.js`。
- Produces: CI 在创建 Release 前逐字节校验 tag 文件与 `dist/Zhihu-Beautification.user.js`。

- [ ] **Step 1: 为 tag 产物一致性写失败约束测试**

在 `test/release-workflow.test.js` 的“测试、构建、校验并上传固定资产”测试中加入：

```js
assert.match(
  workflow,
  /cmp -s Zhihu-Beautification\.user\.js dist\/Zhihu-Beautification\.user\.js/,
)
```

并在“不提交、推送或移动 tag”测试中把约束扩展为：

```js
assert.doesNotMatch(workflow, /git commit|git push|git tag(?:\s|$)|--force/)
```

- [ ] **Step 2: 运行约束测试并确认缺少 cmp 校验而失败**

Run: `node --test test/release-workflow.test.js`

Expected: FAIL，错误指出工作流不匹配 `cmp -s Zhihu-Beautification.user.js ...`。

- [ ] **Step 3: 在 Release 工作流加入内容一致性校验**

在 `.github/workflows/release.yml` 的 `Validate artifact version` 后加入：

```yaml
      - name: Validate tagged artifact
        run: |
          if ! cmp -s Zhihu-Beautification.user.js dist/Zhihu-Beautification.user.js; then
            echo "ERROR: Tagged artifact does not match the CI build"
            exit 1
          fi
          echo "Tagged artifact matches the CI build"
```

- [ ] **Step 4: 运行定向与全量验证**

Run: `node --test test/release-workflow.test.js && npm test && git diff --check`

Expected: 工作流约束测试通过；全量测试 0 fail；diff 检查无输出。

- [ ] **Step 5: 提交 CI 产物一致性保护**

```bash
git add .github/workflows/release.yml test/release-workflow.test.js
git commit -m "ci: verify artifacts stored in release tags"
```

### Task 4: 发布文档与安全检查清单

**Files:**
- Create: `docs/releasing.md`

**Interfaces:**
- Consumes: Task 2 的 `npm run release -- vX.Y.Z`。
- Produces: 维护者可重复执行的发布与故障处理说明。

- [ ] **Step 1: 写发布操作文档**

创建 `docs/releasing.md`：

````markdown
# 发布

## 前置条件

- 当前分支是 `main`，工作区和索引干净。
- 本地 `main` 已推送并与 `origin/main` 一致。
- 已安装 Node.js 22、npm、Git，并拥有向仓库推送 tag 的权限。
- 新版本使用严格的 `vX.Y.Z`，且高于所有现有发布 tag。

## 创建发布

```bash
npm run release -- vX.Y.Z
```

该命令在临时 worktree 中测试并构建，创建只包含根目录
`Zhihu-Beautification.user.js` 的发布专用提交，创建 annotated tag，并且只推送该 tag。
它不会提交或推送 `main`。

tag push 会触发 `.github/workflows/release.yml`。工作流重新测试和构建，比较 tag
中的根目录脚本与 CI 构建产物，然后创建 GitHub Release 和固定名称 Asset。

## 验证

1. GitHub Actions 的 `Release` workflow 必须成功。
2. Release 必须包含 `Zhihu-Beautification.user.js`。
3. 以下 URL 的 `@version` 必须等于新 tag：

   ```text
   https://github.com/wangkezun/zhihu-beautification/releases/latest/download/Zhihu-Beautification.user.js
   ```

4. GitHub webhook 的 `published` delivery 响应必须满足：

   ```json
   {
     "updated_failed": []
   }
   ```

   并且 `updated_scripts` 必须包含目标 Greasy Fork 脚本。HTTP 200 本身不能证明同步成功。

## 失败处理

- 命令在推送前失败：修复问题后重新运行；不得手工创建不完整 tag。
- tag 已在本地创建但推送失败：按命令输出重试同一个精确 tag ref，不删除或重建 tag。
- tag 已推送但 CI 或 Greasy Fork 失败：保留 tag，修复后使用更高的新补丁版本。
- Release 已存在：不要覆盖资产，也不要移动 tag。
````

- [ ] **Step 2: 核对文档与命令实现一致**

Run:

```bash
rg -n "npm run release|Zhihu-Beautification.user.js|updated_failed|不删除|不.*移动" docs/releasing.md
git diff --check
```

Expected: `rg` 命中命令、资产、webhook 和不可变性说明；diff 检查无输出。

- [ ] **Step 3: 提交发布文档**

```bash
git add docs/releasing.md
git commit -m "docs: document immutable release command"
```

### Task 5: 全量验证、推送 main 并发布下一个补丁版本

**Files:**
- Verify: `package.json`
- Verify: `scripts/create-release.js`
- Verify: `.github/workflows/release.yml`
- Remote side effect: push `main`，然后由发布命令只推送新 tag

**Interfaces:**
- Consumes: Task 1–4 的实现和当前最高 tag `v4.0.4`。
- Produces: `origin/main` 上的新发布工具，以及首个发布专用 tag `v4.0.5`、GitHub Release、Asset 和成功的 Greasy Fork webhook 同步。

- [ ] **Step 1: 运行发布前完整验证**

Run:

```bash
npm test
npm run build
git diff --check
git status -sb
git log --oneline origin/main..HEAD
```

Expected: 测试 0 fail；构建成功；diff 检查无输出；工作区干净；`main` 只领先设计、计划和 Task 1–4 的预期提交。

- [ ] **Step 2: 推送 main**

Run: `git push origin main`

Expected: `origin/main` 更新到当前 `HEAD`，没有推送任何 tag。

- [ ] **Step 3: 用正式入口发布 v4.0.5**

Run: `npm run release -- v4.0.5`

Expected: 命令重新测试和构建；创建发布专用提交和 annotated tag；输出以 `Published v4.0.5 from main ` 开头并以 40 位提交 SHA 结尾；只推送 `refs/tags/v4.0.5`。

- [ ] **Step 4: 验证 tag 结构且 main 未改变**

Run:

```bash
git cat-file -t v4.0.5
git diff --name-status v4.0.5^1 v4.0.5^{}
git show v4.0.5:Zhihu-Beautification.user.js | awk '/@version/{print $3; exit}'
git rev-parse HEAD
git rev-parse origin/main
git status -sb
```

Expected: tag 类型为 `tag`；diff 仅为 `A Zhihu-Beautification.user.js`；版本为 `4.0.5`；`HEAD` 与 `origin/main` 相同；工作区干净。

- [ ] **Step 5: 等待并验证 GitHub Release 工作流**

Run:

```bash
gh run list --repo wangkezun/zhihu-beautification --workflow Release --limit 1
gh run watch --repo wangkezun/zhihu-beautification $(gh run list --repo wangkezun/zhihu-beautification --workflow Release --limit 1 --json databaseId --jq '.[0].databaseId')
gh release view v4.0.5 --repo wangkezun/zhihu-beautification --json url,tagName,assets
```

Expected: workflow conclusion 为 `success`；Release 非 draft、非 prerelease；资产名为 `Zhihu-Beautification.user.js`。

- [ ] **Step 6: 验证 Latest Asset**

Run:

```bash
curl -fsSL -o /tmp/Zhihu-Beautification-v4.0.5.user.js \
  https://github.com/wangkezun/zhihu-beautification/releases/latest/download/Zhihu-Beautification.user.js
awk '/@version/{print $3; exit}' /tmp/Zhihu-Beautification-v4.0.5.user.js
shasum -a 256 /tmp/Zhihu-Beautification-v4.0.5.user.js
```

Expected: 版本为 `4.0.5`；摘要与 `gh release view` 返回资产 digest 一致。

- [ ] **Step 7: 验证 Greasy Fork published webhook 响应正文**

先读取只订阅 `release` 的 Active webhook ID，并提取最新 delivery 的精确整数 ID。这里使用原始 JSON 和 `sed`，避免 jq 把超大 delivery ID 转成不精确数字：

```bash
HOOK_ID=$(gh api repos/wangkezun/zhihu-beautification/hooks \
  --jq '.[] | select(.active and (.events == ["release"])) | .id')
DELIVERY_JSON=$(gh api "repos/wangkezun/zhihu-beautification/hooks/${HOOK_ID}/deliveries?per_page=1")
DELIVERY_ID=$(printf '%s' "$DELIVERY_JSON" | sed -E 's/^\[{"id":([0-9]+),.*/\1/')
```

再查询该 delivery 详情：

```bash
gh api "repos/wangkezun/zhihu-beautification/hooks/${HOOK_ID}/deliveries/${DELIVERY_ID}" \
  --jq '{action:.request.payload.action, tag:.request.payload.release.tag_name, response:.response.payload}'
```

Expected: `action` 为 `published`，tag 为 `v4.0.5`；响应 JSON 的 `updated_failed` 为空，`updated_scripts` 包含 `https://greasyfork.org/scripts/586219-...`，且不再出现 `path ... does not exist`。

- [ ] **Step 8: 最终仓库状态验证**

Run:

```bash
npm test
git status -sb
git rev-parse HEAD
git rev-parse origin/main
git rev-parse v4.0.3^{}
git rev-parse v4.0.4^{}
```

Expected: 全量测试 0 fail；工作区干净；`HEAD` 与 `origin/main` 一致；现有 `v4.0.3` 和 `v4.0.4` 指向保持不变。
