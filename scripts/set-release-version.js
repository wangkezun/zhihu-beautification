import { readFile, writeFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'

const TAG_PATTERN = /^v(\d+\.\d+\.\d+)$/
const VERSION_LINE_PATTERN = /^\/\/ @version\s+.*$/gm

export function versionFromTag(tag) {
  const match = TAG_PATTERN.exec(tag)
  if (!match) throw new Error(`Invalid release tag: ${tag}`)
  return match[1]
}

export function replaceMetadataVersion(metadata, version) {
  const matches = metadata.match(VERSION_LINE_PATTERN) || []
  if (matches.length !== 1) {
    throw new Error('Expected exactly one @version metadata line')
  }
  return metadata.replace(VERSION_LINE_PATTERN, `// @version      ${version}`)
}

async function main() {
  const [, , tag, metaPath] = process.argv
  if (!tag || !metaPath) {
    throw new Error('Usage: node scripts/set-release-version.js <tag> <meta-path>')
  }
  const version = versionFromTag(tag)
  const metadata = await readFile(metaPath, 'utf8')
  await writeFile(metaPath, replaceMetadataVersion(metadata, version))
  process.stdout.write(`${version}\n`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
}
