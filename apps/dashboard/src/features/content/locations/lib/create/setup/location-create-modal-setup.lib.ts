import type {
  BuildingFacilityAuthoringGroup,
  BuildingForm,
  RegionClassificationKind,
  SettlementType,
  SiteType,
} from '@rpg/contracts'
import type { RadioCardOption } from '@rpg/ui'

import {
  CREATE_SETUP_DEFAULT_SKIPPED_VALUE_LABEL,
  type CreateSetupValueChangeEvent,
} from '@/lib/create-setup'

import {
  buildLocationAuthoringTypeOption,
  isDeferredLocationAuthoringType,
  LOCATION_AUTHORING_TYPE_IDS,
  type LocationAuthoringType,
} from '../../location-authoring-type'
import type {
  LocationCreateIntent,
  LocationCreateSetupResult,
} from '../session/location-create-session'
import {
  BUILDING_CREATE_SETUP_FACILITY_FIELD_LABEL,
  BUILDING_CREATE_SETUP_FACILITY_PROMPT,
  BUILDING_CREATE_SETUP_FORM_FIELD_LABEL,
  BUILDING_CREATE_SETUP_FORM_PROMPT,
  BUILDING_CREATE_SETUP_FORM_SKIP_LABEL,
  BUILDING_CREATE_SETUP_HEADLINE,
  BUILDING_CREATE_SETUP_IDENTITY_SUMMARY_EYEBROW,
  BUILDING_CREATE_SETUP_IDENTITY_SUMMARY_GROUP,
  buildBuildingFacilityAuthoringGroupRadioOptions,
  buildBuildingFormRadioOptions,
  applyBuildingCreateSetupSelectionChange,
  resolveBuildingCreateSetupProjection,
} from './location-building-create-setup.lib'
import {
  buildRegionClassificationKindRadioOptions,
  buildRegionTypeRadioOptions,
  parseRegionClassification,
  REGION_CREATE_SETUP_CLASSIFICATION_FIELD_LABEL,
  REGION_CREATE_SETUP_CLASSIFICATION_KIND_SET_ID,
  REGION_CREATE_SETUP_CLASSIFICATION_TYPE_SET_ID,
  REGION_CREATE_SETUP_SELECTIONS_EYEBROW,
  REGION_CREATE_SETUP_SELECTIONS_SUMMARY_GROUP,
  resolveRegionClassificationTypeFieldLabel,
  resolveRegionClassificationTypeFieldPrompt,
  resolveRegionCreateSetupHeadline,
  resolveRegionCreateSetupPrompt,
} from './location-region-create-setup.lib'
import {
  buildSettlementTypeRadioOptions,
  isSettlementType,
  SETTLEMENT_CREATE_SETUP_FIELD_LABEL,
  SETTLEMENT_CREATE_SETUP_HEADLINE,
  SETTLEMENT_CREATE_SETUP_PROMPT,
} from './location-settlement-create-setup.lib'
import {
  buildSiteTypeRadioOptions,
  isSiteType,
  SITE_CREATE_SETUP_FIELD_LABEL,
  SITE_CREATE_SETUP_HEADLINE,
  SITE_CREATE_SETUP_PROMPT,
} from './location-site-create-setup.lib'

export const LOCATION_CREATE_MODAL_AUTHORING_TYPE_SET_ID = 'authoringType' as const
export const LOCATION_CREATE_MODAL_HEADLINE = 'Create location' as const
const LOCATION_CREATE_MODAL_TYPE_FIELD_LABEL = 'Location type' as const
const LOCATION_CREATE_MODAL_TYPE_PROMPT = 'What kind of location are you creating?' as const

export type LocationCreateModalSetupValues = {
  authoringType: LocationAuthoringType | ''
  buildingForm: BuildingForm | ''
  buildingFormSkipped: boolean
  buildingFacilityAuthoringGroup: BuildingFacilityAuthoringGroup | 'browse_all' | ''
  siteType: SiteType | ''
  settlementType: SettlementType | ''
  classification: {
    kind: RegionClassificationKind | ''
    type: string
  }
}

export const EMPTY_LOCATION_CREATE_MODAL_SETUP_VALUES = {
  authoringType: '',
  buildingForm: '',
  buildingFormSkipped: false,
  buildingFacilityAuthoringGroup: '',
  siteType: '',
  settlementType: '',
  classification: { kind: '', type: '' },
} as const satisfies LocationCreateModalSetupValues

export type LocationCreateModalSetupChoiceSetConfig = {
  id: string
  fieldLabel: string
  prompt: string
  options: RadioCardOption[]
  value: string
  required?: boolean
  dependsOn?: readonly string[]
  visibleWhenComplete?: readonly string[]
  summaryGroup?: string
  summaryGroupEyebrow?: string
  skipLabel?: string
  skipped?: boolean
  skippedValueLabel?: string
  isComplete: boolean
}

