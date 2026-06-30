import type {
  ArmorClassBase,
  ResolvedCampaignMechanicsPatch,
  UpdateCampaignMechanicsInput,
} from '@rpg/contracts'
import { DEFAULT_EDITION_PRESET_ID, getEditionPresetMechanics } from '@rpg/contracts'

import type { MechanicsValues } from './mechanics-form-fields'

/** Maps resolved ruleset-patch mechanics to flat mechanics form values. */
export function mapRulesetPatchToMechanicsValues(
  mechanics: ResolvedCampaignMechanicsPatch,
): MechanicsValues {
  return {
    editionPresetId: mechanics.editionPreset.id,
    armorClassMode: mechanics.armorClass.mode,
    armorClassBase: String(mechanics.armorClass.base) as MechanicsValues['armorClassBase'],
    attackResolutionMode: mechanics.attackResolution.mode,
  }
}

/** Maps flat mechanics form values to the nested mechanics patch input shape. */
export function buildMechanicsPatchInput(values: MechanicsValues): UpdateCampaignMechanicsInput {
  return {
    editionPreset: { id: values.editionPresetId },
    armorClass: {
      mode: values.armorClassMode,
      base: Number(values.armorClassBase) as ArmorClassBase,
    },
    attackResolution: {
      mode: values.attackResolutionMode,
    },
  }
}

/** Default flat mechanics values for forms before patch data loads. */
export function defaultMechanicsValues(): MechanicsValues {
  const defaults = getEditionPresetMechanics(DEFAULT_EDITION_PRESET_ID)
  return {
    editionPresetId: DEFAULT_EDITION_PRESET_ID,
    armorClassMode: defaults.armorClass.mode,
    armorClassBase: String(defaults.armorClass.base) as MechanicsValues['armorClassBase'],
    attackResolutionMode: defaults.attackResolution.mode,
  }
}
