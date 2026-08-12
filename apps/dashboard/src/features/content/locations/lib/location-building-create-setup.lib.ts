import {
  BUILDING_FACILITY_TYPE_ENTRIES,
  BUILDING_FACILITY_TYPE_IDS,
  BUILDING_FORM_ENTRIES,
  BUILDING_FORM_IDS,
  getBuildingFacilityTypeLabel,
  getBuildingFormLabel,
  type BuildingFacilityType,
  type BuildingForm,
} from '@rpg/contracts'
import type { RadioCardOption } from '@rpg/ui'

import type { LocationFormValues } from './location-form-fields'
import type { BuildingOperatorIntent } from './location-create-session'

export const BUILDING_CREATE_SETUP_HEADLINE = 'Create building' as const
export const BUILDING_CREATE_SETUP_FORM_FIELD_LABEL = 'Building form' as const
export const BUILDING_CREATE_SETUP_FORM_PROMPT =
  'What physical form does this building have?' as const
export const BUILDING_CREATE_SETUP_FACILITY_FIELD_LABEL = 'Facility type' as const
export const BUILDING_CREATE_SETUP_FACILITY_PROMPT =
  'What is this building configured to be?' as const
export const BUILDING_CREATE_SETUP_OPERATOR_FIELD_LABEL = 'Who operates here?' as const
export const BUILDING_CREATE_SETUP_OPERATOR_PROMPT = 'Who operates here?' as const

export type BuildingCreateSetupProjection = {
  form?: BuildingForm
  facilityType?: BuildingFacilityType
  operatorIntent: BuildingOperatorIntent
}

export type BuildingCreateSetupSelection = {
  form: BuildingForm | ''
  facilityType: BuildingFacilityType | ''
  operatorIntent: BuildingOperatorIntent | ''
}

export function buildBuildingFormRadioOptions(): RadioCardOption[] {
  return BUILDING_FORM_IDS.map((value) => ({
    value,
    label: BUILDING_FORM_ENTRIES[value].label,
    description: BUILDING_FORM_ENTRIES[value].description,
  }))
}

export function buildBuildingFacilityTypeRadioOptions(): RadioCardOption[] {
  return BUILDING_FACILITY_TYPE_IDS.map((value) => ({
    value,
    label: BUILDING_FACILITY_TYPE_ENTRIES[value].label,
    description: BUILDING_FACILITY_TYPE_ENTRIES[value].description,
  }))
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

export function isBuildingFacilityType(value: string): value is BuildingFacilityType {
  return (BUILDING_FACILITY_TYPE_IDS as readonly string[]).includes(value)
}

export function isBuildingOperatorIntent(value: string): value is BuildingOperatorIntent {
  return value === 'none' || value === 'create'
}

export function resolveBuildingCreateSetupProjection(
  selection: BuildingCreateSetupSelection,
): BuildingCreateSetupProjection | null {
  if (!isBuildingOperatorIntent(selection.operatorIntent)) return null
  return {
    ...(selection.form ? { form: selection.form } : {}),
    ...(selection.facilityType ? { facilityType: selection.facilityType } : {}),
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
  if (choiceSetId === 'buildingFacilityType') {
    return {
      ...selection,
      facilityType: isBuildingFacilityType(nextValue) ? nextValue : '',
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
  const classification =
    projection.form || projection.facilityType
      ? {
          ...(projection.form ? { form: projection.form } : {}),
          ...(projection.facilityType ? { facilityType: projection.facilityType } : {}),
        }
      : undefined

  return { ...values, classification }
}

export function buildBuildingCreateSetupSummaryEntries(
  projection: BuildingCreateSetupProjection,
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
    ...(projection.facilityType
      ? [
          {
            fieldLabel: BUILDING_CREATE_SETUP_FACILITY_FIELD_LABEL,
            valueLabel: getBuildingFacilityTypeLabel(projection.facilityType),
          },
        ]
      : []),
    {
      fieldLabel: BUILDING_CREATE_SETUP_OPERATOR_FIELD_LABEL,
      valueLabel:
        projection.operatorIntent === 'create' ? 'Create organization' : 'No organization',
    },
  ]
}
