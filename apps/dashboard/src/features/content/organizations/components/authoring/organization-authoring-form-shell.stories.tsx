'use client'

import type { Meta, StoryObj } from '@storybook/react-vite'
import { Form } from '@rpg/ui/form'

import { STORY_CAMPAIGN_ID } from '../../../lib/fixtures/constants'
import { makeContentFormCtx } from '../../../lib/fixtures/content-form-ctx'
import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { ContentFormOptionsGate } from '../../../lib/forms/shells/layout/content-form-shell-layout'
import {
  buildOrganizationFields,
  buildOrganizationFormValueSyncs,
  organizationCreateDefaultValues,
  organizationFormSchema,
} from '../../../lib/forms/organization-form-projection'
import { OrganizationAuthoringPresetBridge } from './organization-authoring-preset-bridge.client'
import { useOrganizationAuthoringContext } from './organization-authoring-context.client'
import { OrganizationAuthoringFormShell } from './organization-authoring-form-shell.client'

function OrganizationAuthoringFormBody({ ctx }: { ctx: ContentFormCtx }) {
  const { practiceRecommendations } = useOrganizationAuthoringContext()

  return (
    <Form
      schema={organizationFormSchema}
      fields={buildOrganizationFields({
        ...ctx,
        organizationPracticeRecommendationIds: practiceRecommendations,
      })}
      defaultValues={organizationCreateDefaultValues}
      valueSyncs={buildOrganizationFormValueSyncs()}
      onSubmit={() => undefined}
      header={() => <OrganizationAuthoringPresetBridge />}
    />
  )
}

function OrganizationAuthoringFormShellStory() {
  return (
    <ContentFormOptionsGate campaignId={STORY_CAMPAIGN_ID}>
      {(optionsCtx) => (
        <div className="mx-auto max-w-lg rounded-lg border border-border bg-card p-4 shadow-sm">
          <OrganizationAuthoringFormShell>
            <OrganizationAuthoringFormBody
              ctx={{
                ...makeContentFormCtx(),
                ...optionsCtx,
                campaignId: STORY_CAMPAIGN_ID,
                mode: 'create',
              }}
            />
          </OrganizationAuthoringFormShell>
        </div>
      )}
    </ContentFormOptionsGate>
  )
}

const meta = {
  title: 'Content/Organizations/OrganizationAuthoringFormShell',
  component: OrganizationAuthoringFormShellStory,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof OrganizationAuthoringFormShellStory>

export default meta
type Story = StoryObj<typeof OrganizationAuthoringFormShellStory>

/** Pick a familiar type, then open Practices — recommended ids surface near the top when the query is empty. */
export const Default: Story = {}
