import type { Meta, StoryObj } from '@storybook/react-vite'

import { Text } from './text'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs.client'

const meta = {
  title: 'UI/Tabs',
  component: Tabs,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

export const Line: Story = {
  args: { variant: 'line', defaultValue: 'identity' },
  render: (args) => (
    <Tabs {...args}>
      <TabsList>
        <TabsTrigger value="identity">Identity</TabsTrigger>
        <TabsTrigger value="rules">Rules</TabsTrigger>
        <TabsTrigger value="flavor">Flavor</TabsTrigger>
      </TabsList>
      <TabsContent value="identity">
        <Text variant="small">Identity tab content.</Text>
      </TabsContent>
      <TabsContent value="rules">
        <Text variant="small">Rules tab content.</Text>
      </TabsContent>
      <TabsContent value="flavor">
        <Text variant="small">Flavor tab content.</Text>
      </TabsContent>
    </Tabs>
  ),
}

export const Pill: Story = {
  args: { variant: 'pill', defaultValue: 'identity' },
  render: (args) => (
    <Tabs {...args}>
      <TabsList>
        <TabsTrigger value="identity">Identity</TabsTrigger>
        <TabsTrigger value="rules">Rules</TabsTrigger>
        <TabsTrigger value="flavor">Flavor</TabsTrigger>
      </TabsList>
      <TabsContent value="identity">
        <Text variant="small">Identity tab content.</Text>
      </TabsContent>
      <TabsContent value="rules">
        <Text variant="small">Rules tab content.</Text>
      </TabsContent>
      <TabsContent value="flavor">
        <Text variant="small">Flavor tab content.</Text>
      </TabsContent>
    </Tabs>
  ),
}

export const Disabled: Story = {
  args: { variant: 'line', defaultValue: 'identity' },
  render: (args) => (
    <Tabs {...args}>
      <TabsList>
        <TabsTrigger value="identity">Identity</TabsTrigger>
        <TabsTrigger value="rules" disabled>
          Rules (disabled)
        </TabsTrigger>
        <TabsTrigger value="flavor">Flavor</TabsTrigger>
      </TabsList>
      <TabsContent value="identity">
        <Text variant="small">Only identity is accessible.</Text>
      </TabsContent>
      <TabsContent value="rules">
        <Text variant="small">Rules content.</Text>
      </TabsContent>
      <TabsContent value="flavor">
        <Text variant="small">Flavor content.</Text>
      </TabsContent>
    </Tabs>
  ),
}
