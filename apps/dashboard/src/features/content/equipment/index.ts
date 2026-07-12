export { EquipmentHub, EquipmentHubContent } from './routes/equipment-hub'
export {
  EquipmentFamilyOverview,
  EquipmentFamilyOverviewContent,
} from './routes/equipment-family-overview'
export { EquipmentFamilyCreate } from './routes/equipment-family-create'
export { EquipmentDetail, EquipmentDetailContent } from './routes/equipment-detail'
export { EquipmentDetailMetadata } from './components/equipment-detail-metadata.client'
export {
  buildEquipmentDetailViewModel,
  buildEquipmentPickerHeaderViewModel,
  buildEquipmentPickerRowViewModel,
  EQUIPMENT_DETAILS_SECTION_TITLES,
  EQUIPMENT_STAT_LABELS,
  type EquipmentCardViewModel,
  type EquipmentDetailViewModel,
  type EquipmentPickerRowViewModel,
} from './lib/equipment-display'
export { useEquipment, equipmentQueryKey } from './hooks/use-equipment'
export {
  EQUIPMENT_FAMILY_PATHS,
  equipmentKindToFamilyPath,
  familyPathToEquipmentKind,
  getEquipmentFamilyLabel,
  isEquipmentFamilyPath,
  type EquipmentFamilyPath,
} from './lib/shared/equipment-family-paths'
