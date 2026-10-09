import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormProvider, useForm } from 'react-hook-form'

import { withDashboardProviders } from '../../../../../../.storybook/decorators'
import {
  createCampaignNpcBuilderContextFixture,
  populatedBuilderCatalog,
} from '../../../lib/fixtures/character-builder-fixtures'
import { resolveQuickNpcAdditionalEquipmentOptions } from '../../lib/quick-npc/quick-npc-additional-equipment.lib'
import { resolveQuickNpcStartingChoices } from '../../lib/quick-npc/quick-npc-starting-choices.lib'
import {
  quickNpcAuthoringTabDefaultValues,
  type QuickNpcAuthoringTabFormValues,
} from '../../lib/quick-npc/quick-npc-form-fields'
import {
  quickNpcStandaloneCreateContext,
  quickNpcStandaloneSetupValues,
} from '../../lib/quick-npc/quick-npc-test-fixtures'
import { QuickNpcStartingEquipmentPanel } from './quick-npc-starting-equipment-panel'
import {
  QuickNpcPreparedBuildProvider,
  QuickNpcPreparedBuildSync,
} from './quick-npc-prepared-build-context'

const buildContext = createCampaignNpcBuilderContextFixture({ catalog: populatedBuilderCatalog })

function EquipmentPanelStory() {
  const setup = quickNpcStandaloneSetupValues({
    npcTemplateId: 'guard',
    speciesId: populatedBuilderCatalog.species[0]!.id,
    classId: populatedBuilderCatalog.classes[0]!.id,
    level: 1,
  })
  const form = useForm<QuickNpcAuthoringTabFormValues>({
    defaultValues: quickNpcAuthoringTabDefaultValues,
  })
  const createContext = quickNpcStandaloneCreateContext()
  const choices = resolveQuickNpcStartingChoices({
    setup,
    context: buildContext,
    createContext,
  })
  const additionalOptions = resolveQuickNpcAdditionalEquipmentOptions({
    setup,
    context: buildContext,
  })

  return (
    <QuickNpcPreparedBuildProvider>
      <FormProvider {...form}>
        <QuickNpcPreparedBuildSync
          form={form}
          setup={setup}
          buildContext={buildContext}
          createContext={createContext}
        />
        <QuickNpcStartingEquipmentPanel
          setup={setup}
          choices={choices}
          buildContext={buildContext}
          additionalOptions={additionalOptions}
        />
      </FormProvider>
    </QuickNpcPreparedBuildProvider>
  )
}

const meta = {
  title: 'Features/Character/Quick NPC/Starting equipment panel',
  component: EquipmentPanelStory,
  decorators: [withDashboardProviders],
} satisfies Meta<typeof EquipmentPanelStory>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
