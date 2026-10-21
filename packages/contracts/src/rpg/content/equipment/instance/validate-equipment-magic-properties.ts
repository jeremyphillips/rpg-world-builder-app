import type { ContentValidationIssue } from '../../lib/content-validation-issue'
import type { Equipment } from '../../equipment'
import type { EquipmentInstance } from './instance'
import type { MagicPropertyDefinitionProvider } from './magic-property'
import { normalizeEquipmentInstance } from './normalize-equipment-instance'
import { resolveEquipmentMagicProperties } from './resolve-equipment-magic-properties'

export const EQUIPMENT_MAGIC_PROPERTY_ISSUE_CODE = {
  unknownPreset: 'unknown_magic_property_preset',
  inapplicablePreset: 'inapplicable_magic_property_preset',
  duplicatePreset: 'duplicate_magic_property_preset',
  multipleEnhancements: 'multiple_magic_property_enhancements',
  duplicateEffectTarget: 'duplicate_equipment_adjustment_target',
} as const

function issue(path: string, message: string, code: string): ContentValidationIssue {
  return { path, message, code }
}

export function validateEquipmentMagicProperties(args: {
  entry: EquipmentInstance
  item: Equipment
  provider: MagicPropertyDefinitionProvider
  pathPrefix: string
}): ContentValidationIssue[] {
  const { entry, item, provider, pathPrefix } = args
  const normalized = normalizeEquipmentInstance(entry)
  const issues: ContentValidationIssue[] = []
  const magic = resolveEquipmentMagicProperties(normalized, item, provider)

  for (const unresolved of magic.unresolved) {
    issues.push(
      issue(
        `${pathPrefix}.magicProperties`,
        `Unknown magic property preset "${unresolved.propertyId}".`,
        EQUIPMENT_MAGIC_PROPERTY_ISSUE_CODE.unknownPreset,
      ),
    )
  }

  for (const inapplicable of magic.inapplicable) {
    issues.push(
      issue(
        `${pathPrefix}.magicProperties`,
        `Magic property "${inapplicable.definition.name}" does not apply to this item.`,
        EQUIPMENT_MAGIC_PROPERTY_ISSUE_CODE.inapplicablePreset,
      ),
    )
  }

  const presetIds = (normalized.magicProperties ?? [])
    .filter((row) => row.kind === 'preset')
    .map((row) => row.propertyId)
  if (new Set(presetIds).size !== presetIds.length) {
    issues.push(
      issue(
        `${pathPrefix}.magicProperties`,
        'Duplicate magic property presets on one entry.',
        EQUIPMENT_MAGIC_PROPERTY_ISSUE_CODE.duplicatePreset,
      ),
    )
  }

  const enhancements = magic.resolved.filter((row) => row.definition.category === 'enhancement')
  if (enhancements.length > 1) {
    issues.push(
      issue(
        `${pathPrefix}.magicProperties`,
        'At most one enhancement magic property per entry.',
        EQUIPMENT_MAGIC_PROPERTY_ISSUE_CODE.multipleEnhancements,
      ),
    )
  }

  const targets = (normalized.adjustments ?? []).map((effect) => effect.target)
  if (new Set(targets).size !== targets.length) {
    issues.push(
      issue(
        `${pathPrefix}.adjustments`,
        'At most one adjustment per target.',
        EQUIPMENT_MAGIC_PROPERTY_ISSUE_CODE.duplicateEffectTarget,
      ),
    )
  }

  return issues
}
