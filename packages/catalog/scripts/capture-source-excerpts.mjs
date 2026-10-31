/**
 * Writes revision-1 source excerpts and their lock file.
 * Run: node packages/catalog/scripts/capture-source-excerpts.mjs --input <file> --out <dir>
 * The input file is capture metadata plus passage text. It is not a second store.
 */
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

function canonicalize(value) {
  if (typeof value === 'string') return value.normalize('NFC')
  if (typeof value !== 'object' || value === null) return value
  if (Array.isArray(value)) return value.map(canonicalize)
  const normalized = {}
  for (const key of Object.keys(value).sort()) {
    if (value[key] !== undefined) normalized[key] = canonicalize(value[key])
  }
  return normalized
}

function fingerprint(revision) {
  return createHash('sha256')
    .update(JSON.stringify(canonicalize(revision)), 'utf8')
    .digest('hex')
}

function readArgs(argv) {
  const inputIndex = argv.indexOf('--input')
  const outIndex = argv.indexOf('--out')
  const input = inputIndex >= 0 ? argv[inputIndex + 1] : undefined
  const out = outIndex >= 0 ? argv[outIndex + 1] : undefined
  if (!input || !out) {
    throw new Error('Usage: capture-source-excerpts.mjs --input <file> --out <directory>')
  }
  return { input, out }
}

const args = readArgs(process.argv.slice(2))
const input = JSON.parse(readFileSync(args.input, 'utf8'))
const revisions = input.excerpts.map((excerpt) => ({
  documentId: input.documentId,
  excerptId: excerpt.excerptId,
  revision: 1,
  ...(excerpt.locator ? { locator: excerpt.locator } : {}),
  text: excerpt.text.normalize('NFC'),
  transcription: input.transcription,
  capturedAt: input.capturedAt,
}))
const contentTypeKey = revisions[0]?.excerptId.split('/')[0]
if (!contentTypeKey) throw new Error('Capture input has no excerpts.')

const lock = {}
for (const revision of revisions) {
  lock[`${revision.excerptId}@${revision.revision}`] = fingerprint(revision)
}
const orderedLock = Object.fromEntries(Object.entries(lock).sort(([a], [b]) => a.localeCompare(b)))

mkdirSync(join(args.out, input.documentId), { recursive: true })
writeFileSync(
  join(args.out, input.documentId, `${contentTypeKey}.json`),
  `${JSON.stringify(revisions, null, 2)}\n`,
)
writeFileSync(
  join(args.out, input.documentId, 'excerpts.lock.json'),
  `${JSON.stringify(orderedLock, null, 2)}\n`,
)
