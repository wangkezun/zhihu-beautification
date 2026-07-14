import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

import {
  assertReleaseDiff,
  compareReleaseTags,
  latestReleaseTag,
  metadataVersion,
  selectReleaseParents,
} from './release-helpers.js'
import { versionFromTag } from './set-release-version.js'

const ARTIFACT = 'Zhihu-Beautification.user.js'

function run(file, args, { cwd, env = process.env, input, trim = true, stdio } = {}) {
  try {
    const output = execFileSync(file, args, {
      cwd,
      env,
      input,
      encoding: 'utf8',
      stdio: stdio || ['pipe', 'pipe', 'pipe'],
    })
    if (output === null || output === undefined) return ''
    return trim ? output.trim() : output
  } catch (error) {
    const detail = error.stderr?.toString().trim() || error.message
    throw new Error(`${file} ${args.join(' ')} failed: ${detail}`)
  }
}

function git(repo, args, options = {}) {
  return run('git', args, { cwd: repo, ...options })
}

function isAncestor(repo, ancestor, descendant) {
  const result = spawnSync('git', ['merge-base', '--is-ancestor', ancestor, descendant], {
    cwd: repo,
    stdio: 'ignore',
  })
  if (result.status === 0) return true
  if (result.status === 1) return false
  throw new Error('git merge-base --is-ancestor failed')
}

function verifyCleanMain(repo, remote) {
  git(repo, ['fetch', remote, `+refs/heads/main:refs/remotes/${remote}/main`, '--tags'])
  if (git(repo, ['branch', '--show-current']) !== 'main') {
    throw new Error('Release must run from main')
  }
  if (git(repo, ['status', '--porcelain']) !== '') {
    throw new Error('Release requires a clean worktree and index')
  }
  const head = git(repo, ['rev-parse', 'HEAD'])
  const remoteMain = git(repo, ['rev-parse', `${remote}/main`])
  if (head !== remoteMain) {
    throw new Error(`HEAD (${head}) must equal ${remote}/main (${remoteMain})`)
  }
  return head
}

export function createRelease(tag, { cwd = process.cwd(), remote = 'origin' } = {}) {
  const version = versionFromTag(tag)
  const repo = git(cwd, ['rev-parse', '--show-toplevel'])
  const head = verifyCleanMain(repo, remote)
  const tags = git(repo, ['tag', '--list']).split('\n').filter(Boolean)
  if (tags.includes(tag)) throw new Error(`Release tag already exists: ${tag}`)

  const previousTag = latestReleaseTag(tags)
  if (previousTag && compareReleaseTags(tag, previousTag) <= 0) {
    throw new Error(`Release tag ${tag} must be greater than ${previousTag}`)
  }

  const tempRoot = mkdtempSync(join(tmpdir(), 'zhihu-release-'))
  const worktree = join(tempRoot, 'worktree')
  const indexPath = join(tempRoot, 'release-index')
  let worktreeAdded = false
  let worktreeCleanupFailed = false

  try {
    git(repo, ['worktree', 'add', '--detach', worktree, head])
    worktreeAdded = true
    run('npm', ['ci'], { cwd: worktree, stdio: 'inherit' })
    run(process.execPath, ['scripts/set-release-version.js', tag, 'src/meta.txt'], {
      cwd: worktree,
      stdio: 'inherit',
    })
    run('npm', ['test'], { cwd: worktree, stdio: 'inherit' })
    run('npm', ['run', 'build'], { cwd: worktree, stdio: 'inherit' })

    const artifactPath = join(worktree, 'dist', ARTIFACT)
    const artifact = readFileSync(artifactPath, 'utf8')
    if (metadataVersion(artifact) !== version) {
      throw new Error(`Built artifact version must equal ${version}`)
    }

    const indexEnv = { ...process.env, GIT_INDEX_FILE: indexPath }
    git(repo, ['read-tree', head], { env: indexEnv })
    const blob = git(repo, ['hash-object', '-w', '--stdin'], { input: artifact })
    git(repo, ['update-index', '--add', '--cacheinfo', `100644,${blob},${ARTIFACT}`], {
      env: indexEnv,
    })
    const tree = git(repo, ['write-tree'], { env: indexEnv })

    const previousCommit = previousTag ? git(repo, ['rev-parse', `${previousTag}^{}`]) : null
    const previousIsAncestor = previousCommit
      ? isAncestor(repo, previousCommit, head)
      : false
    const parents = selectReleaseParents(head, previousCommit, previousIsAncestor)
    const commitArgs = ['commit-tree', tree]
    for (const parent of parents) commitArgs.push('-p', parent)
    const releaseCommit = git(repo, commitArgs, { input: `release: ${tag}\n` })

    assertReleaseDiff(git(repo, ['diff', '--name-status', head, releaseCommit], { trim: false }), ARTIFACT)
    if (git(repo, ['rev-parse', `${releaseCommit}^1`]) !== head) {
      throw new Error('Release commit first parent must equal main HEAD')
    }
    const taggedArtifact = git(repo, ['show', `${releaseCommit}:${ARTIFACT}`], { trim: false })
    if (taggedArtifact !== artifact) throw new Error('Tagged artifact must equal the local build')
    if (metadataVersion(taggedArtifact) !== version) {
      throw new Error(`Tagged artifact version must equal ${version}`)
    }

    git(repo, ['tag', '-a', tag, releaseCommit, '-m', tag])
    if (git(repo, ['rev-parse', `${tag}^{}`]) !== releaseCommit) {
      throw new Error(`Annotated tag ${tag} does not point to the release commit`)
    }

    try {
      git(repo, ['push', remote, `refs/tags/${tag}`], { stdio: 'inherit' })
    } catch (error) {
      throw new Error(`${error.message}\nLocal tag ${tag} was retained; retry with: git push ${remote} refs/tags/${tag}`)
    }
    process.stdout.write(`Published ${tag} from main ${head}\n`)
  } finally {
    if (worktreeAdded) {
      try {
        git(repo, ['worktree', 'remove', '--force', worktree])
      } catch (error) {
        worktreeCleanupFailed = true
        process.stderr.write(`${error.message}\nTemporary worktree retained at ${worktree}\n`)
      }
    }
    if (!worktreeCleanupFailed) rmSync(tempRoot, { recursive: true, force: true })
  }
}

function main() {
  const [, , tag] = process.argv
  if (!tag) throw new Error('Usage: npm run release -- vX.Y.Z')
  createRelease(tag)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main()
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
