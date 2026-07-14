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
