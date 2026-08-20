import { describe, expect, it } from 'vitest'

import { ROUTES } from '@/app/routes'
import { STORY_CAMPAIGN_ID } from '@/test/fixtures/constants'

import {
  createCampaignNpcBuilderContextFixture,
  createCampaignPcBuilderContextFixture,
  createStandaloneBuilderContextFixture,
} from '../fixtures/character-builder-fixtures'
import { getBuilderChromeCopy, getBuilderChromeCopyForContext } from './builder-chrome-copy'

describe('getBuilderChromeCopy', () => {
  it('returns PC builder chrome by default', () => {
    expect(getBuilderChromeCopy('standalone_pc')).toMatchObject({
      pageHeading: 'New character',
      createLabel: 'Create character',
      exitHref: ROUTES.characters.list,
      importHref: ROUTES.characters.import,
      reviewReadyMessage: 'Your character is ready to create.',
      draftRestoreHeadline: 'Continue your character?',
    })
  })

  it('returns NPC builder chrome for campaign authoring', () => {
    expect(getBuilderChromeCopy('campaign_npc', 'camp-1')).toMatchObject({
      pageHeading: 'New NPC',
      createLabel: 'Create NPC',
      exitHref: ROUTES.campaign.npcs.list('camp-1'),
      importHref: ROUTES.campaign.npcs.import('camp-1'),
      importLabel: 'Import NPC',
      reviewReadyMessage: 'This NPC is ready to add to your campaign.',
      draftRestoreHeadline: 'Continue your NPC draft?',
    })
  })

  it('returns invite PC builder chrome without import routes', () => {
    expect(getBuilderChromeCopy('campaign_onboarding_pc')).toMatchObject({
      pageHeading: 'Create your campaign character',
      createLabel: 'Create campaign character',
      exitHref: '#',
      importHref: null,
      importLabel: null,
      reviewStepDescription: 'Review and create your campaign character',
    })
  })
})

describe('getBuilderChromeCopyForContext', () => {
  it('resolves standalone PC chrome from context', () => {
    expect(getBuilderChromeCopyForContext(createStandaloneBuilderContextFixture())).toMatchObject({
      pageHeading: 'New character',
      exitHref: ROUTES.characters.list,
    })
  })

  it('resolves campaign invite PC chrome from context', () => {
    expect(getBuilderChromeCopyForContext(createCampaignPcBuilderContextFixture())).toMatchObject({
      pageHeading: 'Create your campaign character',
      exitHref: '#',
      reviewStepDescription: 'Review and create your campaign character',
    })
  })

  it('resolves campaign NPC chrome from context', () => {
    expect(getBuilderChromeCopyForContext(createCampaignNpcBuilderContextFixture())).toMatchObject({
      pageHeading: 'New NPC',
      exitHref: ROUTES.campaign.npcs.list(STORY_CAMPAIGN_ID),
    })
  })
})
