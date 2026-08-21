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
export { CharacterBuilderDraftRestore } from './components/builder/chrome/character-builder-draft-restore.client'
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
export { CharacterBuilderShell } from './components/builder/character-builder-shell.client'
export { CampaignCharacterStatusSummary } from './components/detail/status/campaign-character-status-summary.client'
export { CharacterDetailContent } from './components/detail/character-detail-content.client'
export { CharacterOrganizationsSummary } from './components/detail/memberships/character-organizations-summary.client'
export { CharacterOrganizationMembershipsContainer } from './components/detail/memberships/character-organization-memberships-container.client'
export { CharacterSheetDetailShell } from './components/detail/character-sheet-detail-shell'
export { BuilderInventoryRemoveAction } from './components/builder/inventory/builder-inventory-remove-action.client'
export { NpcAuthoringGate } from './npc/components/npc-authoring-gate.client'
export { CatalogPickerSelectionActions } from './components/picker/catalog-picker-selection-actions.client'
export {
  CatalogPickerMetadataRenderer,
  type CatalogPickerMetadataLine,
} from './components/picker/catalog-picker-metadata'
export { catalogPickerShellProps } from './components/picker/catalog-picker-shell.lib'
export { compareName, scoreAndFilterPickerItems } from './components/picker/catalog-picker-sort.lib'
export {
  CatalogEntityRow,
  CatalogEntityPickerSheet,
  createCatalogEntityRowRenderer,
} from '@/features/content'
export { resolveCatalogPickerRowActionPhase } from './components/picker/catalog-picker-row-action.lib'
export { CATALOG_PICKER_COMMIT_SUCCESS_MS } from './components/picker/use-catalog-picker-commit-confirmation.client'
export {
  characterOrganizationReferencesQueryKey,
  useCharacterOrganizationReferences,
} from './hooks/use-character-organization-references'
export { EditOrganizationMembershipDrawer } from './components/connections/edit-organization-membership-drawer.client'
export {
  CHARACTER_SHEET_EDIT_MEMBERSHIP_COPY,
  formatRemoveMembershipHeadline,
  type EditOrganizationMembershipDrawerCopy,
  type EditOrganizationMembershipOrganization,
} from './components/connections/edit-organization-membership-drawer.types'
export { OrganizationMembershipTitleField } from './components/connections/organization-membership-title-field.client'
export {
  membershipRadioValueFromTitle,
  titleFromMembershipRadioValue,
} from './components/connections/organization-membership-title-field.lib'
export { ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE } from './components/connections/organization-membership-title-field.types'
export {
  createCharacterOrganizationMembership,
  deleteCharacterOrganizationMembership,
  updateCharacterOrganizationMembership,
} from './api/organization-membership-client'
export {
  invalidateCharacterOrganizationMembershipQueries,
  type CharacterOrganizationMembershipSubjectKind,
} from './lib/invalidate-character-organization-membership-queries'
export {
  characterLocationReferencesQueryKey,
  useCharacterLocationReferences,
} from './hooks/use-character-location-references'
export { useCreateNpc } from './npc/hooks/use-create-npc'
export { useNpcs, npcsQueryKey } from './npc/hooks/use-npcs'
export { fetchCampaignNpcs, invalidateCampaignNpcQueries } from './npc/lib/fetch-campaign-npcs.lib'
export {
  mapContentCreateContextToQuickNpcCreateContext,
  QUICK_NPC_CREATE_SUBMIT_LABEL,
  type QuickNpcCreateFormOrganization,
  type QuickNpcCreateContext,
} from './npc/lib/quick-npc/quick-npc-create-context'
export {
  QuickNpcCreateModal,
  QUICK_NPC_CREATE_TITLE,
} from './npc/components/quick-npc/quick-npc-create-modal.client'
export {
  QuickNpcAuthoringForm,
  type QuickNpcAuthoringFormProps,
} from './npc/components/quick-npc/quick-npc-authoring-form.client'
export {
  type QuickNpcAuthoringValues,
  type QuickNpcSetupValues,
} from './npc/lib/quick-npc/quick-npc-form-fields'
export { buildQuickNpcClassRadioCardPresentation } from './npc/lib/quick-npc/quick-npc-class-option-groups.lib'
export { resolveQuickNpcClassOptionGroups } from './npc/lib/quick-npc/quick-npc-class-option-groups.lib'
export { buildQuickNpcSpeciesRadioCardPresentation } from './npc/lib/quick-npc/quick-npc-species-option-groups.lib'
export {
  buildCharacterDetailViewModel,
  buildCharacterCardViewModel,
  buildCharacterEntitySummaryVmFromCatalog,
  buildCharacterEntitySummaryVmFromTransport,
  buildCharacterEntitySummarySearchText,
  formatCharacterInlineSummary,
  formatCharacterMixedHeadingSuffix,
  buildCharacterEntityContextPresentation,
  resolveCharacterControllerDisplay,
  normalizePartyController,
  normalizeListController,
  UNAVAILABLE_ORGANIZATION_LABEL,
  UNAVAILABLE_LOCATION_LABEL,
  type CharacterDetailViewModel,
  type CharacterCardViewModel,
  type CharacterEntitySummaryVm,
} from './lib/display/character-display'
export { CHARACTER_CONTROLLER_DISPLAY } from './lib/display/character-display-labels'
export { formatContentReferenceLabel } from './lib/display/format-content-reference-label'
export {
  SAMPLE_PC,
  makeCampaignNpcListItem,
  makeCampaignNpcDetail,
} from './lib/fixtures/character-fixtures'
export {
  populatedBuilderCatalog,
  createStandaloneBuilderContextFixture,
  createPopulatedStandaloneBuilderContextFixture,
  createStandaloneBuilderCatalogIndexFixture,
  createCampaignNpcBuilderContextFixture,
  createCampaignPcBuilderContextFixture,
} from './lib/fixtures/character-builder-fixtures'
export { isNonEmptyCharacterBuilderDraft } from './lib/draft/is-non-empty-character-builder-draft'
export {
  createCharacterBuilderStore,
  getCharacterBuilderStore,
  resetCharacterBuilderStoreCache,
  type CharacterBuilderStoreState,
} from './store/character-builder-store'
