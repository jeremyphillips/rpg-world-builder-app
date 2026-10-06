import { defineMessage, formatFieldMessage } from '../../../../validation/define-message'
import type {
  CharacterBuildAdvisory,
  EquipmentAdvisoryClass,
} from '../../../character-builder/build-advisory'
import type { Equipment } from '../../../content/equipment'
import { formatUnmetAbilityScoreRequirementsDetail } from '../../../content/lib/ability-score-requirements'
import { getArmorCategorySentenceForm } from '../../../vocab/armor/category'
import { EQUIPMENT_KIND_ENTRIES } from '../../../vocab/equipment/kind'
import { getTermLabelSingular, getTermSentenceForm } from '../../../vocab/types'

// ---------------------------------------------------------------------------
// Character build advisory messages — non-blocking build consequences.
// Derived from advisory facts; distinct from blocking validation messages.
// See docs/validation-messages.md.
// ---------------------------------------------------------------------------

/** Counted noun for “Not proficient with this …”. Armor stays the kind label, not “piece of armor”. */
function notProficientEquipmentNoun(equipmentClass: EquipmentAdvisoryClass): string {
  switch (equipmentClass) {
    case 'weapon':
      return getTermSentenceForm(EQUIPMENT_KIND_ENTRIES.weapon, 1)
    case 'armor':
      return getTermLabelSingular(EQUIPMENT_KIND_ENTRIES.armor.label)
    case 'shield':
      return getArmorCategorySentenceForm('shields', 1)
    default: {
      const _exhaustive: never = equipmentClass
      return _exhaustive
    }
  }
}

function notProficientWith(noun: string): string {
  return `Not proficient with this ${noun}`
}

export const characterBuilderAdvisoryMessages = {
  notProficientWeapon: defineMessage(
    'validation.characterBuilderAdvisory.notProficientWeapon',
    () => notProficientWith(notProficientEquipmentNoun('weapon')),
  ),
  notProficientArmor: defineMessage('validation.characterBuilderAdvisory.notProficientArmor', () =>
    notProficientWith(notProficientEquipmentNoun('armor')),
  ),
  notProficientShield: defineMessage(
    'validation.characterBuilderAdvisory.notProficientShield',
    () => notProficientWith(notProficientEquipmentNoun('shield')),
  ),
  /** Compact row label; the class sentence above stays the detail. */
  notProficientShort: defineMessage(
    'validation.characterBuilderAdvisory.notProficientShort',
    () => 'Not proficient',
  ),
}

const NOT_PROFICIENT_MESSAGES = {
  weapon: characterBuilderAdvisoryMessages.notProficientWeapon,
  armor: characterBuilderAdvisoryMessages.notProficientArmor,
  shield: characterBuilderAdvisoryMessages.notProficientShield,
} as const

export function equipmentAdvisoryClass(equipment: Equipment): EquipmentAdvisoryClass | undefined {
  if (equipment.kind === 'weapon') return 'weapon'
  if (equipment.kind === 'armor') return equipment.category === 'shields' ? 'shield' : 'armor'
  return undefined
}

/** Player-facing sentence for one equipment class. Shared by advisories and picker guidance. */
export function resolveEquipmentNotProficientMessage(
  equipmentClass: EquipmentAdvisoryClass,
): string {
  return formatFieldMessage(NOT_PROFICIENT_MESSAGES[equipmentClass]())
}

/** Compact row label for any equipment class; pair with the class sentence as detail. */
export function resolveEquipmentNotProficientShortLabel(): string {
  return formatFieldMessage(characterBuilderAdvisoryMessages.notProficientShort())
}

export function resolveCharacterBuildAdvisoryMessage(advisory: CharacterBuildAdvisory): string {
  switch (advisory.code) {
    case 'equipment_not_proficient':
      return resolveEquipmentNotProficientMessage(advisory.subject.equipmentClass)
    case 'equipment_ability_score_requirement_unmet':
      return formatUnmetAbilityScoreRequirementsDetail(advisory.subject.unmet)
  }
}
