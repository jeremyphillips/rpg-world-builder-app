import { describe, expect, it } from 'vitest'

import type { FacingInvalidCode } from './facing-document'
import {
  FACING_INVALID_DETAIL_MESSAGES,
  FACING_INVALID_PANEL_MESSAGES,
  facingInvalidMessage,
} from './facing-invalid-messages'

const FACING_INVALID_CODES = [
  'missing-kind',
  'missing-id',
  'host-mismatch',
] as const satisfies readonly FacingInvalidCode[]

describe('facingInvalidMessage', () => {
  it('covers every FacingInvalidCode on panel and detail surfaces', () => {
    for (const code of FACING_INVALID_CODES) {
      expect(FACING_INVALID_PANEL_MESSAGES[code]).toBe(facingInvalidMessage(code, 'panel'))
      expect(FACING_INVALID_DETAIL_MESSAGES[code]).toBe(facingInvalidMessage(code, 'detail'))
    }
  })

  it('defaults to panel copy for shared preview chrome', () => {
    expect(facingInvalidMessage('missing-kind')).toBe(FACING_INVALID_PANEL_MESSAGES['missing-kind'])
  })

  it('keeps intentional panel vs detail wording (row/preview vs feature/detail host)', () => {
    expect(FACING_INVALID_PANEL_MESSAGES['missing-kind']).toContain('row')
    expect(FACING_INVALID_PANEL_MESSAGES['missing-kind']).toContain('preview')
    expect(FACING_INVALID_DETAIL_MESSAGES['missing-kind']).toContain('feature')
    expect(FACING_INVALID_DETAIL_MESSAGES['missing-kind']).not.toContain('preview')
  })
})
