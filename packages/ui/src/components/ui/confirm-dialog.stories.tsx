import { useState } from 'react'
import { action } from 'storybook/actions'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { ConfirmDialog } from './confirm-dialog.client'
import { Button } from './button.client'

const meta = {
  title: 'Primitives/ConfirmDialog',
  component: ConfirmDialog,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ConfirmDialog>

export default meta

/** A neutral confirmation. Outside clicks do not dismiss it (alertdialog semantics). */
export const Default: StoryObj = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Publish</Button>
        <ConfirmDialog
          open={open}
          onOpenChange={setOpen}
          headline="Publish this world?"
          description="Players will be able to see it immediately."
          confirmLabel="Publish"
          onConfirm={action('confirm')}
          onCancel={action('cancel')}
        />
      </>
    )
  },
}

/** A destructive confirmation uses the `destructive` confirm variant. */
export const Destructive: StoryObj = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button variant="destructive" onClick={() => setOpen(true)}>
          Delete campaign
        </Button>
        <ConfirmDialog
          open={open}
          onOpenChange={setOpen}
          headline="Delete campaign?"
          description="This cannot be undone."
          confirmLabel="Delete"
          confirmVariant="destructive"
          onConfirm={action('confirm')}
          onCancel={action('cancel')}
        />
      </>
    )
  },
}
