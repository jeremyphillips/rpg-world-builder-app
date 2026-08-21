import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormProvider, useForm } from 'react-hook-form'
import { defaultMulticlassingRules, buildContentPurposeSelectors } from '@rpg/contracts'

import { pickClass } from '../../lib/fixtures/pick'

import { defaultCampaignRules } from '../../lib/form-options/content-campaign-rules'
import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import { SpeciesRulesTab } from './species-rules-tab.client'

const meta = {
  title: 'Content/Species/SpeciesRulesTab',
  component: SpeciesRulesTab,
  parameters: { layout: 'padded' },
  args: { formCtx: {} },
} satisfies Meta<typeof SpeciesRulesTab>

export default meta
type Story = StoryObj<typeof meta>

function TabStory({ formCtx }: { formCtx: ContentFormCtx }) {
  const form = useForm({
    defaultValues: {
      characterCreation: {
        multiclassing: {
          policy: 'restricted',
          classPolicy: { mode: 'only', classIds: ['fighter'] },
        },
        levelLimits: {
          limitMaxCharacterLevel: true,
          maxCharacterLevel: 10,
          enableClassLevelCaps: true,
          classLevelCaps: [{ classId: 'wizard', maxLevel: 5 }],
        },
      },
    },
  })

  return (
    <FormProvider {...form}>
      <SpeciesRulesTab formCtx={formCtx} />
    </FormProvider>
  )
}

export const MulticlassingDisabled: Story = {
  render: () => (
    <TabStory
      formCtx={{
        campaignId: 'camp_1',
        campaignRules: {
          ...defaultCampaignRules(),
          multiclassing: {
            enabled: false,
            requirements: defaultMulticlassingRules().requirements,
          },
        },
      }}
    />
  ),
}

export const RequirementsDisabled: Story = {
  render: () => (
    <TabStory
      formCtx={{
        campaignId: 'camp_1',
        campaignRules: defaultCampaignRules(),
      }}
    />
  ),
}

export const Editable: Story = {
  render: () => (
    <TabStory
      formCtx={{
        campaignId: 'camp_1',
        options: {
          classes: buildContentPurposeSelectors([pickClass('fighter'), pickClass('wizard')]),
        },
        campaignRules: {
          ...defaultCampaignRules(),
          multiclassing: {
            enabled: true,
            requirements: {
              primaryAbilityMinimum: { enabled: true, minimumScore: 13 },
              speciesPolicy: { enabled: true },
              speciesLevelLimits: { enabled: true },
            },
          },
        },
      }}
    />
  ),
}

export const PolicySectionDisabled: Story = {
  render: () => (
    <TabStory
      formCtx={{
        campaignId: 'camp_1',
        campaignRules: {
          ...defaultCampaignRules(),
          multiclassing: {
            enabled: true,
            requirements: {
              primaryAbilityMinimum: { enabled: true, minimumScore: 13 },
              speciesPolicy: { enabled: false },
              speciesLevelLimits: { enabled: true },
            },
          },
        },
      }}
    />
  ),
}
