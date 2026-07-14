import { versionFromTag } from './set-release-version.js'

const ARTIFACT_DIFF = (artifactPath) => `A\t${artifactPath}\n`

function versionParts(tag) {
  return versionFromTag(tag).split('.').map((part) => BigInt(part))
}

export function compareReleaseTags(left, right) {
  const leftParts = versionParts(left)
  const rightParts = versionParts(right)
  for (let index = 0; index < leftParts.length; index += 1) {
    if (leftParts[index] > rightParts[index]) return 1
    if (leftParts[index] < rightParts[index]) return -1
  }
  return 0
}

export function latestReleaseTag(tags) {
  const validTags = tags.filter((tag) => {
    try {
      versionFromTag(tag)
      return true
    } catch {
      return false
    }
  })
  if (validTags.length === 0) return null
  return validTags.sort(compareReleaseTags).at(-1)
}

export function selectReleaseParents(head, previousCommit, previousIsAncestor) {
  if (!previousCommit || previousIsAncestor) return [head]
  return [head, previousCommit]
}

export function metadataVersion(userscript) {
  const matches = [...userscript.matchAll(/^\/\/ @version\s+(\S+)\s*$/gm)]
  if (matches.length !== 1) {
    throw new Error('Expected exactly one @version metadata line')
  }
  return matches[0][1]
}

export function assertReleaseDiff(diff, artifactPath) {
  if (diff !== ARTIFACT_DIFF(artifactPath)) {
    throw new Error(`Release commit must only add ${artifactPath}`)
  }
}
