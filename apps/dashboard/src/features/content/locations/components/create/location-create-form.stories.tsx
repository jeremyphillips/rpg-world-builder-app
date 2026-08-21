import type { Meta, StoryObj } from '@storybook/react-vite'
import { useRef } from 'react'
import { Button, dialogPanelSectionInsetXClasses } from '@rpg/ui'
import { FormShellFooterScope, FormShellFooterSlot, FormShellSubmitButton } from '@rpg/ui/form'

import type { ContentFormHostLeaveBridge } from '../../../lib/forms/shells/content-form-host.client'
import { ContentFormOptionsGate } from '../../../lib/forms/shells/content-form-shell-layout'
import { formatContentCreateActionLabel } from '../../../lib/content-type-labels'
import { STORY_CAMPAIGN_ID } from '../../../lib/fixtures/constants'
import { HARBORFORD } from '../../fixtures'
import { LocationCreateForm } from './location-create-form.client'

function LocationCreateFormStory({
  authoringType = 'building',
  settlementType,
}: {
  authoringType?: 'building' | 'settlement'
  settlementType?: 'city'
}) {
  const leaveBridgeRef = useRef<ContentFormHostLeaveBridge | null>(null)
  const fixedCreate =
    authoringType === 'settlement'
      ? {
          authoringType: 'settlement' as const,
          settlementType: settlementType ?? ('city' as const),
          parent: { kind: 'fixed' as const, locationId: HARBORFORD.id },
          parentKind: HARBORFORD.kind,
        }
      : {
          authoringType: 'building' as const,
          parent: { kind: 'fixed' as const, locationId: HARBORFORD.id },
          parentKind: HARBORFORD.kind,
        }

  return (
    <ContentFormOptionsGate campaignId={STORY_CAMPAIGN_ID}>
      {(optionsCtx) => (
        <div className="mx-auto max-w-lg rounded-lg border border-border bg-card shadow-sm">
          <div className="border-b border-border px-4 py-3 text-sm font-medium">Create form</div>
          <FormShellFooterScope>
            <LocationCreateForm
              fixedCreate={fixedCreate}
              campaignId={STORY_CAMPAIGN_ID}
              optionsCtx={optionsCtx}
              mounted
              leaveGuardEnabled={false}
              leaveBridgeRef={leaveBridgeRef}
              formKey={`story-${authoringType}`}
              onTrustedClose={() => undefined}
              chrome={({ pending }) => ({
                contentWrapper: (content) => (
                  <div className={dialogPanelSectionInsetXClasses}>{content}</div>
                ),
                footer: () => (
                  <>
                    <Button type="button" variant="outline" disabled={pending}>
                      Cancel
                    </Button>
                    <FormShellSubmitButton disabled={pending}>
                      {formatContentCreateActionLabel('locations')}
                    </FormShellSubmitButton>
                  </>
                ),
              })}
            />
            <div className="border-t border-border px-4 py-3">
              <FormShellFooterSlot />
            </div>
          </FormShellFooterScope>
        </div>
      )}
    </ContentFormOptionsGate>
  )
}

const meta = {
  title: 'Content/Locations/LocationCreateForm',
  component: LocationCreateFormStory,
} satisfies Meta<typeof LocationCreateFormStory>

export default meta
type Story = StoryObj<typeof LocationCreateFormStory>

export const Building: Story = {
  args: { authoringType: 'building' },
}

export const SettlementWithDistricts: Story = {
  args: { authoringType: 'settlement', settlementType: 'city' },
}
