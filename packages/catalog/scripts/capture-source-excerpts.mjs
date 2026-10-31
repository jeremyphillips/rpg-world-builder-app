/**
 * Writes revision-1 source excerpts, their lock file, and optional seed provenance.
 * Run: pnpm exec tsx packages/catalog/scripts/capture-source-excerpts.mjs --input <file> --out <dir> [--seeds <file>]
 * The input file is capture metadata plus passage text. It is not a second store.
 * Fingerprints come from `@rpg/catalog` `captureSourceExcerpts`, not a second canonical JSON.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import {
  applyCapturedProvenance,
  captureSourceExcerpts,
} from '../src/source-excerpts/capture-source-excerpts.ts'

function readArgs(argv) {
  const inputIndex = argv.indexOf('--input')
  const outIndex = argv.indexOf('--out')
  const seedsIndex = argv.indexOf('--seeds')
  const input = inputIndex >= 0 ? argv[inputIndex + 1] : undefined
  const out = outIndex >= 0 ? argv[outIndex + 1] : undefined
  const seeds = seedsIndex >= 0 ? argv[seedsIndex + 1] : undefined
  if (!input || !out) {
    throw new Error(
      'Usage: capture-source-excerpts.mjs --input <file> --out <directory> [--seeds <seed.json>]',
    )
  }
  return { input, out, seeds }
}

const args = readArgs(process.argv.slice(2))
const input = JSON.parse(readFileSync(args.input, 'utf8'))
const captured = await captureSourceExcerpts(input)

mkdirSync(join(args.out, input.documentId), { recursive: true })
writeFileSync(
  join(args.out, input.documentId, `${captured.contentTypeKey}.json`),
  `${JSON.stringify(captured.revisions, null, 2)}\n`,
)
writeFileSync(
  join(args.out, input.documentId, 'excerpts.lock.json'),
  `${JSON.stringify(captured.lock, null, 2)}\n`,
)

if (input.seeds) {
  if (!args.seeds)
    throw new Error('--seeds is required when the capture input attaches provenance.')
  const records = JSON.parse(readFileSync(args.seeds, 'utf8'))
  const updated = applyCapturedProvenance(records, {
    documentId: input.documentId,
    attachment: input.seeds,
    revisions: captured.revisions,
  })
  writeFileSync(args.seeds, `${JSON.stringify(updated, null, 2)}\n`)
}
