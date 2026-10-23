import type { Meta, StoryObj } from '@storybook/react-vite'

import { ClassReferenceTable } from '../../stories/semantic-classes/class-reference-table'
import { Text } from './text'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs.client'
import { TABS_CLASS_SPECS } from './tabs.variants'

const meta = {
  title: 'UI/Tabs',
  component: Tabs,
  parameters: { layout: 'padded', semanticClasses: true },
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

const tabPanels = (
  <>
    <TabsContent value="identity">
      <Text variant="supporting">Identity tab content.</Text>
    </TabsContent>
    <TabsContent value="rules">
      <Text variant="supporting">Rules tab content.</Text>
    </TabsContent>
    <TabsContent value="flavor">
      <Text variant="supporting">Flavor tab content.</Text>
    </TabsContent>
  </>
)

export const Line: Story = {
  args: { variant: 'line', defaultValue: 'identity' },
  render: (args) => (
    <Tabs {...args}>
      <TabsList>
        <TabsTrigger value="identity">Identity</TabsTrigger>
        <TabsTrigger value="rules">Rules</TabsTrigger>
        <TabsTrigger value="flavor">Flavor</TabsTrigger>
      </TabsList>
      {tabPanels}
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
      {tabPanels}
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
        <Text variant="supporting">Only identity is accessible.</Text>
      </TabsContent>
      <TabsContent value="rules">
        <Text variant="supporting">Rules content.</Text>
      </TabsContent>
      <TabsContent value="flavor">
        <Text variant="supporting">Flavor content.</Text>
      </TabsContent>
    </Tabs>
  ),
}

export const ClassReference: Story = {
  tags: ['control-parity'],
  render: () => (
    <ClassReferenceTable
      rows={TABS_CLASS_SPECS.map((spec) => ({
        key: spec.key,
        sample: (
          <Tabs
            data-semantic-class-target
            variant={spec.key}
            defaultValue="demo"
            className="max-w-md"
          >
            <TabsList>
              <TabsTrigger value="demo">{spec.useCase}</TabsTrigger>
            </TabsList>
          </Tabs>
        ),
        propsLabel: spec.key,
        className: `${spec.listClassName} + ${spec.triggerClassName}`,
        keyValues: spec.keyValues,
        useCase: spec.useCase,
      }))}
    />
  ),
}
