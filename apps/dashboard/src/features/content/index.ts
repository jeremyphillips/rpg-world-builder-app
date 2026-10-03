// Lightweight cross-feature surface — keep before route/form exports to avoid barrel init cycles.
export {
  formatAddContentTypeLabel,
  formatContentCollectionAvailabilityCaption,
  formatContentCreateHeading,
  formatContentListLoadErrorMessage,
  getContentTypeCollectionLabel,
  getContentTypeItemLabel,
  getContentTypeMidSentenceLabel,
} from './lib/content-type-labels'
export {
  buildCatalogDrowGrantDisplayVocabulary,
  DROW_HERITAGE_GROUPED_SUMMARY_WITH_SUFFIX,
  DROW_HERITAGE_SHEET_SUMMARY_LINES,
  getCatalogDrowHeritageGrantGroups,
  getCatalogDrowHeritageOption,
  getDrowHeritageSpellCatalog,
  STORY_CAMPAIGN_ID,
  STORY_RULESET_ID,
  pickClass,
  pickEquipment,
  pickFeat,
  pickSkillProficiency,
  pickSpecies,
  pickSpell,
  pickSubclass,
  pickSubclassesForClass,
} from './lib/fixtures'
export {
  CatalogCollapsibleList,
  buildCatalogDisclosureLabel,
  CatalogMetadataRenderer,
  formatCatalogMetadataLines,
  type CatalogCollapsibleListProps,
  type CatalogMetadataLine,
} from './components/catalog'
export {
  ContentEntityCard,
  ContentEntityCardViewLink,
  type ContentEntityCardProps,
} from './lib/entity/surfaces/cards/content/content-entity-card'
export {
  DisclosureEntityCard,
  type DisclosureEntityCardProps,
} from './lib/entity/surfaces/cards/disclosure/disclosure-entity-card'
export {
  EntityDisclosureArrayItemShell,
  type EntityDisclosureArrayItemShellProps,
} from './lib/entity/surfaces/cards/disclosure/entity-disclosure-array-item-shell'
export { projectArrayItemEntitySummary } from './lib/entity/surfaces/cards/disclosure/array-item-entity-summary.lib'
export type { EntitySummaryModel } from './lib/entity/summary/entity-summary.types'
export type { EntitySummaryStatusItem } from './lib/entity/summary/entity-summary-status.types'
export type {
  EntityAnatomyTrailing,
  EntityAnatomyTrailingSecondary,
} from './lib/entity/anatomy/entity-anatomy-trailing.types'
export { EntityAnatomyHost } from './lib/entity/anatomy/entity-anatomy'
export { EntityActionChoiceMenu } from './lib/entity/action/entity-action-choice-menu'
export type {
  EntityActionChoiceMenuItem,
  EntityActionChoiceMenuProps,
} from './lib/entity/action/entity-action-choice-menu'
export { EntityRowList } from './lib/entity/row-list/entity-row-list'
export type {
  EntityRowListAction,
  EntityRowListEmptyProps,
  EntityRowListFooterProps,
  EntityRowListGroupProps,
  EntityRowListMenu,
  EntityRowListMenuItem,
  EntityRowListRootProps,
  EntityRowListRowCustomTrailingProps,
  EntityRowListRowMenuProps,
  EntityRowListRowProps,
  EntityRowListSupplementaryProps,
} from './lib/entity/row-list/entity-row-list'
export { DetailCollectionPanel } from './lib/detail/collection/panel/detail-collection-panel'
export type { DetailCollectionPanelProps } from './lib/detail/collection/panel/detail-collection-panel'
export { contentDetailHeroEyebrowClasses } from './lib/detail/page/content-detail-layout.variants'
export {
  ContentDetailSection,
  ContentDetailSectionItem,
} from './lib/detail/page/content-detail-section'
export type {
  ContentDetailSectionItemProps,
  ContentDetailSectionProps,
} from './lib/detail/page/content-detail-section'
export { contentDetailNavItemId } from './lib/detail/page/content-detail-nav-anchor-id'
export { detailCollectionRecordSeparatorVariants } from './lib/detail/collection/detail-collection-chrome.variants'
export type { DetailOverflowAction } from './lib/detail/detail-overflow-menu'
export { DetailEntityRowActions } from './lib/detail/row/entity/detail-entity-row-actions'
export { buildLocationConnectedPartyCharactersById } from './locations/lib/connected-parties/location-connected-party-character-options.lib'
export type { CharacterPickerOption } from './locations/lib/connected-parties/location-connected-party-character-options.lib'
export { CatalogEntityRow } from './lib/entity/surfaces/catalog/catalog-entity-row'
export type { CatalogEntityRowProps } from './lib/entity/surfaces/catalog/catalog-entity-row'
export { CatalogEntitySurfaceRow } from './lib/entity/surfaces/catalog/catalog-entity-surface-row'
export type { CatalogEntitySurfaceRowProps } from './lib/entity/surfaces/catalog/catalog-entity-surface-row'
export { CatalogEntityPickerSheet } from './lib/entity/surfaces/catalog/catalog-entity-picker-sheet'
export type { CatalogEntityPickerSheetProps } from './lib/entity/surfaces/catalog/catalog-entity-picker-sheet'
export { createCatalogEntityRowRenderer } from './lib/entity/surfaces/catalog/catalog-entity-row-renderer'
export { EntitySurfaceContentCard } from './lib/entity/surfaces/cards/content/entity-surface-content-card'
export type { EntitySurfaceContentCardProps } from './lib/entity/surfaces/cards/content/entity-surface-content-card'
export {
  buildCatalogToggleSelectInlineAction,
  buildEntitySurfaceLeadingMediaNode,
  projectEntitySurfaceConfig,
  projectEntitySurfaceIdentityToSummaryModel,
} from './lib/entity/surfaces/entity-surface-projection.lib'
export {
  projectSearchHitToInteractiveListPresentation,
  type SearchHitInteractiveListPresentation,
} from './lib/entity/surfaces/search-hit-interactive-list.lib'
export { DetailRowLeadingMedia } from './lib/detail/row/detail-row-leading-media'
export type { DetailRowLeadingMediaProps } from './lib/detail/row/detail-row-leading-media'
export { DetailRowLeadingAvatar } from './lib/detail/row/detail-row-leading-avatar'
export type { DetailRowLeadingAvatarProps } from './lib/detail/row/detail-row-leading-avatar'
export type { EntitySurfaceConfig } from './lib/entity/surfaces/entity-surface.types'
export type {
  EntitySurfaceIdentity,
  EntitySurfaceInlineAction,
} from './lib/entity/summary/entity-surface-identity.types'
export {
  CAMPAIGN_ACCESS_TABLE_FILTER_ALL,
  CAMPAIGN_ACCESS_TABLE_FILTER_AVAILABLE,
  CAMPAIGN_ACCESS_TABLE_FILTER_LABEL,
  CAMPAIGN_ACCESS_TABLE_FILTER_UNAVAILABLE,
  CAMPAIGN_ACCESS_TABLE_SHOW_UNAVAILABLE_LABEL,
  CAMPAIGN_ACCESS_TABLE_UNAVAILABLE_LABEL,
  formatHideUnavailableAriaLabel,
  formatHiddenUnavailableNotice,
  formatNoAvailableMatchesLabel,
  formatShowAllCampaignAvailabilityAriaLabel,
  formatShowUnavailableAriaLabel,
  formatUnavailableItemsShownNotice,
  formatUnavailableMatchesLine,
} from './lib/campaign-access/campaign-access-table-labels'
export { CITY_COUNCIL, SILVER_CIRCLE, ORGANIZATIONS_LIST } from './organizations/fixtures'
export { ClassesOverview, ClassDetail, useClasses, classesQueryKey } from './classes'
export { ClassCreate } from './classes/routes/class-create'
export { ClassEdit } from './classes/routes/class-edit'
export {
  EquipmentHub,
  EquipmentFamilyOverview,
  EquipmentFamilyCreate,
  EquipmentDetail,
  useEquipment,
  equipmentQueryKey,
  EQUIPMENT_FAMILY_PATHS,
  getEquipmentFamilyLabel,
  buildEquipmentDetailViewModel,
  buildEquipmentPickerRowViewModel,
  EQUIPMENT_DETAILS_SECTION_TITLES,
  EQUIPMENT_STAT_LABELS,
  type EquipmentDetailViewModel,
  type EquipmentPickerRowViewModel,
  EquipmentDetailMetadata,
} from './equipment'
export { EquipmentEdit } from './equipment/routes/equipment-edit'
export {
  SkillProficienciesOverview,
  SkillProficiencyDetail,
  useSkillProficiencies,
  skillProficienciesQueryKey,
} from './skill-proficiencies'
export {
  buildSkillProficiencyDetailViewModel,
  type SkillProficiencyDetailViewModel,
} from './skill-proficiencies/lib/skill-proficiency-display'
export { SkillProficiencyDetailMetadata } from './skill-proficiencies/components/skill-proficiency-detail-metadata'
export { SkillProficiencyCreate } from './skill-proficiencies/routes/skill-proficiency-create'
export { SkillProficiencyEdit } from './skill-proficiencies/routes/skill-proficiency-edit'
export { SpeciesOverview, SpeciesDetail, useSpecies, speciesQueryKey } from './species'
export {
  buildSpeciesCardViewModel,
  buildSpeciesDetailViewModel,
  SPECIES_STAT_LABELS,
  SPECIES_SECTION_LABELS,
  type SpeciesCardViewModel,
  type SpeciesDetailItem,
  type SpeciesDetailViewModel,
  type SpeciesDisplayVocabulary,
} from './species'
export {
  buildClassCardViewModel,
  buildClassDetailViewModel,
  CLASS_DISPLAY_NONE,
  CLASS_PROFICIENCY_GROUP_LABELS,
  CLASS_PROFICIENCY_ROW_LABELS,
  CLASS_SECTION_LABELS,
  CLASS_STAT_LABELS,
  type BuildClassDetailViewModelOptions,
  type ClassCardViewModel,
  type ClassDetailViewModel,
  type ClassDisplaySurface,
  type ClassDisplayVocabulary,
  type ClassFeatureDetailItem,
  type ClassProficienciesViewModel,
  type ClassProficiencyChoiceRow,
  type ClassProficiencyGrantRow,
} from './classes'
export { SpeciesCreate } from './species/routes/species-create'
export { SpeciesEdit } from './species/routes/species-edit'
export { FeatsOverview, FeatDetail, FeatCreate, FeatEdit, useFeats, featsQueryKey } from './feats'
export {
  useOrganizations,
  organizationsQueryKey,
  organizationMembersQueryKey,
  useOrganizationMembers,
} from './organizations'
export { listLocations, useLocations, locationsQueryKey } from './locations'
export {
  buildLocationEntityCardModel,
  buildLocationEntityCardModelFromClassification,
} from './locations/lib/location-display'
export {
  buildOrganizationEntityCardModel,
  buildOrganizationEntitySummaryVm,
} from './organizations/lib/organization-display'
export {
  ContentPreviewRailMedia,
  type ContentPreviewRailMediaProps,
} from './lib/forms/preview/content-preview-rail-media'
export { useCampaignAccessParticipantRoster } from './lib/campaign-access/use-campaign-access-participant-roster'
export { buildCampaignAccessVisibilityOptions } from './lib/campaign-access/campaign-access-options.lib'
export {
  CAMPAIGN_ACCESS_PARTICIPANTS_HINT,
  CAMPAIGN_ACCESS_PARTICIPANTS_LABEL,
  CAMPAIGN_ACCESS_PARTICIPANTS_TOOLTIP,
  CAMPAIGN_ACCESS_PLAYER_ACCESS_HINT,
  CAMPAIGN_ACCESS_PLAYER_ACCESS_LABEL,
  CAMPAIGN_ACCESS_PLAYER_ACCESS_TOOLTIP,
} from './lib/campaign-access/campaign-access-labels'
export { SpellsOverview, SpellDetail, useSpells, spellsQueryKey } from './spells'
export { SpellCreate } from './spells/routes/spell-create'
export { SpellEdit } from './spells/routes/spell-edit'
export {
  buildSpellDetailViewModel,
  SPELL_DETAIL_SECTION_LABELS,
  type SpellDetailViewModel,
  type SpellDisplayVocabulary,
} from './spells/lib/spell-display'
export { SpellDetailMetadata } from './spells/components/spell-detail-metadata'
export {
  ContentCreateShell,
  ContentFormShellResolver,
} from './lib/forms/shells/create/content-create-shell'
export { ContentFormDrawer } from './lib/forms/shells/host/content-form-drawer'
export type {
  ContentFormDrawerFormProps,
  ContentFormDrawerProps,
} from './lib/forms/shells/host/content-form-drawer'
export { ContentFormHost } from './lib/forms/shells/host/content-form-host'
export type {
  ContentFormHostChrome,
  ContentFormHostFormProps,
  ContentFormHostLeaveBridge,
  ContentFormHostProps,
} from './lib/forms/shells/host/content-form-host'
export { ContentEditShell } from './lib/forms/shells/edit/content-edit-shell'
export {
  buildGrantSummaryModel,
  buildSpellGrantVocabulary,
  formatGrantSummaryByLevel,
  formatGrantSummaryInline,
  type GrantDisplayVocabulary,
  type GrantSummaryFormatOptions,
  type GrantSummaryGroup,
  type GrantSummaryItem,
  type GrantSummaryKind,
  type GrantSummaryModel,
} from './lib/forms/grants/grant-display'
export {
  contentFormRegistry,
  type ContentFormDef,
  type ContentFormCtx,
} from './lib/forms/registry/content-form-registry'
export {
  buildContentFormOptionSets,
  referenceClassFieldOptions,
  referenceEquipmentFieldOptions,
  referenceSpellcastingClassFieldOptions,
  toContentFieldOption,
  toSortedContentFieldOptions,
  useContentFormOptions,
  type ContentFormOptionSets,
  type ContentPurposeSelectors,
} from './lib/form-options/content-form-options'
export {
  createContentMutationHooks,
  useContentWriteMutation,
} from './lib/list/use-content-mutations'
export { ContentDeletionBlockedDialog } from './lib/delete/content-deletion-blocked-dialog'
export { ContentCampaignAvailabilityAction } from './lib/campaign-access/overview/content-campaign-availability-action'
export {
  getContentDisplayImage,
  type DashboardContentDisplayResult,
} from './lib/detail/page/content-display-image'
export {
  buildClassContentDisplayImageInput,
  buildContentDisplayImageInput,
  buildLocationContentDisplayImageInput,
  buildSpeciesContentDisplayImageInput,
} from './lib/detail/page/content-display-image-input'
export { ContentMediaImage } from './lib/detail/page/content-media-image'
export type { ContentMediaImageFrame } from './lib/detail/page/content-media-image'
export {
  CONTENT_IMAGE_PRESENTATION_DEFAULTS,
  resolveContentImagePresentationDefault,
  type ContentImagePresentationSurface,
} from './lib/detail/page/content-image-presentation-defaults'
