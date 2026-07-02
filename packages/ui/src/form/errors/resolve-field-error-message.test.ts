import { describe, expect, it } from 'vitest'

import { encodeStructuredMessage } from '@rpg/contracts'

import {
  resolveFieldErrorMessage,
  resolveFirstFieldErrorMessage,
} from './resolve-field-error-message'

describe('resolveFieldErrorMessage', () => {
  it('returns undefined for empty input', () => {
    expect(resolveFieldErrorMessage()).toBeUndefined()
    expect(resolveFieldErrorMessage('')).toBeUndefined()
  })

  it('passes through plain messages', () => {
    expect(resolveFieldErrorMessage('Tier label is required.')).toBe('Tier label is required.')
  })

  it('decodes structured field messages', () => {
    const structured = encodeStructuredMessage('Tier label is required.', 'Missing Tier label')
    expect(resolveFieldErrorMessage(structured)).toBe('Tier label is required.')
  })

  it('returns the first decoded message from candidates', () => {
    const structured = encodeStructuredMessage('Choose a rarity.', 'Missing Rarity')
    expect(resolveFirstFieldErrorMessage(undefined, structured)).toBe('Choose a rarity.')
    expect(resolveFirstFieldErrorMessage('Quantity is required.', structured)).toBe(
      'Quantity is required.',
    )
  })
})
