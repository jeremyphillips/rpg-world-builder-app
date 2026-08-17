/** Additional-tier test factories — no CONTENT_TYPE_KEYS parity requirement. */
export { makeCampaign, makeCampaignListItem, VIEWER_STATE } from './campaign'
export { makeClassStored, storedDruidClassStored, storedFighterClassStored } from './class-stored'
export { makeCharacterBuildCatalog, populatedBuilderCatalog } from './character-build-catalog'
export { makeSubclass } from './subclass'
export {
  makePcCharacter,
  makeCampaignNpcListItem,
  makeCampaignNpcDetail,
  SAMPLE_PC,
} from './character'
export {
  makeLocationCreateIntent,
  makeBuildingLocationCreateIntent,
  makeSettlementLocationCreateIntent,
  makeRegionLocationCreateIntent,
} from './location-create-intent'
export { makeHeritageForm, draconicHeritageForm } from './heritage'

import { makeCampaign, makeCampaignListItem } from './campaign'
import { makeClassStored } from './class-stored'
import { makeCharacterBuildCatalog } from './character-build-catalog'
import { makePcCharacter } from './character'
import { makeSubclass } from './subclass'

/** Factory exports scanned for boundary guard protected types. */
export const ADDITIONAL_TEST_FACTORY_EXPORTS = [
  makeCampaign,
  makeCampaignListItem,
  makeClassStored,
  makeCharacterBuildCatalog,
  makeSubclass,
  makePcCharacter,
] as const
