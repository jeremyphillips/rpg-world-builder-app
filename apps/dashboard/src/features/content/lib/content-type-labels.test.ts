import { SPECIES_CONTENT_TYPE_TERM, SPELL_CONTENT_TYPE_TERM } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import {
  formatContentCreateHeading,
  formatContentNotFoundMessage,
  formatContentOverviewCaption,
  getContentTypeCollectionLabel,
  getContentTypeItemLabel,
  getContentTypeMidSentenceLabel,
  getContentTypeSentenceLabel,
} from './content-type-labels'

describe('content type labels', () => {
  it('builds collection labels from plural sentence forms', () => {
    expect(getContentTypeCollectionLabel('species')).toBe('Species')
    expect(getContentTypeCollectionLabel('classes')).toBe('Classes')
    expect(getContentTypeCollectionLabel('skill-proficiencies')).toBe('Skill Proficiencies')
  })

  it('builds item labels from singular term labels', () => {
    expect(getContentTypeItemLabel('species')).toBe('Species')
    expect(getContentTypeItemLabel('classes')).toBe('Class')
    expect(getContentTypeItemLabel('skill-proficiencies')).toBe('Skill Proficiency')
  })

  it('builds sentence labels with leading capital', () => {
    expect(getContentTypeSentenceLabel('species')).toBe('Species')
    expect(getContentTypeSentenceLabel('skill-proficiencies')).toBe('Skill proficiency')
    expect(getContentTypeSentenceLabel('skill-proficiencies', { plural: true })).toBe(
      'Skill proficiencies',
    )
  })

  it('builds mid-sentence labels without leading capital', () => {
    expect(getContentTypeMidSentenceLabel('species')).toBe('species')
    expect(getContentTypeMidSentenceLabel('skill-proficiencies')).toBe('skill proficiency')
  })

  it('formats create headings and not-found messages', () => {
    expect(formatContentCreateHeading('species')).toBe('New Species')
    expect(formatContentNotFoundMessage('species')).toBe('Species not found.')
    expect(formatContentCreateHeading('skill-proficiencies')).toBe('New Skill Proficiency')
    expect(formatContentNotFoundMessage('skill-proficiencies')).toBe('Skill proficiency not found.')
  })

  it('formats overview captions from plural sentence forms', () => {
    expect(formatContentOverviewCaption('species', 'Playable')).toBe(
      'Playable species available in this campaign',
    )
    expect(formatContentOverviewCaption('classes', 'Character')).toBe(
      'Character classes available in this campaign',
    )
  })

  it('derives aliases from the registry', () => {
    expect(SPECIES_CONTENT_TYPE_TERM.label).toBe(getContentTypeItemLabel('species'))
    expect(SPELL_CONTENT_TYPE_TERM.label).toBe(getContentTypeItemLabel('spells'))
  })
})
