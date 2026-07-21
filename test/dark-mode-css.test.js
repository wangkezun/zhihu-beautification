import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const css = await readFile(new URL('../src/styles/darkMode-1.css', import.meta.url), 'utf8')

test('新版顶栏在深色主题下使用可读文字颜色', () => {
  assert.match(css, /header\.AppHeader nav a/)
  assert.match(css, /button\[aria-label="通知"\]/)
  assert.match(css, /button\[aria-label\$="条私信"\]/)
  assert.match(css, /a\[href\*="\/creator"\]/)
})

test('问题话题卡片在深色主题下使用深色背景', () => {
  assert.match(css, /\.QuestionHeader-main > a\[aria-label\^="话题 "\]/)
  assert.match(css, /background: #313244 !important/)
})

test('新版回答评论在深色主题下使用可读文字颜色', () => {
  assert.match(css, /\.Modal-content \.CommentContent/)
  assert.match(css, /\.Modal-content:has\(\.CommentContent\) a\[href\*="\/people\/"\]/)
})
