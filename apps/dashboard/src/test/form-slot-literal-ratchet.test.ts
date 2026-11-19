import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import { collectSlotIdentities, type SlotIdentityCounts } from './form-slot-identities'

const srcRoot = fileURLToPath(new URL('../', import.meta.url))
const baselinePath = fileURLToPath(new URL('./form-slot-literal-baseline.json', import.meta.url))

function isProductionSource(entry: string): boolean {
  return /\.(ts|tsx)$/.test(entry) && !/\.test\.|\.stories\./.test(entry)
}

export function productionSlotIdentities(root: string): SlotIdentityCounts {
  const counts: SlotIdentityCounts = {}
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const path = join(dir, entry)
      if (statSync(path).isDirectory()) {
        walk(path)
        continue
      }
      if (!isProductionSource(entry)) continue
      const file = relative(root, path)
      const found = collectSlotIdentities(readFileSync(path, 'utf8'), file)
      for (const [key, count] of Object.entries(found)) {
        counts[key] = (counts[key] ?? 0) + count
      }
    }
  }
  walk(root)
  return counts
}

describe('form slot identity ratchet', () => {
  it('does not add slot identities beyond the allowlist', () => {
    const baseline = JSON.parse(readFileSync(baselinePath, 'utf8')) as SlotIdentityCounts
    const current = productionSlotIdentities(srcRoot)
    const growth: string[] = []
    for (const [identity, count] of Object.entries(current)) {
      const allowed = baseline[identity] ?? 0
      if (count > allowed) growth.push(`${identity}: ${allowed} -> ${count}`)
    }
    expect(
      growth,
      [
        "A production file added or renamed a kind: 'slot' identity.",
        'Prefer visibility, optionsResolve, hint.resolve, derivedMeta, valueSyncs, dependent, display, or optionalDisclosure.',
        'A confirm-gated multi-path write stays a feature controller plus ConfirmDialog.',
        'If a slot is still required, add a row to apps/dashboard/docs/form-slot-register.md and raise that identity in form-slot-literal-baseline.json.',
      ].join('\n'),
    ).toEqual([])
  })
})
