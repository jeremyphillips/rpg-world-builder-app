import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { FormProvider, useForm } from 'react-hook-form'
import { Button } from '@rpg/ui'
import type { FormItem } from '@rpg/ui/form'
import {
  FormUiProvider,
  FormStickyScrollBody,
  formStickyScrollShellWithDockedFooterClasses,
} from '@rpg/ui/form'

import { CLASS_FEATURE_MASTER_DETAIL_ITEM_NOUN } from '../../../classes/lib/class-feature-form-labels'
import { FormEmbeddedMasterDetailEditor } from '../form-embedded-master-detail-editor'

const NAME_PATH = 'features.0.name'
const NAME_ERROR = 'Enter a feature name.'

const itemFields: FormItem[] = [{ type: 'text', name: 'name', label: 'Name', required: true }]

const tallItemFields = Array.from({ length: 12 }, (_, index) => ({
  type: 'text' as const,
  name: `field${index}`,
  label: `Detail field ${index + 1}`,
  required: true,
}))

type FeatureRow = { id?: string; name?: string; level?: number }

function EditorStory({
  features = [] as FeatureRow[],
  entityCatalogLayer,
  fields = itemFields,
  fieldError,
}: {
  features?: FeatureRow[]
  entityCatalogLayer?: 'system' | 'homebrew'
  fields?: FormItem[]
  fieldError?: string
}) {
  const [showFieldError, setShowFieldError] = useState(false)
  const form = useForm({ defaultValues: { features } })
  return (
    <FormProvider {...form}>
      <FormUiProvider
        publishPresentationEnabled={Boolean(fieldError)}
        hasAttemptedPublish={showFieldError}
        publishPresentationIssues={
          showFieldError && fieldError
            ? [
                {
                  path: NAME_PATH,
                  message: fieldError,
                  severity: 'field',
                  claim: { kind: 'field', target: NAME_PATH },
                },
              ]
            : []
        }
      >
        <FormEmbeddedMasterDetailEditor
          formCtx={{ entityCatalogLayer }}
          fieldName="features"
          itemFields={fields}
          itemNoun={CLASS_FEATURE_MASTER_DETAIL_ITEM_NOUN}
          listTitle="Features"
          ariaLabel="Features"
          addLabel="Add feature"
          idPrefix="class-feature"
          mapListItem={({ row }) => {
            const feature = row as FeatureRow | undefined
            const name = typeof feature?.name === 'string' ? feature.name.trim() : ''
            return {
              title: name,
              eyebrow: feature?.level !== undefined ? `Level ${feature.level}` : undefined,
            }
          }}
        />
        {fieldError ? (
          <Button
            type="button"
            onClick={() => {
              setShowFieldError(true)
              form.setFocus(NAME_PATH)
            }}
          >
            Show field error
          </Button>
        ) : null}
      </FormUiProvider>
    </FormProvider>
  )
}

const longFeatures = Array.from({ length: 20 }, (_, index) => ({
  id: `f${index}`,
  name: `Feature ${index + 1}`,
  level: index + 1,
}))

const meta = {
  title: 'Content/FormEmbeddedMasterDetailEditor',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj

export const Empty: Story = {
  render: () => <EditorStory />,
}

export const WithRows: Story = {
  render: () => (
    <EditorStory
      features={[
        { id: 'f1', name: 'Rage', level: 1 },
        { id: 'f2', name: 'Reckless Attack', level: 2 },
      ]}
    />
  ),
}

export const WithFieldError: Story = {
  render: () => <EditorStory features={[{ id: 'f1', name: '' }]} fieldError={NAME_ERROR} />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Show field error' }))
    const field = canvas.getByRole('textbox', { name: 'Name' })
    await expect(field).toHaveFocus()
    await expect(field).toHaveAttribute('aria-invalid', 'true')
    await expect(field).toHaveAccessibleDescription(NAME_ERROR)
  },
}

export const LongCollection: Story = {
  render: () => <EditorStory features={longFeatures} />,
}

export const ConstrainedViewport: Story = {
  render: () => (
    <div className="h-64 [--master-detail-list-max-block-size:12rem]">
      <EditorStory features={longFeatures} />
    </div>
  ),
}

export const WithStickyFormFooter: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="flex h-[32rem] min-h-0 flex-col overflow-hidden bg-background">
      <div className={formStickyScrollShellWithDockedFooterClasses}>
        <FormStickyScrollBody>
          <div className="p-6">
            <div className="ui-form-sticky-tabs mb-4 flex h-[var(--rpg-form-sticky-tabs-block-size,3rem)] items-center rounded-md border border-border px-3 text-style-supporting">
              Dummy section tabs
            </div>
            <EditorStory features={longFeatures} />
          </div>
        </FormStickyScrollBody>
        <div className="ui-form-actions-bar ui-form-actions-bar--docked">
          <div className="flex justify-end px-6">
            <Button type="button">Save changes</Button>
          </div>
        </div>
      </div>
    </div>
  ),
}

export const TallerDetailThanRail: Story = {
  render: () => (
    <EditorStory
      fields={tallItemFields}
      features={[
        { id: 'f1', name: 'Rage', level: 1 },
        { id: 'f2', name: 'Reckless Attack', level: 2 },
      ]}
    />
  ),
}

export const SystemLocked: Story = {
  render: () => (
    <EditorStory
      entityCatalogLayer="system"
      features={[
        { id: 'f1', name: 'Rage', level: 1 },
        { id: 'f2', name: 'Reckless Attack', level: 2 },
      ]}
    />
  ),
}
