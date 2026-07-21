import { SPECIES_CONTENT_TYPE_TERM, SPELL_CONTENT_TYPE_TERM } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import {
  formatAddContentTypeLabel,
  formatChooseContentTypePlaceholder,
  formatContentCollectionAvailabilityCaption,
  formatContentCreateHeading,
  formatContentListLoadErrorMessage,
  formatContentLoadErrorMessage,
  formatContentNotFoundMessage,
  formatContentOverviewCaption,
  formatContentOverviewLinkTitle,
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

  it('formats load error messages in singular and plural', () => {
    expect(formatContentLoadErrorMessage('species')).toBe('Could not load species.')
    expect(formatContentListLoadErrorMessage('species')).toBe('Could not load species.')
    expect(formatContentLoadErrorMessage('skill-proficiencies')).toBe(
      'Could not load skill proficiency.',
    )
    expect(formatContentListLoadErrorMessage('skill-proficiencies')).toBe(
      'Could not load skill proficiencies.',
    )
    expect(formatContentLoadErrorMessage('classes')).toBe('Could not load class.')
    expect(formatContentListLoadErrorMessage('classes')).toBe('Could not load classes.')
  })

  it('formats overview captions from plural sentence forms', () => {
    expect(formatContentOverviewCaption('species', 'Playable')).toBe(
      'Playable species available in this campaign',
    )
    expect(formatContentOverviewCaption('classes', 'Character')).toBe(
      'Character classes available in this campaign',
    )
    expect(formatContentCollectionAvailabilityCaption('spells')).toBe(
      'Spells available in this campaign',
    )
    expect(formatContentOverviewLinkTitle('spells')).toBe('Spell Overview')
    expect(formatContentOverviewLinkTitle('feats')).toBe('Feat Overview')
  })

  it('formats choose and add helpers', () => {
    expect(formatChooseContentTypePlaceholder('classes', { plural: true })).toBe('Choose classes…')
    expect(formatAddContentTypeLabel('equipment')).toBe('Add equipment')
  })

  it('derives aliases from the registry', () => {
    expect(SPECIES_CONTENT_TYPE_TERM.label).toBe(getContentTypeItemLabel('species'))
    expect(SPELL_CONTENT_TYPE_TERM.label).toBe(getContentTypeItemLabel('spells'))
  })
})
