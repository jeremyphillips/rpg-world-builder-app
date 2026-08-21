import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormProvider, useForm } from 'react-hook-form'
import type { ContentCampaignAccessPatch } from '@rpg/contracts'
import { DEFAULT_CONTENT_CAMPAIGN_ACCESS } from '@rpg/contracts'
import { FormSectionProvider, FormUiProvider } from '@rpg/ui/form'

import { CampaignAccessAvailableSwitch } from './campaign-access-available-switch'
import {
  CampaignAccessAvailabilityProvider,
  CampaignAccessFormProvider,
} from './campaign-access-form-context'
import {
  CAMPAIGN_ACCESS_AVAILABLE_HINT,
  CAMPAIGN_ACCESS_AVAILABLE_LABEL,
  CAMPAIGN_ACCESS_AVAILABLE_TOOLTIP,
} from './campaign-access-labels'

const meta = {
  title: 'Content/Campaign Access/Available Switch',
  component: CampaignAccessAvailableSwitch,
  parameters: { layout: 'padded' },
  args: {
    label: CAMPAIGN_ACCESS_AVAILABLE_LABEL,
    hint: CAMPAIGN_ACCESS_AVAILABLE_HINT,
    info: CAMPAIGN_ACCESS_AVAILABLE_TOOLTIP,
  },
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
    <CampaignAccessFormProvider>
      <CampaignAccessAvailabilityProvider
        value={{
          pending,
          onAvailableChange: (checked) => {
            form.setValue('available', checked)
          },
        }}
      >
        <FormProvider {...form}>
          <FormUiProvider>
            <FormSectionProvider density="comfortable">
              <CampaignAccessAvailableSwitch
                label={CAMPAIGN_ACCESS_AVAILABLE_LABEL}
                hint={CAMPAIGN_ACCESS_AVAILABLE_HINT}
                info={CAMPAIGN_ACCESS_AVAILABLE_TOOLTIP}
              />
            </FormSectionProvider>
          </FormUiProvider>
        </FormProvider>
      </CampaignAccessAvailabilityProvider>
    </CampaignAccessFormProvider>
  )
}

export const SettingsLayout: Story = {
  render: () => <AvailableSwitchHarness />,
}

export const Pending: Story = {
  render: () => <AvailableSwitchHarness pending />,
}
