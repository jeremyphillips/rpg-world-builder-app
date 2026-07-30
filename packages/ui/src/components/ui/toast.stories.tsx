import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'

import { Button } from './button.client'
import { ToastPresentation } from './toast.client'
import { ToastProvider, toast } from './toast-provider.client'
import { ToastViewport } from './toast-viewport.client'
import { TOAST_TONES } from './toast.constants'

const meta = {
  title: 'Primitives/Toast',
  component: ToastPresentation,
  args: {
    title: 'Character saved',
    tone: 'success',
    dismissible: true,
    onDismiss: fn(),
  },
} satisfies Meta<typeof ToastPresentation>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    tone: 'default',
    title: 'Settings updated',
  },
}

export const Success: Story = {
  args: {
    tone: 'success',
    title: 'Character saved',
  },
}

export const Warning: Story = {
  args: {
    tone: 'warning',
    title: 'Some selections still need attention.',
    description: 'Review highlighted fields before publishing.',
  },
}

export const Destructive: Story = {
  args: {
    tone: 'destructive',
    title: 'Could not save character',
    description: 'Check your connection and try again.',
  },
}

export const WithAction: Story = {
  args: {
    tone: 'destructive',
    title: 'Could not save campaign',
    description: 'Check your connection and try again.',
    action: (
      <Button type="button" variant="outline" size="sm">
        Retry
      </Button>
    ),
  },
}

export const AllTones: Story = {
  render: () => (
    <div className="flex max-w-md flex-col gap-3">
      {TOAST_TONES.map((tone) => (
        <ToastPresentation
          key={tone}
          tone={tone}
          title={`${tone.charAt(0).toUpperCase()}${tone.slice(1)} toast`}
          dismissible
          onDismiss={fn()}
        />
      ))}
    </div>
  ),
}

export const ImperativeDemo: Story = {
  render: () => (
    <ToastProvider
      viewport={
        <ToastViewport className="top-4 right-4 w-[min(100vw-2rem,26.25rem)] min-w-[22.5rem]" />
      }
    >
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => toast.success('Character saved')}>
          Show success
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            toast({
              id: 'demo-warning',
              tone: 'warning',
              title: 'Some selections still need attention.',
            })
          }
        >
          Show warning
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={() =>
            toast.error('Could not save character', {
              action: { label: 'Retry', onClick: fn() },
            })
          }
        >
          Show error
        </Button>
      </div>
    </ToastProvider>
  ),
}
