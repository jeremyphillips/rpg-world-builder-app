import { action } from 'storybook/actions'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { Modal } from './modal.client'
import { Button } from './button.client'
import { useModal } from '../../hooks/use-modal'

const meta = {
  title: 'Primitives/Modal',
  component: Modal.Content,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Modal.Content>

export default meta
type Story = StoryObj<typeof meta>

/** Trigger-driven modal with header, body, and footer buttons. */
export const Basic: Story = {
  render: () => (
    <Modal.Root>
      <Modal.Trigger asChild>
        <Button>Open modal</Button>
      </Modal.Trigger>
      <Modal.Content>
        <Modal.Header
          headline="Invite a player"
          description="They'll receive an email with a link to join the campaign."
        />
        <Modal.Body>Players you invite can view and edit shared session notes.</Modal.Body>
        <Modal.Footer>
          <Modal.Close asChild>
            <Button variant="outline">Cancel</Button>
          </Modal.Close>
          <Modal.Close asChild>
            <Button>Send invite</Button>
          </Modal.Close>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  ),
}

/** The `sm` / `md` / `lg` width presets. */
export const Sizes: StoryObj = {
  render: () => (
    <div className="flex gap-2">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Modal.Root key={size}>
          <Modal.Trigger asChild>
            <Button variant="outline">{size}</Button>
          </Modal.Trigger>
          <Modal.Content size={size}>
            <Modal.Header headline={`Size: ${size}`} description="The panel caps at this width." />
            <Modal.Body>Resize the viewport to see the responsive base width.</Modal.Body>
            <Modal.Footer>
              <Modal.Close asChild>
                <Button>Done</Button>
              </Modal.Close>
            </Modal.Footer>
          </Modal.Content>
        </Modal.Root>
      ))}
    </div>
  ),
}

/** Promise-based confirm/cancel driven by `useModal`. */
export const ConfirmCancel: StoryObj = {
  render: () => {
    const modal = useModal()
    return (
      <>
        <Button variant="destructive" onClick={async () => action('result')(await modal.confirm())}>
          Delete campaign
        </Button>
        <Modal.Root open={modal.open} onOpenChange={modal.onOpenChange}>
          <Modal.Content size="sm">
            <Modal.Header headline="Delete campaign?" description="This cannot be undone." />
            <Modal.Body>All sessions and notes will be permanently removed.</Modal.Body>
            <Modal.Footer>
              <Button variant="outline" onClick={modal.handleCancel}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={modal.handleConfirm}>
                Delete
              </Button>
            </Modal.Footer>
          </Modal.Content>
        </Modal.Root>
      </>
    )
  },
}

/** Cannot be dismissed by overlay click or Escape — only the explicit action closes it. */
export const NonDismissable: StoryObj = {
  render: () => (
    <Modal.Root>
      <Modal.Trigger asChild>
        <Button>Start import</Button>
      </Modal.Trigger>
      <Modal.Content closeOnOutsideClick={false} closeOnEscape={false}>
        <Modal.Header
          headline="Importing…"
          description="Don't close this window until it finishes."
        />
        <Modal.Body>Overlay clicks and the Escape key are disabled while this is open.</Modal.Body>
        <Modal.Footer>
          <Modal.Close asChild>
            <Button>Finish</Button>
          </Modal.Close>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  ),
}

/** Long body content scrolls inside the height-capped panel; header/footer stay pinned. */
export const LongContent: StoryObj = {
  render: () => (
    <Modal.Root>
      <Modal.Trigger asChild>
        <Button>Open changelog</Button>
      </Modal.Trigger>
      <Modal.Content>
        <Modal.Header headline="Changelog" description="Everything new in this release." />
        <Modal.Body>
          {Array.from({ length: 30 }, (_, i) => (
            <p key={i} className="mb-3">
              Entry {i + 1}: a notable change shipped in this version of the world builder.
            </p>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Modal.Close asChild>
            <Button>Close</Button>
          </Modal.Close>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  ),
}
