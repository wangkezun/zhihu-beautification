import assert from 'node:assert/strict'
import test from 'node:test'

import { getWidescreenCSS } from '../src/widescreen.js'

test('问题页宽度规则能够覆盖知乎后加载的默认样式', () => {
  const { question } = getWidescreenCSS('1200')

  assert.match(question, /\.Question-main\s*\{width:\s*1200px\s*!important;\}/)
})
