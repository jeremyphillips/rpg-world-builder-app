import type { Meta, StoryObj } from '@storybook/react-vite'

import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs'

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
        <p className="text-sm text-muted-foreground">Identity tab content.</p>
      </TabsContent>
      <TabsContent value="rules">
        <p className="text-sm text-muted-foreground">Rules tab content.</p>
      </TabsContent>
      <TabsContent value="flavor">
        <p className="text-sm text-muted-foreground">Flavor tab content.</p>
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
        <p className="text-sm text-muted-foreground">Identity tab content.</p>
      </TabsContent>
      <TabsContent value="rules">
        <p className="text-sm text-muted-foreground">Rules tab content.</p>
      </TabsContent>
      <TabsContent value="flavor">
        <p className="text-sm text-muted-foreground">Flavor tab content.</p>
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
        <p className="text-sm text-muted-foreground">Only identity is accessible.</p>
      </TabsContent>
      <TabsContent value="rules">
        <p className="text-sm text-muted-foreground">Rules content.</p>
      </TabsContent>
      <TabsContent value="flavor">
        <p className="text-sm text-muted-foreground">Flavor content.</p>
      </TabsContent>
    </Tabs>
  ),
}
