import { describe, expect, it } from 'vitest'
import type { UseFormReturn } from 'react-hook-form'

import {
  consumeContentFormPersistBaselineReset,
  markContentFormPersistBaselineReset,
} from './content-form-persist-baseline-reset.lib'

describe('content form persist baseline reset marker', () => {
  it('consumes a one-shot marker for post-persist baseline sync', () => {
    const form = {} as UseFormReturn<{ name: string }>
    markContentFormPersistBaselineReset(form)
    expect(consumeContentFormPersistBaselineReset(form)).toBe(true)
    expect(consumeContentFormPersistBaselineReset(form)).toBe(false)
  })
})
