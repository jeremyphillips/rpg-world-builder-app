import type {
  Campaign,
  CreateCampaignInput,
  UpdateCampaignCharacterCreationInput,
} from '@rpg/contracts'
import type { User } from '@rpg/contracts'

import { createCampaign } from '../../features/campaign'
import { makeTestUser } from './users'

type MakeTestCampaignOptions = {
  owner?: User
  name?: string
  characterCreation?: UpdateCampaignCharacterCreationInput
  flavor?: CreateCampaignInput['flavor']
}

export type TestCampaignContext = Campaign & { owner: User }

/** Creates a persisted campaign with owner membership for service-level integration tests. */
export async function makeTestCampaign(
  options: MakeTestCampaignOptions = {},
): Promise<TestCampaignContext> {
  const owner = options.owner ?? (await makeTestUser())
  const campaign = await createCampaign({
    name: options.name ?? 'Test Campaign',
    createdBy: owner.id,
    ...(options.characterCreation !== undefined && {
      characterCreation: options.characterCreation,
    }),
    ...(options.flavor !== undefined && { flavor: options.flavor }),
  })

  return { ...campaign, owner }
}
