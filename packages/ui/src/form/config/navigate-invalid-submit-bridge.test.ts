import { describe, expect, it, vi } from 'vitest'
import type { UseFormReturn } from 'react-hook-form'

import {
  FORM_BRIDGE_MISMATCH_MESSAGE,
  navigateInvalidSubmit,
} from './navigate-invalid-submit.client'

const ui = { markSubmitAttempted: vi.fn(), addValidationSessionExpandKeys: vi.fn() }

describe('navigateInvalidSubmit bridge mismatch', () => {
  it('shows safe retry copy and a diagnostic when RHF blocks without a canonical issue', () => {
    const setError = vi.fn()
    const diagnostic = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const form = { setError, getValues: vi.fn() } as unknown as UseFormReturn<{ a: string }>
    navigateInvalidSubmit(form, [], 'f', ui, { a: { type: 'custom' } } as never)
    expect(setError).toHaveBeenCalledWith('root', {
      type: 'bridge',
      message: FORM_BRIDGE_MISMATCH_MESSAGE,
    })
    expect(diagnostic).toHaveBeenCalled()
    diagnostic.mockRestore()
  })
})
