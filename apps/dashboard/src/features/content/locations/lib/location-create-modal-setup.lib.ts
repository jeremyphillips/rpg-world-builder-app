import type {
  BuildingFacilityAuthoringGroup,
  BuildingForm,
  RegionClassificationKind,
  SettlementType,
  SiteType,
} from '@rpg/contracts'
import type { RadioCardOption } from '@rpg/ui'

import type { LocationCreateIntent, LocationCreateSetupResult } from './location-create-session'
import {
  BUILDING_CREATE_SETUP_FACILITY_FIELD_LABEL,
  BUILDING_CREATE_SETUP_FACILITY_PROMPT,
  BUILDING_CREATE_SETUP_FORM_FIELD_LABEL,
  BUILDING_CREATE_SETUP_FORM_PROMPT,
  BUILDING_CREATE_SETUP_HEADLINE,
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
  buildingFacilityAuthoringGroup: BuildingFacilityAuthoringGroup | 'browse_all' | ''
  siteType: SiteType | ''
  settlementType: SettlementType | ''
  classificationKind: RegionClassificationKind | ''
  regionType: string
}

export const EMPTY_LOCATION_CREATE_MODAL_SETUP_VALUES = {
  buildingForm: '',
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
}

export type LocationCreateModalSetupModel = {
  headline: string
  /** Opt-in header subhead; omitted/false means no Modal description. */
  subhead?: string | false
  choiceSets: LocationCreateModalSetupChoiceSetConfig[]
  canContinue: boolean
  complete: () => LocationCreateSetupResult | null
  summaryEntries: { fieldLabel: string; valueLabel: string }[]
}

function optionLabel(options: readonly RadioCardOption[], value: string): string {
  return options.find((option) => option.value === value)?.label ?? value
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
      },
      {
        id: 'buildingFacilityAuthoringGroup',
        fieldLabel: BUILDING_CREATE_SETUP_FACILITY_FIELD_LABEL,
        prompt: BUILDING_CREATE_SETUP_FACILITY_PROMPT,
        options: facilityOptions,
        value: values.buildingFacilityAuthoringGroup,
      },
    ],
    canContinue: projection != null,
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
    const canContinue = Boolean(values.siteType)
    return {
      headline: SITE_CREATE_SETUP_HEADLINE,
      choiceSets: [
        {
          id: 'siteType',
          fieldLabel: SITE_CREATE_SETUP_FIELD_LABEL,
          prompt: SITE_CREATE_SETUP_PROMPT,
          options,
          value: values.siteType,
        },
      ],
      canContinue,
      complete: () =>
        values.siteType && isSiteType(values.siteType)
          ? { kind: 'site', siteType: values.siteType }
          : null,
      summaryEntries: values.siteType
        ? [
            {
              fieldLabel: SITE_CREATE_SETUP_FIELD_LABEL,
              valueLabel: optionLabel(options, values.siteType),
            },
          ]
        : [],
    }
  }

  if (intent.authoringType === 'settlement') {
    const options = buildSettlementTypeRadioOptions()
    const canContinue = Boolean(values.settlementType)
    return {
      headline: SETTLEMENT_CREATE_SETUP_HEADLINE,
      choiceSets: [
        {
          id: 'settlementType',
          fieldLabel: SETTLEMENT_CREATE_SETUP_FIELD_LABEL,
          prompt: SETTLEMENT_CREATE_SETUP_PROMPT,
          options,
          value: values.settlementType,
        },
      ],
      canContinue,
      complete: () =>
        values.settlementType && isSettlementType(values.settlementType)
          ? { kind: 'settlement', settlementType: values.settlementType }
          : null,
      summaryEntries: values.settlementType
        ? [
            {
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
    const canContinue = Boolean(classification)
    return {
      headline: resolveRegionCreateSetupHeadline(intent),
      choiceSets: [
        {
          id: 'classification',
          fieldLabel: REGION_CREATE_SETUP_CLASSIFICATION_FIELD_LABEL,
          prompt: resolveRegionCreateSetupPrompt(intent),
          options: kindOptions,
          value: values.classificationKind,
        },
        {
          id: 'regionType',
          fieldLabel: REGION_CREATE_SETUP_TYPE_FIELD_LABEL,
          prompt: REGION_CREATE_SETUP_TYPE_PROMPT,
          options: typeOptions,
          value: values.regionType,
          dependsOn: ['classification'],
        },
      ],
      canContinue,
      complete: () => (classification ? { kind: 'region', classification } : null),
      summaryEntries:
        values.classificationKind && values.regionType
          ? [
              {
                fieldLabel: REGION_CREATE_SETUP_CLASSIFICATION_FIELD_LABEL,
                valueLabel: optionLabel(kindOptions, values.classificationKind),
              },
              {
                fieldLabel: REGION_CREATE_SETUP_TYPE_FIELD_LABEL,
                valueLabel: optionLabel(typeOptions, values.regionType),
              },
            ]
          : [],
    }
  }

  return null
}

export function applyLocationCreateModalSetupValueChange({
  values,
  choiceSetId,
  nextValue,
}: {
  values: LocationCreateModalSetupValues
  choiceSetId: string
  nextValue: string
}): LocationCreateModalSetupValues {
  const buildingSelection = applyBuildingCreateSetupSelectionChange({
    selection: {
      form: values.buildingForm,
      facilityAuthoringGroup: values.buildingFacilityAuthoringGroup,
    },
    choiceSetId,
    nextValue,
  })
  if (buildingSelection) {
    return {
      ...values,
      buildingForm: buildingSelection.form,
      buildingFacilityAuthoringGroup: buildingSelection.facilityAuthoringGroup,
    }
  }
  if (choiceSetId === 'siteType') {
    return { ...values, siteType: isSiteType(nextValue) ? nextValue : '' }
  }
  if (choiceSetId === 'settlementType') {
    return { ...values, settlementType: isSettlementType(nextValue) ? nextValue : '' }
  }
  if (choiceSetId === 'classification') {
    // Clear dependsOn dependents atomically with the upstream change.
    return {
      ...values,
      classificationKind: nextValue as RegionClassificationKind | '',
      regionType: '',
    }
  }
  if (choiceSetId === 'regionType') {
    return { ...values, regionType: nextValue }
  }
  return values
}