export type LocationCreateModalSetupModel = {
  headline: string
  /** Opt-in header subhead; omitted/false means no Modal description. */
  subhead?: string | false
  choiceSets: LocationCreateModalSetupChoiceSetConfig[]
  complete: () => LocationCreateSetupResult | null
}

/** True when every choice set is complete (including projection-safe facility readiness). */
export function isLocationCreateModalSetupComplete(model: LocationCreateModalSetupModel): boolean {
  return model.choiceSets.every((set) => set.isComplete)
}

function isBuildingFormSetupComplete(values: LocationCreateModalSetupValues): boolean {
  return Boolean(values.buildingForm) || values.buildingFormSkipped
}

function resolveBuildingSetupModel(
  values: LocationCreateModalSetupValues,
): LocationCreateModalSetupModel {
  const formOptions = buildBuildingFormRadioOptions()
  const facilityOptions = buildBuildingFacilityAuthoringGroupRadioOptions()
  const projection = resolveBuildingCreateSetupProjection({
    form: values.buildingForm,
    facilityAuthoringGroup: values.buildingFacilityAuthoringGroup,
  })
  const formComplete = isBuildingFormSetupComplete(values)

  return {
    headline: BUILDING_CREATE_SETUP_HEADLINE,
    choiceSets: [
      {
        id: 'buildingForm',
        fieldLabel: BUILDING_CREATE_SETUP_FORM_FIELD_LABEL,
        prompt: BUILDING_CREATE_SETUP_FORM_PROMPT,
        options: formOptions,
        value: values.buildingForm,
        required: false,
        skipLabel: BUILDING_CREATE_SETUP_FORM_SKIP_LABEL,
        skippedValueLabel: CREATE_SETUP_DEFAULT_SKIPPED_VALUE_LABEL,
        skipped: values.buildingFormSkipped && !values.buildingForm,
        summaryGroup: BUILDING_CREATE_SETUP_IDENTITY_SUMMARY_GROUP,
        summaryGroupEyebrow: BUILDING_CREATE_SETUP_IDENTITY_SUMMARY_EYEBROW,
        isComplete: formComplete,
      },
      {
        id: 'buildingFacilityAuthoringGroup',
        fieldLabel: BUILDING_CREATE_SETUP_FACILITY_FIELD_LABEL,
        prompt: BUILDING_CREATE_SETUP_FACILITY_PROMPT,
        options: facilityOptions,
        value: values.buildingFacilityAuthoringGroup,
        visibleWhenComplete: ['buildingForm'],
        summaryGroup: BUILDING_CREATE_SETUP_IDENTITY_SUMMARY_GROUP,
        summaryGroupEyebrow: BUILDING_CREATE_SETUP_IDENTITY_SUMMARY_EYEBROW,
        isComplete: Boolean(values.buildingFacilityAuthoringGroup) && projection != null,
      },
    ],
    complete: () => (projection ? { kind: 'building', ...projection } : null),
  }
}

function isLocationAuthoringType(value: string): value is LocationAuthoringType {
  return (
    value !== '' &&
    (LOCATION_AUTHORING_TYPE_IDS as readonly string[]).includes(value) &&
    !isDeferredLocationAuthoringType(value as LocationAuthoringType)
  )
}

/** Authoring types whose setup model exposes at least one choice set (empty values). */
export function resolveLocationCreateSetupAuthoringTypes(): LocationAuthoringType[] {
  return LOCATION_AUTHORING_TYPE_IDS.filter((authoringType) => {
    if (isDeferredLocationAuthoringType(authoringType)) return false
    const model = resolveLocationCreateModalSetupModelForAuthoringType(
      authoringType,
      EMPTY_LOCATION_CREATE_MODAL_SETUP_VALUES,
    )
    return model != null && model.choiceSets.length > 0
  })
}

export function requiresLocationCreateSetup(type: LocationAuthoringType): boolean {
  return (resolveLocationCreateSetupAuthoringTypes() as readonly string[]).includes(type)
}

function resolveEffectiveSetupAuthoringType(
  intent: LocationCreateIntent,
  values: LocationCreateModalSetupValues,
): LocationAuthoringType | undefined {
  if (intent.authoringType) return intent.authoringType
  if (values.authoringType && isLocationAuthoringType(values.authoringType)) {
    return values.authoringType
  }
  return undefined
}

