import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import {
  chmodSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
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

function repoState(repo) {
  return {
    head: git(repo, 'rev-parse', 'HEAD'),
    status: git(repo, 'status', '--porcelain'),
    tags: git(repo, 'for-each-ref', '--format=%(refname) %(objectname)', 'refs/tags'),
  }
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
    const before = repoState(fixture.repo)
    const result = spawnSync(process.execPath, [releaseScript, 'v1.0.0'], {
      cwd: fixture.repo,
      encoding: 'utf8',
    })

    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /clean worktree and index/)
    assert.deepEqual(repoState(fixture.repo), before)
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

    const before = repoState(fixture.repo)
    const result = spawnSync(process.execPath, [releaseScript, 'v1.0.0'], {
      cwd: fixture.repo,
      encoding: 'utf8',
    })

    assert.notEqual(result.status, 0)
    assert.deepEqual(repoState(fixture.repo), before)
    assert.equal(
      run('git', ['ls-remote', fixture.remote, 'refs/tags/v1.0.0'], fixture.repo),
      '',
    )
  } finally {
    rmSync(fixture.root, { recursive: true, force: true })
  }
})

test('push 失败保留已验证的本地 annotated tag 并提示精确重试命令', () => {
  const fixture = createFixture()
  try {
    const hook = join(fixture.remote, 'hooks/pre-receive')
    write(
      hook,
      '#!/bin/sh\n' +
        "while read old new ref; do\n" +
        '  case "$ref" in\n' +
        '    refs/tags/*) exit 1 ;;\n' +
        '  esac\n' +
        'done\n' +
        'exit 0\n',
    )
    chmodSync(hook, 0o755)
    const mainBefore = git(fixture.repo, 'rev-parse', 'HEAD')
    const statusBefore = git(fixture.repo, 'status', '--porcelain')

    const result = spawnSync(process.execPath, [releaseScript, 'v1.0.0'], {
      cwd: fixture.repo,
      encoding: 'utf8',
    })

    assert.notEqual(result.status, 0)
    assert.match(
      result.stderr,
      /Local tag v1\.0\.0 was retained; retry with: git push origin refs\/tags\/v1\.0\.0/,
    )
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
    assert.equal(git(fixture.repo, 'rev-parse', 'HEAD'), mainBefore)
    assert.equal(git(fixture.repo, 'status', '--porcelain'), statusBefore)
    assert.equal(
      run('git', ['ls-remote', fixture.remote, 'refs/tags/v1.0.0'], fixture.repo),
      '',
    )
  } finally {
    rmSync(fixture.root, { recursive: true, force: true })
  }
})
