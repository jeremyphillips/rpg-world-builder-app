import type { Meta, StoryObj } from '@storybook/react-vite'
import { Text } from '@rpg/ui'

import {
  DetailCollectionFlushItemStack,
  DetailCollectionFlushItemStackItem,
} from '../detail-collection-flush-item-stack'
import {
  ContentDetailSection,
  ContentDetailSectionItem,
} from '../../../page/content-detail-section'
import { ContentDetailBody } from '../../../page/content-detail-body'

const meta = {
  title: 'Content/Detail/DetailCollectionFlushItemStack',
  component: DetailCollectionFlushItemStack,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DetailCollectionFlushItemStack>

export default meta
type Story = StoryObj<typeof DetailCollectionFlushItemStack>

export const InsideFlushSection: Story = {
  render: () => (
    <ContentDetailBody>
      <ContentDetailSection heading="Traits" headingId="traits-heading" bodyLayout="flush">
        <DetailCollectionFlushItemStack>
          <DetailCollectionFlushItemStackItem>
            <ContentDetailSectionItem id="trait-a" label="Keen Senses">
              <Text as="p" variant="muted">
                Advantage on Perception checks that rely on sight or smell.
              </Text>
            </ContentDetailSectionItem>
          </DetailCollectionFlushItemStackItem>
          <DetailCollectionFlushItemStackItem>
            <ContentDetailSectionItem id="trait-b" label="Fleet of Foot">
              <Text as="p" variant="muted">
                Base walking speed increases by 5 feet.
              </Text>
            </ContentDetailSectionItem>
          </DetailCollectionFlushItemStackItem>
        </DetailCollectionFlushItemStack>
      </ContentDetailSection>
    </ContentDetailBody>
  ),
}
