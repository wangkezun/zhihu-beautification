# GitHub Release Asset 与 Greasy Fork 同步实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将发布流程改为不可变 tag 驱动的 GitHub Release Asset 发布，让 Greasy Fork 通过稳定的 Latest Release Asset URL 自动同步，同时禁止工作流写回 `main` 或移动 tag。

**Architecture:** `main` 保存源码、测试和工作流，`src/meta.txt` 使用 `0.0.0` 开发占位版本，`dist` 不再被 Git 跟踪。tag 工作流通过一个可单测的 Node 脚本从 `vX.Y.Z` 注入发布版本，测试并构建固定名称的 userscript，然后只创建 GitHub Release 和上传资产。

**Tech Stack:** Node.js 22、Node test runner、Rollup、GitHub Actions、softprops/action-gh-release、GitHub CLI

## Global Constraints

- Greasy Fork 同步 URL 固定为 `https://github.com/wangkezun/zhihu-beautification/releases/latest/download/Zhihu-Beautification.user.js`。
- GitHub Webhook 只订阅 Release 事件。
- `main` 不跟踪 `dist/Zhihu-Beautification.user.js`，也不保存已发布版本号。
- 发布 tag 必须使用 `vX.Y.Z` 格式，创建后不得移动或强制更新。
- 工作流不得执行 `git commit`、`git push main`、`git tag -f` 或任何强制推送。
- 保留现有 `v4.0.3` tag，并为它补建 Release；不得删除或移动该 tag。

---

### Task 1: 可测试的发布版本注入器

**Files:**
- Create: `scripts/set-release-version.js`
- Create: `test/set-release-version.test.js`

**Interfaces:**
- Consumes: tag 字符串 `vX.Y.Z`、userscript metadata 文本。
- Produces: `versionFromTag(tag): string`、`replaceMetadataVersion(metadata, version): string`，以及 CLI `node scripts/set-release-version.js <tag> <meta-path>`。

- [ ] **Step 1: 写 tag 解析的失败测试**

```js
import assert from 'node:assert/strict'
import test from 'node:test'

import {
  replaceMetadataVersion,
  versionFromTag,
} from '../scripts/set-release-version.js'

test('从发布 tag 提取语义版本', () => {
  assert.equal(versionFromTag('v4.0.4'), '4.0.4')
})

test('拒绝不符合 vX.Y.Z 的 tag', () => {
  for (const tag of ['4.0.4', 'v4.0', 'v4.0.4-beta', 'latest']) {
    assert.throws(() => versionFromTag(tag), /Invalid release tag/)
  }
})

test('只替换唯一的 userscript version 元数据', () => {
  const metadata = '// ==UserScript==\n// @version      0.0.0\n// ==/UserScript==\n'
  assert.equal(
    replaceMetadataVersion(metadata, '4.0.4'),
    '// ==UserScript==\n// @version      4.0.4\n// ==/UserScript==\n',
  )
})

test('拒绝缺失或重复的 version 元数据', () => {
  assert.throws(() => replaceMetadataVersion('// @name test\n', '4.0.4'), /exactly one @version/)
  assert.throws(
    () => replaceMetadataVersion('// @version 0.0.0\n// @version 0.0.0\n', '4.0.4'),
    /exactly one @version/,
  )
})
```

- [ ] **Step 2: 运行测试并确认因模块缺失而失败**

Run: `node --test test/set-release-version.test.js`

Expected: FAIL，错误包含 `ERR_MODULE_NOT_FOUND`。

- [ ] **Step 3: 实现最小版本注入器和 CLI**

```js
import { readFile, writeFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'

const TAG_PATTERN = /^v(\d+\.\d+\.\d+)$/
const VERSION_LINE_PATTERN = /^\/\/ @version\s+.*$/gm

export function versionFromTag(tag) {
  const match = TAG_PATTERN.exec(tag)
  if (!match) throw new Error(`Invalid release tag: ${tag}`)
  return match[1]
}

export function replaceMetadataVersion(metadata, version) {
  const matches = metadata.match(VERSION_LINE_PATTERN) || []
  if (matches.length !== 1) {
    throw new Error('Expected exactly one @version metadata line')
  }
  return metadata.replace(VERSION_LINE_PATTERN, `// @version      ${version}`)
}

