import { describe, expect, it } from 'vitest'

import { ROUTES } from '@/app/routes'

import { getBuilderChromeCopy } from './builder-chrome-copy'

describe('getBuilderChromeCopy', () => {
  it('returns PC builder chrome by default', () => {
    expect(getBuilderChromeCopy('pc')).toMatchObject({
      pageHeading: 'New character',
      createLabel: 'Create character',
      exitHref: ROUTES.characters.list,
      importHref: ROUTES.characters.import,
      reviewReadyMessage: 'Your character is ready to create.',
      draftRestoreHeadline: 'Continue your character?',
    })
  })

  it('returns NPC builder chrome for campaign authoring', () => {
    expect(getBuilderChromeCopy('npc', 'camp-1')).toMatchObject({
      pageHeading: 'New NPC',
      createLabel: 'Create NPC',
      exitHref: ROUTES.campaign.npcs.list('camp-1'),
      importHref: ROUTES.campaign.npcs.import('camp-1'),
      importLabel: 'Import NPC',
      reviewReadyMessage: 'This NPC is ready to add to your campaign.',
      draftRestoreHeadline: 'Continue your NPC draft?',
    })
  })
})
