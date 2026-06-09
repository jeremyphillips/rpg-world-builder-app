import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { FileDropzone } from './file-dropzone.client'

const meta = {
  title: 'Primitives/FileDropzone',
  component: FileDropzone,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div className="w-[480px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FileDropzone>

export default meta

/** Default state — accepts images, single file. */
export const Default: StoryObj = {
  render: () => {
    const [files, setFiles] = useState<File[]>([])
    return <FileDropzone value={files} onChange={setFiles} />
  },
}

/** Accept PDF files only. */
export const AcceptPdf: StoryObj = {
  render: () => {
    const [files, setFiles] = useState<File[]>([])
    return <FileDropzone value={files} onChange={setFiles} accept={['application/pdf']} />
  },
}

/** Multiple files with a cap of 4, max 2 MB each. */
export const MultipleFiles: StoryObj = {
  render: () => {
    const [files, setFiles] = useState<File[]>([])
    return (
      <FileDropzone value={files} onChange={setFiles} multiple maxFiles={4} maxSize={2_097_152} />
    )
  },
}

/** Disabled — no interaction possible. */
export const Disabled: StoryObj = {
  render: () => <FileDropzone value={[]} onChange={() => undefined} disabled />,
}

/** Pre-populated with a mock file. */
export const WithFile: StoryObj = {
  render: () => {
    const mockFile = new File(['(binary)'], 'portrait.jpg', { type: 'image/jpeg' })
    const [files, setFiles] = useState<File[]>([mockFile])
    return <FileDropzone value={files} onChange={setFiles} />
  },
}

/** Remote preview for an already-uploaded image (no local File). */
export const WithExistingImage: StoryObj = {
  render: () => {
    const [files, setFiles] = useState<File[]>([])
    const [cleared, setCleared] = useState(false)
    return (
      <FileDropzone
        value={files}
        onChange={setFiles}
        existingImageUrl={cleared ? undefined : 'https://picsum.photos/seed/rpg-avatar/96/96'}
        existingImageLabel="Current avatar"
        onClearExisting={() => setCleared(true)}
      />
    )
  },
}
