import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { FileField } from './file-field.client'

const meta = {
  title: 'Primitives/FileField',
  component: FileField,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div className="w-[480px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FileField>

export default meta
/** Default — single image upload with label and hint. */
export const Default: StoryObj = {
  render: () => {
    const [files, setFiles] = useState<File[]>([])
    return (
      <FileField
        id="avatar"
        label="Campaign banner"
        hint="JPEG, PNG, WebP or GIF. Max 5 MB."
        value={files}
        onChange={setFiles}
      />
    )
  },
}

/** Required field with a validation error state. */
export const WithError: StoryObj = {
  render: () => {
    const [files, setFiles] = useState<File[]>([])
    return (
      <FileField
        id="banner-error"
        label="Campaign banner"
        required
        error="A banner image is required."
        value={files}
        onChange={setFiles}
      />
    )
  },
}

/** Multiple files allowed, capped at 3. */
export const MultipleFiles: StoryObj = {
  render: () => {
    const [files, setFiles] = useState<File[]>([])
    return (
      <FileField
        id="gallery"
        label="Gallery images"
        hint="Up to 3 images."
        multiple
        maxFiles={3}
        value={files}
        onChange={setFiles}
      />
    )
  },
}

/** Disabled state. */
export const Disabled: StoryObj = {
  render: () => (
    <FileField
      id="disabled"
      label="Campaign banner"
      hint="Uploads are disabled."
      value={[]}
      onChange={() => undefined}
      disabled
    />
  ),
}
