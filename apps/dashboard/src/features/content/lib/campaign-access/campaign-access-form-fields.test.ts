import { describe, it } from 'vitest'
import { contentCampaignAccessPatchSchema } from '@rpg/contracts'
import { assertFieldPathsRegistered, assertRegistryCoverage } from '@rpg/ui/form/test-utils'

import { buildCampaignAccessFields } from './campaign-access-form-fields'

describe('campaign-access-form-fields', () => {
  const fields = buildCampaignAccessFields({
    targetType: 'feats',
    available: true,
    pending: false,
    groupId: 'campaign-access-test',
    participantOptions: [{ value: 'pc-1', label: 'Aldric · Player One' }],
  })

  it('registers field paths for validation messaging', () => {
    assertFieldPathsRegistered(fields)
  })

  it('covers the campaign access patch schema', () => {
    assertRegistryCoverage(contentCampaignAccessPatchSchema, fields)
  })
})