export function resolveLocationCreateModalSetupModelForAuthoringType(
  authoringType: LocationAuthoringType,
  values: LocationCreateModalSetupValues,
  intent?: LocationCreateIntent,
): LocationCreateModalSetupModel | null {
  if (authoringType === 'building') {
    return resolveBuildingSetupModel(values)
  }

  if (authoringType === 'site') {
    const options = buildSiteTypeRadioOptions()
    return {
      headline: SITE_CREATE_SETUP_HEADLINE,
      choiceSets: [
        {
          id: 'siteType',
          fieldLabel: SITE_CREATE_SETUP_FIELD_LABEL,
          prompt: SITE_CREATE_SETUP_PROMPT,
          options,
          value: values.siteType,
          isComplete: Boolean(values.siteType),
        },
      ],
      complete: () =>
        values.siteType && isSiteType(values.siteType)
          ? { kind: 'site', siteType: values.siteType }
          : null,
    }
  }

  if (authoringType === 'settlement') {
    const options = buildSettlementTypeRadioOptions()
    return {
      headline: SETTLEMENT_CREATE_SETUP_HEADLINE,
      choiceSets: [
        {
          id: 'settlementType',
          fieldLabel: SETTLEMENT_CREATE_SETUP_FIELD_LABEL,
          prompt: SETTLEMENT_CREATE_SETUP_PROMPT,
          options,
          value: values.settlementType,
          isComplete: Boolean(values.settlementType),
        },
      ],
      complete: () =>
        values.settlementType && isSettlementType(values.settlementType)
          ? { kind: 'settlement', settlementType: values.settlementType }
          : null,
    }
  }

  if (authoringType === 'region') {
    const regionIntent = intent ?? { authoringType }
    const kindOptions = buildRegionClassificationKindRadioOptions()
    const typeOptions = values.classification.kind
      ? buildRegionTypeRadioOptions(values.classification.kind)
      : []
    const typeFieldLabel = resolveRegionClassificationTypeFieldLabel(values.classification.kind)
    const typeFieldPrompt = resolveRegionClassificationTypeFieldPrompt(values.classification.kind)
    const classification = parseRegionClassification(
      values.classification.kind,
      values.classification.type,
    )
    return {
      headline: resolveRegionCreateSetupHeadline(regionIntent),
      choiceSets: [
        {
          id: REGION_CREATE_SETUP_CLASSIFICATION_KIND_SET_ID,
          fieldLabel: REGION_CREATE_SETUP_CLASSIFICATION_FIELD_LABEL,
          prompt: resolveRegionCreateSetupPrompt(regionIntent),
          options: kindOptions,
          value: values.classification.kind,
          summaryGroup: REGION_CREATE_SETUP_SELECTIONS_SUMMARY_GROUP,
          summaryGroupEyebrow: REGION_CREATE_SETUP_SELECTIONS_EYEBROW,
          isComplete: Boolean(values.classification.kind),
        },
        {
          id: REGION_CREATE_SETUP_CLASSIFICATION_TYPE_SET_ID,
          fieldLabel: typeFieldLabel,
          prompt: typeFieldPrompt,
          options: typeOptions,
          value: values.classification.type,
          dependsOn: [REGION_CREATE_SETUP_CLASSIFICATION_KIND_SET_ID],
          summaryGroup: REGION_CREATE_SETUP_SELECTIONS_SUMMARY_GROUP,
          summaryGroupEyebrow: REGION_CREATE_SETUP_SELECTIONS_EYEBROW,
          isComplete: Boolean(values.classification.type),
        },
      ],
      complete: () => (classification ? { kind: 'region', classification } : null),
    }
  }

  return null
}

function buildAuthoringTypeSetupChoiceSet(
  values: LocationCreateModalSetupValues,
): LocationCreateModalSetupChoiceSetConfig {
  const options = resolveLocationCreateSetupAuthoringTypes().map((type) =>
    buildLocationAuthoringTypeOption(type),
  )

  return {
    id: LOCATION_CREATE_MODAL_AUTHORING_TYPE_SET_ID,
    fieldLabel: LOCATION_CREATE_MODAL_TYPE_FIELD_LABEL,
    prompt: LOCATION_CREATE_MODAL_TYPE_PROMPT,
    options,
    value: values.authoringType,
    isComplete: Boolean(values.authoringType),
  }
}

export function resolveLocationCreateModalSetupModel({
  intent,
  values,
}: {
  intent: LocationCreateIntent
  values: LocationCreateModalSetupValues
}): LocationCreateModalSetupModel | null {
  const effectiveType = resolveEffectiveSetupAuthoringType(intent, values)

  if (intent.authoringType) {
    return resolveLocationCreateModalSetupModelForAuthoringType(
      intent.authoringType,
      values,
      intent,
    )
  }

  const typeChoiceSet = buildAuthoringTypeSetupChoiceSet(values)
  if (!effectiveType) {
    return {
      headline: LOCATION_CREATE_MODAL_HEADLINE,
      choiceSets: [typeChoiceSet],
      complete: () => null,
    }
  }

  const typeModel = resolveLocationCreateModalSetupModelForAuthoringType(
    effectiveType,
    values,
    intent,
  )
  if (!typeModel) {
    return {
      headline: LOCATION_CREATE_MODAL_HEADLINE,
      choiceSets: [typeChoiceSet],
      complete: () => null,
    }
  }

  const dependentSets = typeModel.choiceSets.map((set) => ({
    ...set,
    dependsOn: [
      ...(set.dependsOn ?? []),
      LOCATION_CREATE_MODAL_AUTHORING_TYPE_SET_ID,
    ] as readonly string[],
  }))

  return {
    headline: typeModel.headline,
    subhead: typeModel.subhead,
    choiceSets: [typeChoiceSet, ...dependentSets],
    complete: () => typeModel.complete(),
  }
}

