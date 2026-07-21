import assert from 'node:assert/strict'
import test from 'node:test'

import { keepTheme } from '../src/shared/theme.js'

test('立即把页面主题同步为脚本选择的主题', () => {
  const root = createRoot('light')
  const Observer = createObserver()

  keepTheme('dark', root, Observer)

  assert.equal(root.getAttribute('data-theme'), 'dark')
})

test('知乎重新写入主题后恢复脚本选择的主题', () => {
  const root = createRoot('dark')
  const Observer = createObserver()

  keepTheme('dark', root, Observer)
  root.setAttribute('data-theme', 'light')
  Observer.instance.callback()

  assert.equal(root.getAttribute('data-theme'), 'dark')
  assert.deepEqual(Observer.instance.options, {
    attributes: true,
    attributeFilter: ['data-theme'],
  })
})

function createRoot(theme) {
  const attributes = new Map([['data-theme', theme]])
  return {
    getAttribute(name) {
      return attributes.get(name) ?? null
    },
    setAttribute(name, value) {
      attributes.set(name, value)
    },
  }
}

function createObserver() {
  return class Observer {
    static instance

    constructor(callback) {
      this.callback = callback
      Observer.instance = this
    }

    observe(root, options) {
      this.root = root
      this.options = options
    }
  }
}
