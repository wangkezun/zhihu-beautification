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
