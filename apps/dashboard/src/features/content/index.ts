// Lightweight cross-feature surface — keep before route/form exports to avoid barrel init cycles.
export {
  formatAddContentTypeLabel,
  formatContentCollectionAvailabilityCaption,
  formatContentCreateHeading,
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
  type CatalogCollapsibleListProps,
  type CatalogMetadataLine,
} from './components/catalog'
export {
  ContentEntityCard,
  DisclosureEntityCard,
  EntityItem,
  EntitySummary,
  CatalogEntityRow,
  CatalogEntityPickerSheet,
  createCatalogEntityRowRenderer,
  type ContentEntityCardProps,
  type DisclosureEntityCardProps,
  type CatalogEntityRowProps,
  type CatalogEntityPickerSheetProps,
  type EntityItemTrailing,
  type EntityItemTrailingSecondary,
  type EntitySummaryModel,
  type EntitySummaryStatusItem,
} from './lib/content-entity-card.client'
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
export { SkillProficiencyDetailMetadata } from './skill-proficiencies/components/skill-proficiency-detail-metadata.client'
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
export { useLocations, locationsQueryKey } from './locations'
export { SpellsOverview, SpellDetail, useSpells, spellsQueryKey } from './spells'
export { SpellCreate } from './spells/routes/spell-create'
export { SpellEdit } from './spells/routes/spell-edit'
export {
  buildSpellDetailViewModel,
  SPELL_DETAIL_SECTION_LABELS,
  type SpellDetailViewModel,
  type SpellDisplayVocabulary,
} from './spells/lib/spell-display'
export { SpellDetailMetadata } from './spells/components/spell-detail-metadata.client'
export {
  ContentCreateShell,
  ContentFormShellResolver,
} from './lib/forms/shells/content-create-shell'
export { ContentFormDrawer } from './lib/forms/shells/content-form-drawer.client'
export type {
  ContentFormDrawerFormProps,
  ContentFormDrawerProps,
} from './lib/forms/shells/content-form-drawer.client'
export { ContentFormHost } from './lib/forms/shells/content-form-host.client'
export type {
  ContentFormHostChrome,
  ContentFormHostFormProps,
  ContentFormHostLeaveBridge,
  ContentFormHostProps,
} from './lib/forms/shells/content-form-host.client'
export { ContentEditShell } from './lib/forms/shells/content-edit-shell'
export {
  buildGrantSummaryModel,
  buildSpellGrantVocabulary,
  formatGrantSummaryByLevel,
  formatGrantSummaryInline,
  GRANT_SUMMARY_JOIN,
  type GrantDisplayVocabulary,
  type GrantSummaryFormatOptions,
  type GrantSummaryGroup,
  type GrantSummaryItem,
  type GrantSummaryKind,
  type GrantSummaryModel,
} from './lib/grant-display'
export {
  contentFormRegistry,
  type ContentFormDef,
  type ContentFormCtx,
} from './lib/forms/content-form-registry'
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
export { ContentDeletionBlockedDialog } from './lib/delete/content-deletion-blocked-dialog.client'
export { ContentCampaignAvailabilityAction } from './lib/overview/content-campaign-availability-action.client'
