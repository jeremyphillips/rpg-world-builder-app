import type { ComponentProps } from 'react'
import { Button, Input, Text } from '@rpg/ui'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { DrawerShell } from './drawer-shell.client'

const meta = {
  title: 'Layout/DrawerShell',
  component: DrawerShell,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof DrawerShell>

export default meta
type Story = StoryObj<typeof DrawerShell>

function DrawerShellDemo(props: Omit<ComponentProps<typeof DrawerShell>, 'open' | 'onOpenChange'>) {
  const [open, setOpen] = useState(true)

  return (
    <div className="p-8">
      <Button onClick={() => setOpen(true)}>Open drawer</Button>
      <DrawerShell {...props} open={open} onOpenChange={setOpen} />
    </div>
  )
}

export const Default: Story = {
  render: () => (
    <DrawerShellDemo title="Add item">
      <Text variant="muted">Short informational body content.</Text>
    </DrawerShellDemo>
  ),
}

export const LongScrolling: Story = {
  render: () => (
    <DrawerShellDemo
      title="Review details"
      footer={
        <>
          <DrawerShell.Close asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerShell.Close>
          <Button>Confirm</Button>
        </>
      }
    >
      <div className="space-y-4">
        {Array.from({ length: 24 }, (_, index) => (
          <Text key={index}>Scrollable row {index + 1}</Text>
        ))}
      </div>
    </DrawerShellDemo>
  ),
}

export const NoFooter: Story = {
  render: () => (
    <DrawerShellDemo title="Read-only panel">
      <Text variant="muted">Body without a footer region.</Text>
    </DrawerShellDemo>
  ),
}

export const WithDescription: Story = {
  render: () => (
    <DrawerShellDemo
      title="Add creature type"
      description="Custom types appear as Custom in this campaign."
    >
      <div className="space-y-4">
        <Input aria-label="Name" placeholder="Name" />
        <Input aria-label="Id" placeholder="slug-id" />
      </div>
    </DrawerShellDemo>
  ),
}

export const ManagedBody: Story = {
  render: () => (
    <DrawerShellDemo
      title="Managed form body"
      bodyMode="managed"
      footer={
        <>
          <DrawerShell.Close asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerShell.Close>
          <Button>Save</Button>
        </>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="min-h-0 flex-1 overflow-y-auto px-6">
          {Array.from({ length: 18 }, (_, index) => (
            <Text key={index} className="mb-4">
              Managed scroll region row {index + 1}
            </Text>
          ))}
        </div>
        <div className="shrink-0 border-t border-border px-6 py-4">
          <Text variant="destructive" role="alert">
            Could not save item.
          </Text>
        </div>
      </div>
    </DrawerShellDemo>
  ),
}

export const NarrowViewport: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  render: () => (
    <DrawerShellDemo title="Mobile width">
      <Text variant="muted">Right-side sheet capped by application max width.</Text>
    </DrawerShellDemo>
  ),
}
