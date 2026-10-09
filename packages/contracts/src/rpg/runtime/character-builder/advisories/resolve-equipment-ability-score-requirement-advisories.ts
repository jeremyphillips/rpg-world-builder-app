import type { CharacterBuildAdvisoryOfCode } from '../../../character-builder/build-advisory'
import { getEquipmentAbilityScoreRequirements } from '../../../content/equipment/equipment-ability-score-requirements'
import { resolveUnmetAbilityScoreRequirements } from '../../../content/lib/ability-score-requirements'
import type { CharacterBuildAdvisoryFacts } from './character-build-advisory-facts'
import { projectEquipmentAdvisorySubjectIds } from './project-equipment-advisory-subjects'

type EquipmentAbilityScoreRequirementAdvisory =
  CharacterBuildAdvisoryOfCode<'equipment_ability_score_requirement_unmet'>

/** Owned equipment whose authored minimum scores the draft's known scores do not meet. */
export function resolveEquipmentAbilityScoreRequirementAdvisories(
  facts: CharacterBuildAdvisoryFacts,
): EquipmentAbilityScoreRequirementAdvisory[] {
  const scores = facts.effectiveDraft.abilities?.scores
  const advisories: EquipmentAbilityScoreRequirementAdvisory[] = []
  for (const equipmentId of projectEquipmentAdvisorySubjectIds(facts)) {
    const equipment = facts.catalogIndex.equipment.get(equipmentId)
    if (!equipment) continue
    const [first, ...rest] = resolveUnmetAbilityScoreRequirements(
      getEquipmentAbilityScoreRequirements(equipment),
      scores,
    )
    if (!first) continue
    advisories.push({
      code: 'equipment_ability_score_requirement_unmet',
      subject: {
        kind: 'equipment',
        equipmentId: equipment.id,
        label: equipment.name,
        unmet: [first, ...rest],
      },
    })
  }
  return advisories
}

export function compareEquipmentAbilityScoreRequirementAdvisories(
  a: EquipmentAbilityScoreRequirementAdvisory,
  b: EquipmentAbilityScoreRequirementAdvisory,
): number {
  return (
    a.subject.label.localeCompare(b.subject.label) ||
    a.subject.equipmentId.localeCompare(b.subject.equipmentId)
  )
}
