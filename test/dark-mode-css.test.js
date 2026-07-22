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

test('新版回答评论弹框和内嵌结构均使用可读文字颜色', () => {
  assert.match(css, /\.Modal-content \.CommentContent/)
  assert.match(css, /\.Comments-container \.CommentContent/)
  assert.match(css, /\.Modal-content:has\(\.CommentContent\) a\[href\*="\/people\/"\]/)
  assert.match(css, /\.Comments-container a\[href\*="\/people\/"\]/)
})

test('深色主题下代码使用深色背景', () => {
  assert.match(css, /\.RichText code/)
  assert.match(css, /\.ztext code/)
  assert.match(css, /background: #313244 !important/)
})

test('新版内嵌评论恢复为可关闭的居中弹框', () => {
  assert.match(css, /\.ContentItem \.Comments-container \{position: fixed !important/)
  assert.match(css, /box-shadow: 0 0 0 100vmax/)
  assert.match(css, /button:has\(svg\[class\*="ChatBubble"\]\)/)
  assert.match(css, /content: "×"/)
})

test('文章评论输入栏和用户悬浮卡片使用深色背景', () => {
  assert.match(css, /div:has\(> \.HoverCard-item\)/)
  assert.match(css, /div:has\(\.InputLike\):not\(:first-child\)/)
})

test('评论弹框使用深色边框和可读标题颜色', () => {
  assert.match(css, /\.Comments-container \* \{border-color: #45475a !important/)
  assert.match(css, /> div:first-child \* \{color: #cdd6f4 !important/)
})
