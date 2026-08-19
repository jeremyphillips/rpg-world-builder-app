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

import type { LocationCreateIntent, LocationCreateSetupResult } from './location-create-session'
import type { LocationSetupSummaryEntry } from './location-setup-summary-rows.lib'
import {
  BUILDING_CREATE_SETUP_FACILITY_FIELD_LABEL,
  BUILDING_CREATE_SETUP_FACILITY_PROMPT,
  BUILDING_CREATE_SETUP_FORM_FIELD_LABEL,
  BUILDING_CREATE_SETUP_FORM_PROMPT,
  BUILDING_CREATE_SETUP_FORM_SKIP_LABEL,
  BUILDING_CREATE_SETUP_HEADLINE,
  BUILDING_CREATE_SETUP_IDENTITY_SUMMARY_EYEBROW,
  BUILDING_CREATE_SETUP_IDENTITY_SUMMARY_GROUP,
  buildBuildingCreateSetupSummaryEntries,
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
  REGION_CREATE_SETUP_SELECTIONS_EYEBROW,
  REGION_CREATE_SETUP_SELECTIONS_SUMMARY_GROUP,
  REGION_CREATE_SETUP_TYPE_FIELD_LABEL,
  REGION_CREATE_SETUP_TYPE_PROMPT,
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

export type LocationCreateModalSetupValues = {
  buildingForm: BuildingForm | ''
  buildingFormSkipped: boolean
  buildingFacilityAuthoringGroup: BuildingFacilityAuthoringGroup | 'browse_all' | ''
  siteType: SiteType | ''
  settlementType: SettlementType | ''
  classificationKind: RegionClassificationKind | ''
  regionType: string
}

export const EMPTY_LOCATION_CREATE_MODAL_SETUP_VALUES = {
  buildingForm: '',
  buildingFormSkipped: false,
  buildingFacilityAuthoringGroup: '',
  siteType: '',
  settlementType: '',
  classificationKind: '',
  regionType: '',
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
  summaryEntries: LocationSetupSummaryEntry[]
}

/** True when every choice set is complete (including projection-safe facility readiness). */
export function isLocationCreateModalSetupComplete(model: LocationCreateModalSetupModel): boolean {
  return model.choiceSets.every((set) => set.isComplete)
}

function optionLabel(options: readonly RadioCardOption[], value: string): string {
  return options.find((option) => option.value === value)?.label ?? value
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
    summaryEntries: projection
      ? buildBuildingCreateSetupSummaryEntries(projection, values.buildingFacilityAuthoringGroup)
      : [],
  }
}

export function resolveLocationCreateModalSetupModel({
  intent,
  values,
}: {
  intent: LocationCreateIntent
  values: LocationCreateModalSetupValues
}): LocationCreateModalSetupModel | null {
  if (intent.authoringType === 'building') {
    return resolveBuildingSetupModel(values)
  }

  if (intent.authoringType === 'site') {
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
      summaryEntries: values.siteType
        ? [
            {
              setId: 'siteType',
              fieldLabel: SITE_CREATE_SETUP_FIELD_LABEL,
              valueLabel: optionLabel(options, values.siteType),
            },
          ]
        : [],
    }
  }

  if (intent.authoringType === 'settlement') {
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
      summaryEntries: values.settlementType
        ? [
            {
              setId: 'settlementType',
              fieldLabel: SETTLEMENT_CREATE_SETUP_FIELD_LABEL,
              valueLabel: optionLabel(options, values.settlementType),
            },
          ]
        : [],
    }
  }

  if (intent.authoringType === 'region') {
    const kindOptions = buildRegionClassificationKindRadioOptions()
    const typeOptions = values.classificationKind
      ? buildRegionTypeRadioOptions(values.classificationKind)
      : []
    const classification = parseRegionClassification(values.classificationKind, values.regionType)
    return {
      headline: resolveRegionCreateSetupHeadline(intent),
      choiceSets: [
        {
          id: 'classification',
          fieldLabel: REGION_CREATE_SETUP_CLASSIFICATION_FIELD_LABEL,
          prompt: resolveRegionCreateSetupPrompt(intent),
          options: kindOptions,
          value: values.classificationKind,
          summaryGroup: REGION_CREATE_SETUP_SELECTIONS_SUMMARY_GROUP,
          summaryGroupEyebrow: REGION_CREATE_SETUP_SELECTIONS_EYEBROW,
          isComplete: Boolean(values.classificationKind),
        },
        {
          id: 'regionType',
          fieldLabel: REGION_CREATE_SETUP_TYPE_FIELD_LABEL,
          prompt: REGION_CREATE_SETUP_TYPE_PROMPT,
          options: typeOptions,
          value: values.regionType,
          dependsOn: ['classification'],
          summaryGroup: REGION_CREATE_SETUP_SELECTIONS_SUMMARY_GROUP,
          summaryGroupEyebrow: REGION_CREATE_SETUP_SELECTIONS_EYEBROW,
          isComplete: Boolean(values.regionType),
        },
      ],
      complete: () => (classification ? { kind: 'region', classification } : null),
      summaryEntries:
        values.classificationKind && values.regionType
          ? [
              {
                setId: 'classification',
                fieldLabel: REGION_CREATE_SETUP_CLASSIFICATION_FIELD_LABEL,
                valueLabel: optionLabel(kindOptions, values.classificationKind),
              },
              {
                setId: 'regionType',
                fieldLabel: REGION_CREATE_SETUP_TYPE_FIELD_LABEL,
                valueLabel: optionLabel(typeOptions, values.regionType),
              },
            ]
          : [],
    }
  }

  return null
}

function clearInvalidatedLocationSetupValues(
  values: LocationCreateModalSetupValues,
  invalidatedSetIds: readonly string[],
): LocationCreateModalSetupValues {
  let next = values

  for (const setId of invalidatedSetIds) {
    if (setId === 'regionType') {
      next = { ...next, regionType: '' }
    }
    if (setId === 'buildingFacilityAuthoringGroup') {
      next = { ...next, buildingFacilityAuthoringGroup: '' }
    }
  }

  return next
}

export function applyLocationCreateModalSetupValueChange({
  values,
  event,
}: {
  values: LocationCreateModalSetupValues
  event: CreateSetupValueChangeEvent
}): LocationCreateModalSetupValues {
  const nextValues = clearInvalidatedLocationSetupValues(values, event.invalidatedSetIds)

  const buildingSelection = applyBuildingCreateSetupSelectionChange({
    selection: {
      form: nextValues.buildingForm,
      facilityAuthoringGroup: nextValues.buildingFacilityAuthoringGroup,
    },
    choiceSetId: event.setId,
    nextValue: String(event.nextValue),
  })
  if (buildingSelection) {
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
  if (event.setId === 'classification') {
    return {
      ...nextValues,
      classificationKind: event.nextValue as RegionClassificationKind | '',
      regionType: '',
    }
  }
  if (event.setId === 'regionType') {
    return { ...nextValues, regionType: String(event.nextValue) }
  }
  return nextValues
}
