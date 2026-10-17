import type { Meta, StoryObj } from '@storybook/react-vite'

import { FormSectionProvider } from '../../form/context/form-section.context'
import {
  FieldRecommendationGroupView,
  FieldRecommendationInline,
} from './field-recommendation.client'

const meta = {
  title: 'UI/FieldRecommendation',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const InlineField: Story = {
  render: () => (
    <FormSectionProvider density="comfortable">
      <FieldRecommendationInline
        recommendation={{
          content: (
            <>
              Recommended for this creature type: <span className="font-body-emphasis">Dragon</span>
            </>
          ),
          action: { label: '+ Add', ariaLabel: 'Add Draconic', onClick: () => undefined },
        }}
      />
    </FormSectionProvider>
  ),
}

export const CollectionGroup: Story = {
  render: () => (
    <FormSectionProvider density="comfortable">
      <FieldRecommendationGroupView
        group={{
          sourceLabel: 'Weapons from selected proficiencies',
          bulkAction: {
            label: 'Add all',
            ariaLabel: 'Add all 3 recommended weapons',
            onClick: () => undefined,
          },
          items: [
            {
              id: 'dagger',
              label: 'Dagger',
              action: { label: '+ Add', ariaLabel: 'Add Dagger', onClick: () => undefined },
            },
            {
              id: 'shortsword',
              label: 'Shortsword',
              action: { label: '+ Add', ariaLabel: 'Add Shortsword', onClick: () => undefined },
            },
            {
              id: 'shortbow',
              label: 'Shortbow',
              action: { label: '+ Add', ariaLabel: 'Add Shortbow', onClick: () => undefined },
            },
          ],
        }}
      />
    </FormSectionProvider>
  ),
}

export const CollectionGroupAboveEmptyState: Story = {
  render: () => (
    <FormSectionProvider density="comfortable">
      <div className="flex max-w-md flex-col gap-2">
        <FieldRecommendationGroupView
          group={{
            sourceLabel: 'Weapons from selected proficiencies',
            items: [
              {
                id: 'dagger',
                label: 'Dagger',
                action: { label: '+ Add', ariaLabel: 'Add Dagger', onClick: () => undefined },
              },
            ],
          }}
        />
        <p className="text-style-caption italic">No equipment added yet.</p>
      </div>
    </FormSectionProvider>
  ),
}

export const CollectionGroupCompact: Story = {
  render: () => (
    <FormSectionProvider density="compact">
      <FieldRecommendationGroupView
        group={{
          sourceLabel: 'Weapons from selected proficiencies',
          items: [
            {
              id: 'dart',
              label: 'Dart',
              action: { label: '+ Add', ariaLabel: 'Add Dart', onClick: () => undefined },
            },
            {
              id: 'flail',
              label: 'Flail',
              action: { label: '+ Add', ariaLabel: 'Add Flail', onClick: () => undefined },
            },
          ],
        }}
      />
    </FormSectionProvider>
  ),
}

export const CollectionGroupNarrowWrap: Story = {
  render: () => (
    <FormSectionProvider density="compact">
      <div className="max-w-[12rem]">
        <FieldRecommendationGroupView
          group={{
            sourceLabel: 'Weapons from selected proficiencies',
            items: [
              {
                id: 'long',
                label: 'Very Long Named Weapon Entry',
                action: {
                  label: '+ Add',
                  ariaLabel: 'Add Very Long Named Weapon Entry',
                  onClick: () => undefined,
                },
              },
              {
                id: 'dagger',
                label: 'Dagger',
                action: { label: '+ Add', ariaLabel: 'Add Dagger', onClick: () => undefined },
              },
            ],
          }}
        />
      </div>
    </FormSectionProvider>
  ),
}
