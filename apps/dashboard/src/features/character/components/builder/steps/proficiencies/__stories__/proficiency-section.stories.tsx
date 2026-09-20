import type { Meta, StoryObj } from '@storybook/react-vite'

import { createProficienciesStepRogueFixture } from '../../../../../lib/proficiencies/proficiencies-step.fixtures'
import { ProficiencySection } from '../proficiency-section'

const { model } = createProficienciesStepRogueFixture()
const skills = model.sections.find((section) => section.kind === 'skills')!

const multiChoiceSkills = {
  ...skills,
  subhead: 'Choose additional skills from the options below.',
  aggregateCount: {
    selected: 1,
    max: 3,
    label: '1 / 3 chosen',
  },
  selectedRows: skills.selectedRows,
  choiceBlocks: [
    skills.choiceBlocks[0]!,
    {
      ...skills.choiceBlocks[0]!,
      choiceSet: {
        ...skills.choiceBlocks[0]!.choiceSet,
        id: 'species:srd-cc-5.2.1:elf:keen-senses',
        label: 'Keen Senses',
        max: 1,
      },
      selectedCount: 0,
      max: 1,
      poolDescription: 'Choose from Perception, Investigation, Survival.',
      addLabel: 'Add skill proficiency',
      isFull: false,
      isOverSelected: false,
    },
  ],
}

const meta = {
  title: 'Character Builder/ProficiencySection',
  component: ProficiencySection,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ProficiencySection>

export default meta
type Story = StoryObj<typeof ProficiencySection>

export const Skills: Story = {
  args: {
    section: skills,
    onOpenChoiceSet: () => undefined,
    onRemoveChoice: () => undefined,
  },
}

export const MultiChoiceSets: Story = {
  args: {
    section: multiChoiceSkills,
    onOpenChoiceSet: () => undefined,
    onRemoveChoice: () => undefined,
  },
}

export const SkillsWithValidation: Story = {
  args: {
    section: skills,
    validationIssues: [
      {
        code: 'choice_set_unsatisfied',
        message: 'Choose at least 2 options for Rogue Skills.',
        stepId: 'proficiencies',
        choiceSetId: skills.choiceBlocks[0]!.choiceSet.id,
      },
    ],
    onOpenChoiceSet: () => undefined,
    onRemoveChoice: () => undefined,
  },
}

export const MultiChoiceSetsWithValidation: Story = {
  args: {
    section: multiChoiceSkills,
    validationIssues: [
      {
        code: 'choice_set_unsatisfied',
        message: 'Choose at least 2 options for Rogue Skills.',
        stepId: 'proficiencies',
        choiceSetId: skills.choiceBlocks[0]!.choiceSet.id,
      },
      {
        code: 'choice_set_unsatisfied',
        message: 'Choose an option for Keen Senses.',
        stepId: 'proficiencies',
        choiceSetId: 'species:srd-cc-5.2.1:elf:keen-senses',
      },
    ],
    onOpenChoiceSet: () => undefined,
    onRemoveChoice: () => undefined,
  },
}
