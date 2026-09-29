import type { Meta, StoryObj } from '@storybook/react-vite'

import { OrganizationAuthoringProvider } from '../authoring/organization-authoring-context'
import { OrganizationUseFamiliarTypeAction } from './organization-use-familiar-type-action'

const meta = {
  title: 'Content/Organizations/Edit/UseFamiliarTypeAction',
  component: OrganizationUseFamiliarTypeAction,
  decorators: [
    (Story) => (
      <OrganizationAuthoringProvider>
        <Story />
      </OrganizationAuthoringProvider>
    ),
  ],
} satisfies Meta<typeof OrganizationUseFamiliarTypeAction>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
