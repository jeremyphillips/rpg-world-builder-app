export { EquipmentHub, EquipmentHubContent } from './routes/equipment-hub'
export {
  EquipmentFamilyOverview,
  EquipmentFamilyOverviewContent,
} from './routes/equipment-family-overview'
export { EquipmentFamilyCreate } from './routes/equipment-family-create'
export { EquipmentDetail, EquipmentDetailContent } from './routes/equipment-detail'
export { EquipmentDetailMetadata } from './components/equipment-detail-metadata'
export {
  buildEquipmentDetailViewModel,
  buildEquipmentPickerRowViewModel,
  EQUIPMENT_DETAILS_SECTION_TITLES,
  EQUIPMENT_STAT_LABELS,
  type EquipmentDetailViewModel,
  type EquipmentPickerRowViewModel,
} from './lib/equipment-display'
export { useEquipment, equipmentQueryKey } from './hooks/use-equipment'
export {
  EquipmentCategoryGroupedList,
  type EquipmentCategoryGroup,
} from './components/inventory-list/equipment-category-grouped-list'
export { EquipmentInventorySectionHeader } from './components/inventory-list/equipment-inventory-section-header'
export { buildLoadoutEquipmentPickerItems } from './lib/loadout/equipment-loadout-picker.lib'
export { commitEquipmentEditorSession } from './lib/instance-editor/commit-equipment-editor-session'
export {
  createEquipmentEditorState,
  equipmentEditorReducer,
  isEquipmentEditorSessionDirty,
  type EquipmentEditorState,
} from './lib/instance-editor/equipment-editor-reducer'
export { EquipmentInstanceEditorDrawer } from './components/instance-editor/equipment-instance-editor-drawer'
export { mapEquipmentInstanceInventoryStatus } from './lib/instance-summary/map-equipment-instance-inventory-status'
export {
  EQUIPMENT_INSTANCE_EQUIPPED_STATUS_LABEL,
  EQUIPMENT_INSTANCE_MAGICAL_STATUS_LABEL,
} from './lib/instance-summary/equipment-instance-status-labels.lib'
export { resolveEquipmentNotProficientCompatibilityStatus } from './lib/instance-summary/resolve-equipment-not-proficient-compatibility-status.lib'
export { EQUIPMENT_INVENTORY_GROUP_LABELS } from './lib/inventory/equipment-inventory-group-labels.lib'
export {
  EQUIPMENT_CATALOG_REFERENCE_UNAVAILABLE_MESSAGE,
  equipmentCatalogReferenceUnavailableStatusItem,
  mergeEquipmentInventoryCatalogReferenceStatus,
} from './lib/inventory/equipment-catalog-reference-status.lib'
export {
  EQUIPMENT_FAMILY_PATHS,
  equipmentKindToFamilyPath,
  familyPathToEquipmentKind,
  getEquipmentFamilyLabel,
  isEquipmentFamilyPath,
  type EquipmentFamilyPath,
} from './lib/shared/equipment-family-paths'
