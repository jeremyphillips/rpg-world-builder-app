import { describe, expect, it } from 'vitest'

import type { ContentFormCtx } from '../forms/registry/content-form-registry'

/** Documents buildContentFormCtx contract: unresolved campaign lookup must not invent rulesetId. */
describe('content form ctx ruleset authority', () => {
  it('leaves rulesetId undefined when campaign lookup has not resolved', () => {
    const ctx: Pick<ContentFormCtx, 'campaignId' | 'rulesetId'> = {
      campaignId: 'camp-1',
      rulesetId: undefined,
    }
    expect(ctx.rulesetId).toBeUndefined()
  })
})