function clearTypeSpecificSetupValues(
  values: LocationCreateModalSetupValues,
): LocationCreateModalSetupValues {
  return {
    ...values,
    buildingForm: '',
    buildingFormSkipped: false,
    buildingFacilityAuthoringGroup: '',
    siteType: '',
    settlementType: '',
    classification: { kind: '', type: '' },
  }
}

function clearInvalidatedLocationSetupValues(
  values: LocationCreateModalSetupValues,
  invalidatedSetIds: readonly string[],
): LocationCreateModalSetupValues {
  let next = values

  for (const setId of invalidatedSetIds) {
    if (setId === REGION_CREATE_SETUP_CLASSIFICATION_TYPE_SET_ID) {
      next = {
        ...next,
        classification: { ...next.classification, type: '' },
      }
    }
    if (setId === 'buildingFacilityAuthoringGroup') {
      next = { ...next, buildingFacilityAuthoringGroup: '' }
    }
  }

  return next
}

function applyBuildingLocationSetupValueChange(
  nextValues: LocationCreateModalSetupValues,
  event: CreateSetupValueChangeEvent,
): LocationCreateModalSetupValues | null {
  const buildingSelection = applyBuildingCreateSetupSelectionChange({
    selection: {
      form: nextValues.buildingForm,
      facilityAuthoringGroup: nextValues.buildingFacilityAuthoringGroup,
    },
    choiceSetId: event.setId,
    nextValue: String(event.nextValue),
  })
  if (!buildingSelection) return null

  if (event.setId === 'buildingForm' && event.skipped) {
    return {
      ...nextValues,
      buildingForm: '',
      buildingFormSkipped: true,
      buildingFacilityAuthoringGroup: buildingSelection.facilityAuthoringGroup,
    }
  }

  return {
    ...nextValues,
    buildingForm: buildingSelection.form,
    buildingFormSkipped: event.setId === 'buildingForm' ? false : nextValues.buildingFormSkipped,
    buildingFacilityAuthoringGroup: buildingSelection.facilityAuthoringGroup,
  }
}

function applyTypedLocationSetupValueChange(
  nextValues: LocationCreateModalSetupValues,
  event: CreateSetupValueChangeEvent,
): LocationCreateModalSetupValues | null {
  if (event.setId === 'siteType') {
    return {
      ...nextValues,
      siteType: isSiteType(String(event.nextValue)) ? (event.nextValue as SiteType) : '',
    }
  }
  if (event.setId === 'settlementType') {
    return {
      ...nextValues,
      settlementType: isSettlementType(String(event.nextValue))
        ? (event.nextValue as SettlementType)
        : '',
    }
  }
  if (event.setId === REGION_CREATE_SETUP_CLASSIFICATION_KIND_SET_ID) {
    return {
      ...nextValues,
      classification: {
        kind: event.nextValue as RegionClassificationKind | '',
        type: '',
      },
    }
  }
  if (event.setId === REGION_CREATE_SETUP_CLASSIFICATION_TYPE_SET_ID) {
    return {
      ...nextValues,
      classification: {
        ...nextValues.classification,
        type: String(event.nextValue),
      },
    }
  }
  if (event.setId === LOCATION_CREATE_MODAL_AUTHORING_TYPE_SET_ID) {
    const nextType = isLocationAuthoringType(String(event.nextValue))
      ? (event.nextValue as LocationAuthoringType)
      : ''
    if (nextType === nextValues.authoringType) {
      return nextValues
    }
    return clearTypeSpecificSetupValues({
      ...nextValues,
      authoringType: nextType,
    })
  }
  return null
}

export function applyLocationCreateModalSetupValueChange({
  values,
  event,
}: {
  values: LocationCreateModalSetupValues
  event: CreateSetupValueChangeEvent
}): LocationCreateModalSetupValues {
  const nextValues = clearInvalidatedLocationSetupValues(values, event.invalidatedSetIds)

  return (
    applyBuildingLocationSetupValueChange(nextValues, event) ??
    applyTypedLocationSetupValueChange(nextValues, event) ??
    nextValues
  )
}
