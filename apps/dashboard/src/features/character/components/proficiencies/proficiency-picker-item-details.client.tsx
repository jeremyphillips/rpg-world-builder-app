'use client'

import type { CharacterBuildCatalogIndex } from '@rpg/contracts'

import {
  buildSkillProficiencyDetailViewModel,
  SkillProficiencyDetailMetadata,
} from '@/features/content'

export type ProficiencyPickerItemDetailsProps = {
  optionId: string
  catalogIndex: CharacterBuildCatalogIndex
}

export function ProficiencyPickerItemDetails({
  optionId,
  catalogIndex,
}: ProficiencyPickerItemDetailsProps) {
  const skill = catalogIndex.skillProficiencies.get(optionId)
  if (!skill) return null

  const viewModel = buildSkillProficiencyDetailViewModel(skill)

  return (
    <div className="px-2 pt-3">
      <SkillProficiencyDetailMetadata viewModel={viewModel} statRowSize="sm" />
    </div>
  )
}
