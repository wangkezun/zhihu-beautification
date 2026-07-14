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
  assert.match(
    workflow,
    /cmp -s Zhihu-Beautification\.user\.js dist\/Zhihu-Beautification\.user\.js/,
  )
  assert.match(workflow, /gh release view "\$GITHUB_REF_NAME"/)
  assert.match(workflow, /dist\/Zhihu-Beautification\.user\.js/)
  assert.match(workflow, /softprops\/action-gh-release@v2/)
})

test('Release 工作流不提交、推送或移动 tag', () => {
  assert.doesNotMatch(workflow, /git commit|git push|git tag(?:\s|$)|--force/)
})
