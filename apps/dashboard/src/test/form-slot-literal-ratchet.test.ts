import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const srcRoot = fileURLToPath(new URL('../', import.meta.url))
const baselinePath = fileURLToPath(new URL('./form-slot-literal-baseline.json', import.meta.url))

function productionSlotCounts(root: string): Record<string, number> {
  const counts: Record<string, number> = {}
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const path = join(dir, entry)
      if (statSync(path).isDirectory()) {
        walk(path)
        continue
      }
      if (!/\.(ts|tsx)$/.test(entry) || /\.test\.|\.stories\./.test(entry)) continue
      const count = (readFileSync(path, 'utf8').match(/kind:\s*'slot'/g) ?? []).length
      if (count > 0) counts[relative(root, path)] = count
    }
  }
  walk(root)
  return counts
}

describe('form slot literal ratchet', () => {
  it('does not grow static kind: slot counts beyond the baseline', () => {
    const baseline = JSON.parse(readFileSync(baselinePath, 'utf8')) as Record<string, number>
    const current = productionSlotCounts(srcRoot)
    const growth: string[] = []
    for (const [file, count] of Object.entries(current)) {
      const allowed = baseline[file] ?? 0
      if (count > allowed) growth.push(`${file}: ${allowed} -> ${count}`)
    }
    expect(
      growth,
      [
        "A production file added kind: 'slot' literals.",
        'Prefer visibility, optionsResolve, hint.resolve, derivedMeta, valueSyncs, dependent, or optionalDisclosure.',
        'If a slot is still required, add a row to apps/dashboard/docs/form-slot-register.md and raise that file in form-slot-literal-baseline.json.',
      ].join('\n'),
    ).toEqual([])
  })
})