async function main() {
  const [, , tag, metaPath] = process.argv
  if (!tag || !metaPath) {
    throw new Error('Usage: node scripts/set-release-version.js <tag> <meta-path>')
  }
  const version = versionFromTag(tag)
  const metadata = await readFile(metaPath, 'utf8')
  await writeFile(metaPath, replaceMetadataVersion(metadata, version))
  process.stdout.write(`${version}\n`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
}
```

- [ ] **Step 4: 运行定向测试并确认通过**

Run: `node --test test/set-release-version.test.js`

Expected: 4 tests pass，0 fail。

- [ ] **Step 5: 运行全部测试**

Run: `npm test`

Expected: 现有宽度测试与新增版本测试全部通过。

- [ ] **Step 6: 提交版本注入器**

```bash
git add scripts/set-release-version.js test/set-release-version.test.js
git commit -m "test: add release version injection"
```

### Task 2: 将 Release 工作流改为只读发布

**Files:**
- Modify: `.github/workflows/release.yml`
- Create: `test/release-workflow.test.js`

**Interfaces:**
- Consumes: Task 1 的 CLI `node scripts/set-release-version.js <tag> <meta-path>`。
- Produces: tag push 到 GitHub Release Asset 的单向工作流，不写 Git refs。

- [ ] **Step 1: 写工作流约束的失败测试**

```js
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const workflow = await readFile('.github/workflows/release.yml', 'utf8')

test('Release 工作流检出 tag 并注入 tag 版本', () => {
  assert.doesNotMatch(workflow, /\bref:\s*main\b/)
  assert.match(workflow, /node scripts\/set-release-version\.js "\$GITHUB_REF_NAME" src\/meta\.txt/)
})

test('Release 工作流测试、构建、校验并上传固定资产', () => {
  assert.match(workflow, /run:\s*npm test/)
  assert.match(workflow, /run:\s*npm run build/)
  assert.match(workflow, /gh release view "\$GITHUB_REF_NAME"/)
  assert.match(workflow, /dist\/Zhihu-Beautification\.user\.js/)
  assert.match(workflow, /softprops\/action-gh-release@v2/)
})

test('Release 工作流不提交、推送或移动 tag', () => {
  assert.doesNotMatch(workflow, /git commit|git push|git tag\s+-f|--force/)
})
```

- [ ] **Step 2: 运行测试并确认旧工作流失败**

Run: `node --test test/release-workflow.test.js`

Expected: FAIL，至少报告 `ref: main`、缺少版本注入和存在 Git 写操作。

- [ ] **Step 3: 用只读发布流程替换工作流步骤**

将 `.github/workflows/release.yml` 更新为：

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

permissions:
  contents: write

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout tag
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Set release version
        run: node scripts/set-release-version.js "$GITHUB_REF_NAME" src/meta.txt

      - name: Test
        run: npm test

      - name: Build
        run: npm run build

      - name: Validate artifact version
        run: |
          TAG_VERSION="${GITHUB_REF_NAME#v}"
          ARTIFACT_VERSION=$(awk '/@version/{print $3; exit}' dist/Zhihu-Beautification.user.js)
          if [ "$TAG_VERSION" != "$ARTIFACT_VERSION" ]; then
            echo "ERROR: Tag version ($TAG_VERSION) != artifact version ($ARTIFACT_VERSION)"
            exit 1
          fi
          echo "Artifact version validated: $TAG_VERSION"

      - name: Ensure release does not exist
        env:
          GH_TOKEN: ${{ github.token }}
        run: |
          if gh release view "$GITHUB_REF_NAME" >/dev/null 2>&1; then
            echo "ERROR: Release $GITHUB_REF_NAME already exists"
            exit 1
          fi

      - name: Create Release
        uses: softprops/action-gh-release@v2
        with:
          files: dist/Zhihu-Beautification.user.js
          generate_release_notes: true
```

- [ ] **Step 4: 运行工作流约束测试**

Run: `node --test test/release-workflow.test.js`

Expected: 3 tests pass，0 fail。

- [ ] **Step 5: 运行全部测试并检查 YAML 差异**

Run: `npm test && git diff --check`

Expected: 所有测试通过，`git diff --check` 无输出。

- [ ] **Step 6: 提交只读发布工作流**

```bash
git add .github/workflows/release.yml test/release-workflow.test.js
git commit -m "ci: publish immutable release assets"
```

### Task 3: 将主干转换为开发占位版本并停止跟踪 dist

**Files:**
- Modify: `src/meta.txt:3`
- Remove from Git index: `dist/Zhihu-Beautification.user.js`
- Verify: `.gitignore`

**Interfaces:**
- Consumes: Task 1 的版本注入器、现有 Rollup 构建。
- Produces: `main` 上的 `0.0.0` 开发元数据和不被 Git 跟踪的本地构建产物。

- [ ] **Step 1: 将主干 metadata 改为开发占位版本**

```text
// @version      0.0.0
```

- [ ] **Step 2: 从 Git 索引移除构建产物但保留本地文件**

Run: `git rm --cached dist/Zhihu-Beautification.user.js`

Expected: `dist/Zhihu-Beautification.user.js` 显示为 staged deletion，本地文件仍存在。

- [ ] **Step 3: 验证 dist 忽略规则**

Run: `git check-ignore -v dist/Zhihu-Beautification.user.js`

Expected: 输出 `.gitignore` 中的 `dist/` 规则。

- [ ] **Step 4: 验证本地开发构建不会污染 Git 状态**

Run: `npm run build && git status --short`

Expected: 构建成功；状态只包含 `src/meta.txt` 修改与 `dist` 的 staged deletion，不出现新的未跟踪 dist 文件。

- [ ] **Step 5: 运行完整验证**

Run: `npm test && git diff --check && git diff --cached --check`

Expected: 所有测试通过，两个 diff 检查均无输出。

- [ ] **Step 6: 提交主干发布边界调整**

```bash
git add src/meta.txt
git commit -m "chore: keep release artifacts out of main"
```

### Task 4: 推送主干并补建 v4.0.3 Release

**Files:**
- Read from tag: `v4.0.3:dist/Zhihu-Beautification.user.js`
- Temporary archive: `/tmp/zhihu-beautification-v4.0.3.tar`
- Temporary extracted asset: `/tmp/dist/Zhihu-Beautification.user.js`

**Interfaces:**
- Consumes: 已存在且不可移动的 `v4.0.3` tag、Task 1–3 的主干提交。
- Produces: 更新后的 `origin/main`、现有 tag 对应的 GitHub Release 与固定名称资产。

- [ ] **Step 1: 最终验证主干**

Run: `npm test && npm run build && git diff --check && git status -sb`

Expected: 测试和构建通过；工作区干净；`main` 仅领先 `origin/main` 预期提交。

- [ ] **Step 2: 推送 main**

Run: `git push origin main`

Expected: `origin/main` 更新到当前 `HEAD`。

- [ ] **Step 3: 从不可变 tag 导出已提交的 4.0.3 构建产物**

Run:

```bash
git archive --format=tar --output=/tmp/zhihu-beautification-v4.0.3.tar v4.0.3 dist/Zhihu-Beautification.user.js
tar -xf /tmp/zhihu-beautification-v4.0.3.tar -C /tmp
```

Expected: `/tmp/dist/Zhihu-Beautification.user.js` 存在。

- [ ] **Step 4: 校验导出资产版本**

Run: `awk '/@version/{print $3; exit}' /tmp/dist/Zhihu-Beautification.user.js`

Expected: `4.0.3`。

- [ ] **Step 5: 确认 Release 尚不存在**

Run: `gh release view v4.0.3`

Expected: 命令报告 release not found；如果 Release 已存在则停止，不覆盖资产。

- [ ] **Step 6: 为现有 tag 创建 Release**

Run:

```bash
gh release create v4.0.3 /tmp/dist/Zhihu-Beautification.user.js \
  --title "v4.0.3" \
  --generate-notes \
  --verify-tag
```

Expected: 返回新建 Release URL。

- [ ] **Step 7: 验证 Latest Release Asset**

Run: `curl -fsSL https://github.com/wangkezun/zhihu-beautification/releases/latest/download/Zhihu-Beautification.user.js | awk '/@version/{print $3; exit}'`

Expected: `4.0.3`。

- [ ] **Step 8: 验证仓库最终状态**

Run: `git status -sb && git rev-parse HEAD && git rev-parse origin/main`

Expected: `main` 与 `origin/main` SHA 一致，工作区无修改。

### Task 5: 配置 Greasy Fork 同步（用户侧操作）

**Files:**
- No repository files.

**Interfaces:**
- Consumes: Task 4 已验证的 Latest Release Asset URL。
- Produces: Greasy Fork 的手动同步成功记录和后续 Release webhook 自动同步。

- [ ] **Step 1: 在 Greasy Fork 脚本管理页设置同步 URL**

```text
https://github.com/wangkezun/zhihu-beautification/releases/latest/download/Zhihu-Beautification.user.js
```

- [ ] **Step 2: 手动触发一次同步**

Expected: Greasy Fork 读取 `@version 4.0.3`，代码更新成功。

- [ ] **Step 3: 在 GitHub 仓库 Webhook 中只启用 Release 事件**

Expected: Webhook 保持 Active，不订阅普通 Push 事件。

- [ ] **Step 4: 记录首次 webhook 验证限制**

Expected: `v4.0.3` 采用手动补建 Release，Greasy Fork 可立即手动同步；自动 webhook 的端到端验证留到下一次正常 tag 发布时完成。
