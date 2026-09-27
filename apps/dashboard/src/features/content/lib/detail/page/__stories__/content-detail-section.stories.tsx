import type { Meta, StoryObj } from '@storybook/react-vite'
import { Text } from '@rpg/ui'

import { ContentDetailBody } from '../content-detail-body'
import { ContentDetailSection, ContentDetailSectionItem } from '../content-detail-section'

const meta = {
  title: 'Content/Detail/ContentDetailSection',
  component: ContentDetailSection,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ContentDetailSection>

export default meta
type Story = StoryObj<typeof ContentDetailSection>

export const ProseSection: Story = {
  render: () => (
    <ContentDetailBody>
      <ContentDetailSection heading="Description" headingId="description-heading">
        <Text as="p" variant="muted">
          Catalog detail sections register with the in-page nav and use faint panel chrome.
        </Text>
      </ContentDetailSection>
    </ContentDetailBody>
  ),
}

export const WithNavLeaves: Story = {
  render: () => (
    <ContentDetailBody>
      <ContentDetailSection heading="Traits" headingId="traits-heading">
        <ContentDetailSectionItem id="trait-darkvision" label="Darkvision">
          <Text as="p" variant="muted">
            See in dim light out to 60 feet.
          </Text>
        </ContentDetailSectionItem>
      </ContentDetailSection>
    </ContentDetailBody>
  ),
}
