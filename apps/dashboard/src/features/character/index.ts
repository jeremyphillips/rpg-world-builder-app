export {
  createCharacter,
  deleteCharacter,
  getCharacter,
  getCharacterRoutingContext,
  listCharacters,
  type CreateCharacterInput,
  type PcCharacter,
} from './api/character-client'
export {
  buildContextQueryKey,
  fetchBuilderCatalog,
  fetchCharacterCreationRules,
  type BuilderCatalogLists,
} from './api/ruleset-content-client'
export { CharacterBuilderDraftRestore } from './components/character-builder-draft-restore.client'
export { CharacterListCard } from './components/character-list-card.client'
export type { CharacterListCardData } from './components/character-list-card.lib'
export { useBuildContext, type BuildContextResult } from './hooks/use-build-context'
export {
  useCampaignBuildContext,
  useCampaignCharacterBuildContext,
  useCampaignNpcBuildContext,
  useCampaignPcOnboardingBuildContext,
  type CampaignBuildContextResult,
} from './hooks/use-campaign-build-context'
export {
  campaignBuildContextQueryKey,
  fetchCampaignBuilderCatalog,
} from './api/campaign-content-client'
export { characterQueryKey, useCharacter } from './hooks/use-character'
export {
  characterRoutingContextQueryKey,
  useCharacterRoutingContext,
} from './hooks/use-character-routing-context'
export {
  useCharacterBuilderStorageKey,
  useCharacterBuilderStore,
} from './hooks/use-character-builder-store'
export { charactersQueryKey, useCharacters } from './hooks/use-characters'
export { useCreateCharacter } from './hooks/use-create-character'
export { useDeleteCharacter } from './hooks/use-delete-character'
export { CharacterBuilderShell } from './components/character-builder-shell.client'
export { CampaignCharacterStatusSummary } from './components/detail/campaign-character-status-summary.client'
export { CharacterDetailContent } from './components/detail/character-detail-content.client'
export { CharacterOrganizationsSummary } from './components/detail/character-organizations-summary.client'
export { CharacterSheetDetailShell } from './components/detail/character-sheet-detail-shell'
export { BuilderInventoryRow } from './components/builder/builder-inventory-row.client'
export { NpcAuthoringGate } from './npc/components/npc-authoring-gate.client'
export { CatalogPickerItemHeader } from './components/picker/catalog-picker-item-header.client'
export { CatalogPickerSelectionActions } from './components/picker/catalog-picker-selection-actions.client'
export { catalogPickerShellProps } from './components/picker/catalog-picker-shell.lib'
export { resolveCatalogPickerRowActionPhase } from './components/picker/catalog-picker-row-action.lib'
export { CATALOG_PICKER_COMMIT_SUCCESS_MS } from './components/picker/use-catalog-picker-commit-confirmation.client'
export {
  characterOrganizationReferencesQueryKey,
  useCharacterOrganizationReferences,
} from './hooks/use-character-organization-references'
export { useCreateNpc } from './npc/hooks/use-create-npc'
export { useNpcs, npcsQueryKey } from './npc/hooks/use-npcs'
export {
  buildCharacterDetailViewModel,
  buildCharacterCardViewModel,
  resolveCharacterControllerDisplay,
  normalizePartyController,
  normalizeListController,
  UNAVAILABLE_ORGANIZATION_LABEL,
  type CharacterDetailViewModel,
  type CharacterCardViewModel,
} from './lib/display/character-display'
export { CHARACTER_CONTROLLER_DISPLAY } from './lib/display/character-display-labels'
export {
  resolveQueryErrorLabel,
  combineQueryPending,
  combineQueryError,
} from './lib/resolve-query-error-label.lib'
export { SAMPLE_PC, makeCampaignNpcListItem, makeCampaignNpcDetail } from './lib/character-fixtures'
export {
  populatedBuilderCatalog,
  createStandaloneBuilderContextFixture,
  createPopulatedStandaloneBuilderContextFixture,
  createStandaloneBuilderCatalogIndexFixture,
  createCampaignNpcBuilderContextFixture,
  createCampaignPcBuilderContextFixture,
} from './lib/character-builder-fixtures'
export { isNonEmptyCharacterBuilderDraft } from './lib/draft/is-non-empty-character-builder-draft'
export {
  createCharacterBuilderStore,
  getCharacterBuilderStore,
  resetCharacterBuilderStoreCache,
  type CharacterBuilderStoreState,
} from './store/character-builder-store'
