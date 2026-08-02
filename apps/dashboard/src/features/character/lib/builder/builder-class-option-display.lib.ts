import { getSkillName, type CharacterBuildCatalog, type CharacterClass } from '@rpg/contracts'

import {
  buildClassCardViewModel,
  buildClassDetailViewModel,
  CLASS_SECTION_LABELS,
} from '@/features/content'
import { getContentTypeItemLabel } from '@/features/content/lib/content-type-labels'

import type { BuilderOptionDetailsSection } from '@rpg/ui'

export const BUILDER_CLASS_EYEBROW = getContentTypeItemLabel('classes')

type BuilderClassDisplayVocabulary = {
  resolveSkillLabel: (slug: string) => string
  resolveToolLabel: (slug: string) => string
}

function formatSlugLabel(slug: string): string {
  return slug
    .split('-')
    .map((part) => (part.length > 0 ? part.charAt(0).toUpperCase() + part.slice(1) : part))
    .join(' ')
}

function buildBuilderClassVocabulary(
  catalog: Pick<CharacterBuildCatalog, 'equipment' | 'skillProficiencies'>,
): BuilderClassDisplayVocabulary {
  const equipmentBySlug = new Map(catalog.equipment.map((entry) => [entry.slug, entry.name]))

  return {
    resolveSkillLabel: (slug) =>
      catalog.skillProficiencies.find((skill) => skill.slug === slug)?.name ?? getSkillName(slug),
    resolveToolLabel: (slug) => equipmentBySlug.get(slug) ?? formatSlugLabel(slug),
  }
}

function resolveChoiceOptionLabels(
  row: { id: 'skills' | 'tools' | 'languages'; optionSlugs: string[] },
  vocabulary: BuilderClassDisplayVocabulary,
): string[] {
  if (row.id === 'skills') {
    return row.optionSlugs.map((slug) => vocabulary.resolveSkillLabel(slug))
  }

  if (row.id === 'tools') {
    return row.optionSlugs.map((slug) => vocabulary.resolveToolLabel(slug))
  }

  return row.optionSlugs
}

export function formatClassCardOption(characterClass: CharacterClass) {
  return buildClassCardViewModel(characterClass)
}

export type ClassDetailsSheetContent = {
  title: string
  eyebrow: string
  descriptionHtml?: string
  metadata: Array<{ label: string; value: string }>
  sections: BuilderOptionDetailsSection[]
}

export function buildClassDetailsSheetContent(
  characterClass: CharacterClass,
  catalog: Pick<CharacterBuildCatalog, 'equipment' | 'skillProficiencies'>,
): ClassDetailsSheetContent {
  const builderVocabulary = buildBuilderClassVocabulary(catalog)
  const viewModel = buildClassDetailViewModel(
    characterClass,
    { resolveToolLabel: builderVocabulary.resolveToolLabel },
    { surface: 'builder-sheet' },
  )

  const sections: BuilderOptionDetailsSection[] = []

  const proficiencies = viewModel.sections.find((section) => section.id === 'proficiencies')
  if (proficiencies && proficiencies.id === 'proficiencies') {
    sections.push({
      title: CLASS_SECTION_LABELS.proficiencies,
      items: [
        ...proficiencies.granted.map((row) => ({
          title: row.label,
          body: row.value,
        })),
        ...proficiencies.choices.map((row) => ({
          title: row.label,
          optionPool: {
            summary: row.compactSummary,
            optionLabels: resolveChoiceOptionLabels(row, builderVocabulary),
          },
        })),
      ],
    })
  }

  const features = viewModel.sections.find((section) => section.id === 'features')
  if (features && features.id === 'features') {
    sections.push({
      title: features.title,
      items: features.items.map((item) => ({
        title: item.title,
        body: item.bodyHtml,
      })),
    })
  }

  return {
    title: characterClass.name,
    eyebrow: BUILDER_CLASS_EYEBROW,
    descriptionHtml: viewModel.descriptionHtml,
    metadata: viewModel.statRows.map(({ label, value }) => ({ label, value })),
    sections,
  }
}
