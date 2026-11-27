import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { buildSeedRowIdsByPath } from './seed-row-ids-by-path'
import { compileOverlayPolicy } from './compile-policy'
import { overlayDeleteEntryIdRows, overlayRestoreIdRows } from './overlay-presets'

const traitSchema = z.object({ id: z.string(), name: z.string() })

const schema = z.object({
  name: z.string(),
  traits: overlayRestoreIdRows(traitSchema),
  equipment: overlayDeleteEntryIdRows(z.object({ entryId: z.string(), label: z.string() })),
})

describe('buildSeedRowIdsByPath', () => {
  const policy = (() => {
    const compiled = compileOverlayPolicy(schema)
    if (!compiled.ok) throw new Error(compiled.issues.join('\n'))
    return compiled.policy
  })()

  const catalogSeed = {
    name: 'Owlbear',
    traits: [{ id: 'keen-sight', name: 'Keen Sight' }],
    equipment: [{ entryId: 'club', label: 'Club' }],
  }

  it('lists only catalog seed ids at restore collections', () => {
    const paths = buildSeedRowIdsByPath(catalogSeed, policy)
    expect(paths).toEqual({ traits: ['keen-sight'] })
  })
})
