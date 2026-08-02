import { describe, expect, it, vi } from 'vitest'

import { submitVocabularyEntrySheet } from './vocabulary-entry-sheet.lib'

describe('submitVocabularyEntrySheet', () => {
  it('maps create availability to status on initial submit', async () => {
    const onSubmit = vi.fn()

    await submitVocabularyEntrySheet({
      values: { label: 'Construct', description: '', available: false },
      isEdit: false,
      campaignId: 'camp_1',
      setId: 'creature-types',
      onSubmit,
      onBlocked: vi.fn(),
    })

    expect(onSubmit).toHaveBeenCalledWith({
      label: 'Construct',
      description: '',
      status: 'disabled',
    })
  })

  it('defaults create availability to active when available is true', async () => {
    const onSubmit = vi.fn()

    await submitVocabularyEntrySheet({
      values: { label: 'Construct', description: '', available: true },
      isEdit: false,
      campaignId: 'camp_1',
      setId: 'creature-types',
      onSubmit,
      onBlocked: vi.fn(),
    })

    expect(onSubmit).toHaveBeenCalledWith({
      label: 'Construct',
      description: '',
      status: 'active',
    })
  })
})
