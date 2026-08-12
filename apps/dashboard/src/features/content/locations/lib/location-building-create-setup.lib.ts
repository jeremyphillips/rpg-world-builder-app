import {
  BUILDING_FACILITY_AUTHORING_GROUP_ENTRIES,
  BUILDING_FACILITY_AUTHORING_GROUP_IDS,
  BUILDING_FORM_ENTRIES,
  BUILDING_FORM_IDS,
  getBuildingFacilityTypesForAuthoringGroup,
  getBuildingFormLabel,
  isBuildingFacilityInAuthoringGroup,
  type BuildingFacilityAuthoringGroup,
  type BuildingForm,
} from '@rpg/contracts'
import type { RadioCardOption } from '@rpg/ui'

import type { LocationFormValues } from './location-form-fields'
import type { BuildingOperatorIntent } from './location-create-session'

export const BUILDING_CREATE_SETUP_HEADLINE = 'Create building' as const
export const BUILDING_CREATE_SETUP_FORM_FIELD_LABEL = 'Building form' as const
export const BUILDING_CREATE_SETUP_FORM_PROMPT =
  'What physical form does this building have?' as const
export const BUILDING_CREATE_SETUP_FACILITY_FIELD_LABEL = 'Facility' as const
export const BUILDING_CREATE_SETUP_FACILITY_PROMPT =
  'What kind of facility are you creating?' as const
export const BUILDING_CREATE_SETUP_OPERATOR_FIELD_LABEL = 'Who operates here?' as const
export const BUILDING_CREATE_SETUP_OPERATOR_PROMPT = 'Who operates here?' as const

export const BUILDING_FACILITY_BROWSE_ALL_SETUP_VALUE = 'browse_all' as const

export type BuildingCreateSetupProjection = {
  form?: BuildingForm
  facilityAuthoringGroup?: BuildingFacilityAuthoringGroup
  operatorIntent: BuildingOperatorIntent
}

export type BuildingCreateSetupSelection = {
  form: BuildingForm | ''
  facilityAuthoringGroup:
    | BuildingFacilityAuthoringGroup
    | typeof BUILDING_FACILITY_BROWSE_ALL_SETUP_VALUE
    | ''
  operatorIntent: BuildingOperatorIntent | ''
}

export function buildBuildingFormRadioOptions(): RadioCardOption[] {
  return BUILDING_FORM_IDS.map((value) => ({
    value,
    label: BUILDING_FORM_ENTRIES[value].label,
    description: BUILDING_FORM_ENTRIES[value].description,
  }))
}

export function buildBuildingFacilityAuthoringGroupRadioOptions(): RadioCardOption[] {
  const populatedGroups = BUILDING_FACILITY_AUTHORING_GROUP_IDS.filter(
    (group) => getBuildingFacilityTypesForAuthoringGroup(group).length > 0,
  )
  return [
    ...populatedGroups.map((value) => ({
      value,
      label: BUILDING_FACILITY_AUTHORING_GROUP_ENTRIES[value].label,
      description: BUILDING_FACILITY_AUTHORING_GROUP_ENTRIES[value].description,
    })),
    {
      value: BUILDING_FACILITY_BROWSE_ALL_SETUP_VALUE,
      label: 'Browse all',
      description: 'Start with the complete enabled Facility vocabulary.',
    },
  ]
}

export function buildBuildingOperatorIntentRadioOptions(): RadioCardOption[] {
  return [
    { value: 'none', label: 'No organization' },
    { value: 'create', label: 'Create an organization' },
  ]
}

export function isBuildingForm(value: string): value is BuildingForm {
  return (BUILDING_FORM_IDS as readonly string[]).includes(value)
}

export function isBuildingFacilityAuthoringGroup(
  value: string,
): value is BuildingFacilityAuthoringGroup {
  return (BUILDING_FACILITY_AUTHORING_GROUP_IDS as readonly string[]).includes(value)
}

export function isBuildingOperatorIntent(value: string): value is BuildingOperatorIntent {
  return value === 'none' || value === 'create'
}

