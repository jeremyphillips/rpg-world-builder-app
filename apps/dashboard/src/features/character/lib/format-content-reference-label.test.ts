import { describe, expect, it } from 'vitest'

import { formatContentReferenceLabel } from './format-content-reference-label'

describe('formatContentReferenceLabel', () => {
  it('title-cases hyphenated slugs', () => {
    expect(formatContentReferenceLabel('magic-missile')).toBe('Magic Missile')
  })

  it('title-cases underscored slugs', () => {
    expect(formatContentReferenceLabel('chain_mail')).toBe('Chain Mail')
  })

  it('strips namespace prefixes before formatting', () => {
    expect(formatContentReferenceLabel('srd-cc-5.2.1:fire-bolt')).toBe('Fire Bolt')
  })
})
