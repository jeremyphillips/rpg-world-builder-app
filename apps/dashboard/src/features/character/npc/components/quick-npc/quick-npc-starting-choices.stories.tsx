import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormProvider, useForm } from 'react-hook-form'

import { withDashboardProviders } from '../../../../../../.storybook/decorators'
import {
  createCampaignNpcBuilderContextFixture,
  populatedBuilderCatalog,
} from '../../../lib/fixtures/character-builder-fixtures'
import {
  quickNpcAuthoringTabDefaultValues,
  type QuickNpcAuthoringTabFormValues,
} from '../../lib/quick-npc/quick-npc-form-fields'
import { resolveQuickNpcAdditionalEquipmentOptions } from '../../lib/quick-npc/quick-npc-additional-equipment.lib'
import { buildQuickNpcRequirementOptionSets } from '../../lib/quick-npc/quick-npc-requirement-options.lib'
import {
  quickNpcStandaloneCreateContext,
  quickNpcStandaloneSetupValues,
} from '../../lib/quick-npc/quick-npc-test-fixtures'
import { QuickNpcStartingChoices } from './quick-npc-starting-choices'

const buildContext = createCampaignNpcBuilderContextFixture({ catalog: populatedBuilderCatalog })

function StartingChoicesStory({
  defaultValues = quickNpcAuthoringTabDefaultValues,
  setup = quickNpcStandaloneSetupValues({
    npcTemplateId: 'guard',
    speciesId: populatedBuilderCatalog.species[0]!.id,
    classId: populatedBuilderCatalog.classes[0]!.id,
    level: 1,
  }),
}: {
  defaultValues?: QuickNpcAuthoringTabFormValues
  setup?: ReturnType<typeof quickNpcStandaloneSetupValues>
}) {
  const form = useForm<QuickNpcAuthoringTabFormValues>({ defaultValues })
  const optionSets = buildQuickNpcRequirementOptionSets({ setup, context: buildContext })
  const additionalEquipmentOptions = resolveQuickNpcAdditionalEquipmentOptions({
    setup,
    context: buildContext,
  })

  return (
    <FormProvider {...form}>
      <QuickNpcStartingChoices
        setup={setup}
        buildContext={buildContext}
        createContext={quickNpcStandaloneCreateContext()}
        optionSets={optionSets}
        additionalEquipmentOptions={additionalEquipmentOptions}
      />
    </FormProvider>
  )
}

const meta = {
  title: 'Features/Character/Quick NPC/Starting choices',
  component: StartingChoicesStory,
  decorators: [withDashboardProviders],
} satisfies Meta<typeof StartingChoicesStory>

export default meta
type Story = StoryObj<typeof meta>

export const ClassedWithPackage: Story = {}

export const ClasslessRoleDefaults: Story = {
  render: () => (
    <StartingChoicesStory
      setup={quickNpcStandaloneSetupValues({
        npcTemplateId: 'guard',
        speciesId: populatedBuilderCatalog.species[0]!.id,
        classId: '',
        level: 0,
      })}
    />
  ),
}

export const Empty: Story = {
  render: () => (
    <StartingChoicesStory
      setup={quickNpcStandaloneSetupValues({
        speciesId: populatedBuilderCatalog.species[0]!.id,
        classId: '',
        level: 0,
      })}
      defaultValues={{
        ...quickNpcAuthoringTabDefaultValues,
        equipmentSelections: [],
        requiredSpellIds: [],
        startingChoiceOverrides: {},
      }}
    />
  ),
}
