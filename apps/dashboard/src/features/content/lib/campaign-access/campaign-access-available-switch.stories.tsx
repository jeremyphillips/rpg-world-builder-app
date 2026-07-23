import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormProvider, useForm } from 'react-hook-form'
import type { ContentCampaignAccessPatch } from '@rpg/contracts'
import { DEFAULT_CONTENT_CAMPAIGN_ACCESS } from '@rpg/contracts'
import { FormSectionProvider, FormUiProvider } from '@rpg/ui/form'

import { CampaignAccessAvailableSwitch } from './campaign-access-available-switch.client'
import { CampaignAccessFormProvider } from './campaign-access-form-context.client'

const meta = {
  title: 'Content/Campaign Access/Available Switch',
  component: CampaignAccessAvailableSwitch,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CampaignAccessAvailableSwitch>

export default meta

type Story = StoryObj<typeof meta>

function AvailableSwitchHarness({
  available = true,
  pending = false,
}: {
  available?: boolean
  pending?: boolean
}) {
  const form = useForm<ContentCampaignAccessPatch>({
    defaultValues: {
      available,
      visibilityMode: DEFAULT_CONTENT_CAMPAIGN_ACCESS.visibilityMode,
      participantIds: [],
    },
  })

  return (
    <CampaignAccessFormProvider
      value={{
        pending,
        onAvailableChange: (checked) => {
          form.setValue('available', checked)
        },
      }}
    >
      <FormProvider {...form}>
        <FormUiProvider>
          <FormSectionProvider size="md" rhythm="comfortable">
            <CampaignAccessAvailableSwitch />
          </FormSectionProvider>
        </FormUiProvider>
      </FormProvider>
    </CampaignAccessFormProvider>
  )
}

export const SettingsLayout: Story = {
  render: () => <AvailableSwitchHarness />,
}

export const Pending: Story = {
  render: () => <AvailableSwitchHarness pending />,
}
