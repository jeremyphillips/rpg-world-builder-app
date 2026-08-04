import type { Meta, StoryObj } from '@storybook/react-vite'

import { DEFAULT_SYSTEM_RULESET_ID } from '@rpg/contracts'
import { listLanguageSeedOptions } from '@rpg/catalog/vocabulary'

import {
  mapHeritageOptionsToDependentCardOptions,
  resolveDependentChoiceSectionCopy,
} from '../lib/builder/builder-dependent-choice.lib'
import { DEPENDENT_KIND_HERITAGE } from '../lib/builder/builder-parent-choice-status.lib'
import { getDrowHeritageSpellCatalog } from '@/features/content'
import { pickSpecies } from '@/features/content'
import { BuilderDependentChoiceSection } from './builder-dependent-choice-section.client'

const elf = pickSpecies('elf')
const languages = listLanguageSeedOptions(DEFAULT_SYSTEM_RULESET_ID)
const heritageOptions = mapHeritageOptionsToDependentCardOptions(
  elf,
  languages,
  getDrowHeritageSpellCatalog(),
)

const meta = {
  title: 'Character Builder/BuilderDependentChoiceSection',
  component: BuilderDependentChoiceSection,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof BuilderDependentChoiceSection>

export default meta
type Story = StoryObj<typeof BuilderDependentChoiceSection>

export const Unresolved: Story = {
  args: {
    title: 'Elven Lineage',
    sectionCopy: resolveDependentChoiceSectionCopy({ required: true }),
    dependentKindLabel: DEPENDENT_KIND_HERITAGE,
    options: heritageOptions,
    value: '',
    onValueChange: () => undefined,
    idPrefix: 'story-species-heritage',
  },
}

export const Resolved: Story = {
  args: {
    title: 'Elven Lineage',
    sectionCopy: resolveDependentChoiceSectionCopy({
      required: false,
      selectedOptionLabel: 'Drow',
    }),
    dependentKindLabel: DEPENDENT_KIND_HERITAGE,
    options: heritageOptions,
    value: 'drow',
    onValueChange: () => undefined,
    idPrefix: 'story-species-heritage',
  },
}

/** Nested inside a parent RadioCard shell (species / class dependent-choice pattern). */
export const EmbeddedInParentCard: Story = {
  args: {
    title: 'Gnomish Lineage',
    sectionCopy: resolveDependentChoiceSectionCopy({ required: true }),
    dependentKindLabel: DEPENDENT_KIND_HERITAGE,
    options: heritageOptions,
    value: '',
    onValueChange: () => undefined,
    idPrefix: 'story-species-heritage-embedded',
    embedded: true,
  },
}
