# Question Page Answer Width Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让知乎问题页回答主栏在桌面端严格使用宽屏设置值，同时保留现有窄屏响应式行为。

**Architecture:** 只修改 `getWidescreenCSS(width)` 生成的问题页 CSS。使用稳定语义类 `.Question-mainColumn` 直接接收配置宽度，保留 `.Question-main` 作为旧 DOM 兼容入口；不依赖动态 `css-*` 类，也不增加运行时 DOM 操作。

**Tech Stack:** JavaScript ES modules、CSS 模板字符串、Node.js 内置测试运行器、Rollup

## Global Constraints

- 顶部问题信息区域保持现状。
- 现有隐藏右侧栏行为保持不变。
- 窄屏视口不得因桌面固定宽度引入横向滚动。
- 兼容仍使用 `.Question-main` 的旧版页面结构。
- 不修改首页、搜索页、收藏页、文章页或用户页宽屏规则。
- 不引用知乎 Emotion 动态 `css-*` 类。
- 不增加 JavaScript DOM 观察器或行内样式。

---

### Task 1: 问题页主栏使用明确配置宽度

**Files:**
- Modify: `test/widescreen.test.js`
- Modify: `src/widescreen.js:14-22`

**Interfaces:**
- Consumes: `getWidescreenCSS(width: string): { index: string, question: string, search: string, collection: string, post: string, people: string }`。
- Produces: `question` CSS 字符串；桌面规则同时命中 `.Question-main` 和 `.Question-mainColumn`，两个响应式规则也同时命中二者。

- [ ] **Step 1: 将现有测试改成能复现当前问题的失败测试**

将 `test/widescreen.test.js` 改为：

```js
import assert from 'node:assert/strict'
import test from 'node:test'

import { getWidescreenCSS } from '../src/widescreen.js'

test('问题页主栏直接使用配置宽度并保持响应式', () => {
  const { question } = getWidescreenCSS('1200')
  const inheritRule = question
    .split('\n')
    .find((line) => line.includes('width: inherit !important'))

  assert.ok(inheritRule)
  assert.doesNotMatch(inheritRule, /\.Question-mainColumn/)
  assert.match(
    question,
    /\.Question-main,\s*\.Question-mainColumn\s*\{width:\s*1200px\s*!important;\}/,
  )
  assert.match(
    question,
    /max-width:\s*1250px\)\s*\{\.Question-main,\s*\.Question-mainColumn\s*\{width:\s*auto\s*!important;\}/,
  )
  assert.match(
    question,
    /max-width:\s*1100px\)\s*\{\.Question-main,\s*\.Question-mainColumn\s*\{width:\s*98\.5%\s*!important;\}/,
  )
})
```

- [ ] **Step 2: 运行定向测试并确认 RED**

Run:

```bash
node --test test/widescreen.test.js
```

Expected: 1 个测试失败；失败首先指出 `inheritRule` 仍包含
`.Question-mainColumn`。这证明测试命中了已确认的根因，而不是无关格式差异。

- [ ] **Step 3: 最小修改问题页 CSS**

将 `src/widescreen.js` 中 `question` CSS 改为：

```js
    question: `/* 宽屏显示 - 问题页 */
.ListShortcut, .QuestionWaiting-mainColumn {width: inherit !important;}
.Question-mainColumn+div,[data-za-detail-view-path-module="RightSideBar"], .Question-sideColumn, .GlobalSideBar {display: none !important;}
.QuestionWaiting-mainColumn {margin-right: 0 !important;}
.Question-main, .Question-mainColumn {width: ${w}px !important;}
@media only screen and (max-width: ${w50}px) {.Question-main, .Question-mainColumn {width: auto !important;}}
@media only screen and (max-width: ${w100}px) {.Question-main, .Question-mainColumn {width: 98.5% !important;}}
.AuthorInfo {max-width: 100% !important;}
`,
```

不要修改 `index`、`search`、`collection`、`post` 或 `people` CSS。

- [ ] **Step 4: 运行定向测试并确认 GREEN**

Run:

```bash
node --test test/widescreen.test.js
```

Expected: 1 test，1 pass，0 fail。

- [ ] **Step 5: 运行完整测试与构建**

Run:

```bash
npm test
npm run build
git diff --check
```

Expected: 全量测试 0 fail；Rollup 成功生成
`dist/Zhihu-Beautification.user.js`；`git diff --check` 无输出。

- [ ] **Step 6: 核对生成 CSS 的范围**

Run:

```bash
git diff -- src/widescreen.js test/widescreen.test.js
rg -n "Question-mainColumn.*1200px|Question-main.*Question-mainColumn" test/widescreen.test.js
```

Expected: diff 只包含问题页 CSS 和对应测试；测试明确覆盖桌面、`1250px`
断点和 `1100px` 断点。

- [ ] **Step 7: 在实际问题页验证 computed widths**

在宽屏设置为 `1000` 的问题页控制台中执行：

```js
const verificationStyle = document.createElement('style')
verificationStyle.id = 'zhihu-width-verification'
verificationStyle.textContent = `
.ListShortcut, .QuestionWaiting-mainColumn {width: inherit !important;}
.Question-main, .Question-mainColumn {width: 1000px !important;}
@media only screen and (max-width: 1050px) {.Question-main, .Question-mainColumn {width: auto !important;}}
@media only screen and (max-width: 900px) {.Question-main, .Question-mainColumn {width: 98.5% !important;}}
`
document.head.append(verificationStyle)

const widths = [
  getComputedStyle(document.querySelector('.Question-mainColumn')).width,
  getComputedStyle(document.querySelector('.ListShortcut')).width,
  getComputedStyle(document.querySelector('.AnswerItem')).width,
]
verificationStyle.remove()
widths
```

Expected: `['1000px', '1000px', '960px']`。移除临时验证样式后，页面恢复原状态。

- [ ] **Step 8: 提交修复**

```bash
git add src/widescreen.js test/widescreen.test.js
git commit -m "fix: apply configured question page width"
```

Expected: 新提交只包含上述两个文件；设计文档和实施计划保留在之前的独立提交中。
