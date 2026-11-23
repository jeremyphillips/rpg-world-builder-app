import type { FacingReason } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { facingReasonMessage } from './facing-reason-message'

const REASON_CODES = [
  { code: 'missing-rules-text' },
  { code: 'missing-kind' },
  { code: 'missing-attack-input', field: 'attack-bonus' },
  { code: 'missing-multiattack-steps' },
  { code: 'missing-spell-configuration' },
  { code: 'incomplete-spellcasting' },
  { code: 'spellcasting-progression-unavailable' },
  { code: 'incomplete-trait' },
  { code: 'catalog-pending', catalog: 'equipment' },
  { code: 'catalog-error', catalog: 'spells' },
  { code: 'derived-conflict' },
  { code: 'unsupported-kind' },
  { code: 'unresolvable-record' },
  { code: 'unexpected' },
] as const satisfies readonly FacingReason[]

describe('facingReasonMessage', () => {
  it.each(REASON_CODES)('returns a non-empty sentence for %#', (reason) => {
    expect(facingReasonMessage(reason).trim().length).toBeGreaterThan(0)
  })

  it('keeps attack incomplete copy on the attack template', () => {
    expect(facingReasonMessage({ code: 'missing-attack-input', field: 'attack-bonus' })).toContain(
      'calculate this attack',
    )
  })

  it('does not use attack copy for generic missing rules text', () => {
    const message = facingReasonMessage({ code: 'missing-rules-text' })
    expect(message.toLowerCase()).not.toContain('attack')
  })
})
