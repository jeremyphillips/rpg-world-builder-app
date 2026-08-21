import { describe, expect, it } from 'vitest'

import {
  createCampaignNpcBuilderContextFixture,
  createCampaignPcBuilderContextFixture,
  createStandaloneBuilderContextFixture,
} from '../fixtures/character-builder-fixtures'
import { resolveFullBuilderDefaultLevel } from './builder-default-level.lib'

describe('resolveFullBuilderDefaultLevel', () => {
  it('prefers level 1 for standalone PCs', () => {
    expect(resolveFullBuilderDefaultLevel(createStandaloneBuilderContextFixture())).toBe(1)
  })

  it('prefers level 1 for campaign NPCs with level zero enabled', () => {
    expect(resolveFullBuilderDefaultLevel(createCampaignNpcBuilderContextFixture())).toBe(1)
  })

  it('falls back to campaign starting level for fixed campaign PCs', () => {
    expect(resolveFullBuilderDefaultLevel(createCampaignPcBuilderContextFixture())).toBe(3)
  })
})