export function resolveBuildingCreateSetupProjection(
  selection: BuildingCreateSetupSelection,
): BuildingCreateSetupProjection | null {
  if (!isBuildingOperatorIntent(selection.operatorIntent)) return null
  const hasFacilityScope =
    isBuildingFacilityAuthoringGroup(selection.facilityAuthoringGroup) ||
    selection.facilityAuthoringGroup === BUILDING_FACILITY_BROWSE_ALL_SETUP_VALUE
  if (!hasFacilityScope) return null
  return {
    ...(selection.form ? { form: selection.form } : {}),
    ...(isBuildingFacilityAuthoringGroup(selection.facilityAuthoringGroup)
      ? { facilityAuthoringGroup: selection.facilityAuthoringGroup }
      : {}),
    operatorIntent: selection.operatorIntent,
  }
}

export function applyBuildingCreateSetupSelectionChange({
  selection,
  choiceSetId,
  nextValue,
}: {
  selection: BuildingCreateSetupSelection
  choiceSetId: string
  nextValue: string
}): BuildingCreateSetupSelection | null {
  if (choiceSetId === 'buildingForm') {
    return { ...selection, form: isBuildingForm(nextValue) ? nextValue : '' }
  }
  if (choiceSetId === 'buildingFacilityAuthoringGroup') {
    return {
      ...selection,
      facilityAuthoringGroup:
        isBuildingFacilityAuthoringGroup(nextValue) ||
        nextValue === BUILDING_FACILITY_BROWSE_ALL_SETUP_VALUE
          ? nextValue
          : '',
    }
  }
  if (choiceSetId === 'buildingOperatorIntent') {
    return {
      ...selection,
      operatorIntent: isBuildingOperatorIntent(nextValue) ? nextValue : '',
    }
  }
  return null
}

/** Setup is an authoring projection; the returned form values remain the classification SSOT. */
export function applyBuildingCreateSetupProjection(
  values: LocationFormValues,
  projection: BuildingCreateSetupProjection,
): LocationFormValues {
  const classification = buildBuildingClassificationFromCreateSetup(
    projection,
    values.classification,
  )

  return { ...values, classification }
}

export function buildBuildingClassificationFromCreateSetup(
  projection: BuildingCreateSetupProjection,
  currentClassification?: LocationFormValues['classification'],
): LocationFormValues['classification'] {
  const currentFacilityType = currentClassification?.facilityType
  const facilityType =
    currentFacilityType &&
    (!projection.facilityAuthoringGroup ||
      isBuildingFacilityInAuthoringGroup(currentFacilityType, projection.facilityAuthoringGroup))
      ? currentFacilityType
      : undefined

  return projection.form || facilityType
    ? {
        ...(projection.form ? { form: projection.form } : {}),
        ...(facilityType ? { facilityType } : {}),
      }
    : undefined
}

export function buildBuildingCreateSetupSummaryEntries(
  projection: BuildingCreateSetupProjection,
  facilityScopeValue: BuildingCreateSetupSelection['facilityAuthoringGroup'],
): { fieldLabel: string; valueLabel: string }[] {
  return [
    ...(projection.form
      ? [
          {
            fieldLabel: BUILDING_CREATE_SETUP_FORM_FIELD_LABEL,
            valueLabel: getBuildingFormLabel(projection.form),
          },
        ]
      : []),
    {
      fieldLabel: BUILDING_CREATE_SETUP_FACILITY_FIELD_LABEL,
      valueLabel: projection.facilityAuthoringGroup
        ? BUILDING_FACILITY_AUTHORING_GROUP_ENTRIES[projection.facilityAuthoringGroup].label
        : facilityScopeValue === BUILDING_FACILITY_BROWSE_ALL_SETUP_VALUE
          ? 'Browse all'
          : '',
    },
    {
      fieldLabel: BUILDING_CREATE_SETUP_OPERATOR_FIELD_LABEL,
      valueLabel:
        projection.operatorIntent === 'create' ? 'Create organization' : 'No organization',
    },
  ]
}
