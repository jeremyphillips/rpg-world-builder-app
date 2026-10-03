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

/** Overwrite confirmations use the `warning` confirm variant (not entity deletion). */
export const Warning: StoryObj = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button variant="outline" onClick={() => setOpen(true)}>
          Replace fields
        </Button>
        <ConfirmDialog
          open={open}
          onOpenChange={setOpen}
          headline="Apply preset values?"
          description="This replaces unsaved field values."
          confirmLabel="Apply preset"
          confirmVariant="warning"
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

/** Block body content (lists) goes in `children`, rendered after the description. */
export const WithBody: StoryObj = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Create</Button>
        <ConfirmDialog
          open={open}
          onOpenChange={setOpen}
          headline="Create with warnings?"
          description="This build has warnings you may want to review before creating it."
          confirmLabel="Create character anyway"
          cancelLabel="Go back"
          onConfirm={action('confirm')}
          onCancel={action('cancel')}
        >
          <ul className="list-disc pl-5">
            <li>Greatsword — Not proficient with this weapon</li>
          </ul>
        </ConfirmDialog>
      </>
    )
  },
}
