import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { FileDropzone } from './file-dropzone.client'

function makeFile(name: string, type: string, size = 1024): File {
  const file = new File(['x'.repeat(size)], name, { type })
  return file
}

function getDropRegion() {
  const browse = screen.queryByRole('button', { name: /browse files/i })
  if (browse) return browse.closest('div[class*="border-dashed"]')!
  return screen.getByText(/drop to upload/i).closest('div[class*="border-dashed"]')!
}

describe('FileDropzone', () => {
  it('renders browse files and singular image copy by default', () => {
    render(<FileDropzone value={[]} onChange={() => undefined} />)
    expect(screen.getByRole('button', { name: /browse files/i })).toBeInTheDocument()
    expect(screen.getByText('Add an image')).toBeInTheDocument()
    expect(screen.getByText(/Drag and drop an image here, or choose a file/i)).toBeInTheDocument()
  })

  it('uses plural image copy when multiple is enabled', () => {
    render(
      <FileDropzone
        value={[]}
        onChange={() => undefined}
        multiple
        accept={['image/jpeg', 'image/png', 'image/webp', 'image/gif']}
      />,
    )
    expect(screen.getByText('Add images')).toBeInTheDocument()
    expect(screen.getByText(/Drag and drop images here, or choose files/i)).toBeInTheDocument()
  })

  it('builds the requirement line from accept and maxSize', () => {
    render(
      <FileDropzone
        value={[]}
        onChange={() => undefined}
        accept={['image/png', 'image/jpeg', 'image/webp', 'image/gif']}
        maxSize={20_971_520}
      />,
    )
    expect(screen.getByText('PNG, JPG, WEBP, or GIF · Max 20 MB')).toBeInTheDocument()
  })

  it('omits the size clause when maxSize is unset', () => {
    render(
      <FileDropzone value={[]} onChange={() => undefined} accept={['image/jpeg', 'image/png']} />,
    )
    expect(screen.getByText('JPG or PNG')).toBeInTheDocument()
    expect(screen.queryByText(/Max/i)).not.toBeInTheDocument()
  })

  it('is disabled when the disabled prop is set', () => {
    render(<FileDropzone value={[]} onChange={() => undefined} disabled />)
    expect(screen.getByRole('button', { name: /browse files/i })).toBeDisabled()
  })

  it('calls onChange when a valid file is dropped on the drop region', () => {
    const onChange = vi.fn()
    render(<FileDropzone value={[]} onChange={onChange} accept={['image/jpeg']} />)
    const file = makeFile('photo.jpg', 'image/jpeg')
    const dataTransfer = { files: [file] } as unknown as DataTransfer

    fireEvent.dragOver(getDropRegion())
    fireEvent.drop(getDropRegion(), { dataTransfer })

    expect(onChange).toHaveBeenCalledWith([file])
  })

  it('does not accept drops when dropTarget is false', () => {
    const onChange = vi.fn()
    render(
      <FileDropzone value={[]} onChange={onChange} accept={['image/jpeg']} dropTarget={false} />,
    )
    const file = makeFile('photo.jpg', 'image/jpeg')
    fireEvent.drop(getDropRegion(), { dataTransfer: { files: [file] } })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('shows an error and does not call onChange for a rejected MIME type', () => {
    const onChange = vi.fn()
    render(<FileDropzone value={[]} onChange={onChange} accept={['image/jpeg']} />)
    const file = makeFile('script.exe', 'application/octet-stream')

    fireEvent.drop(getDropRegion(), { dataTransfer: { files: [file] } })

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent(/not an accepted file type/i)
  })

  it('shows an error and does not call onChange when the file exceeds maxSize', () => {
    const onChange = vi.fn()
    render(<FileDropzone value={[]} onChange={onChange} accept={['image/jpeg']} maxSize={500} />)
    const file = makeFile('big.jpg', 'image/jpeg', 1024)
    fireEvent.drop(getDropRegion(), { dataTransfer: { files: [file] } })

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent(/exceeds/i)
  })

  it('removes a file when the remove button is clicked', async () => {
    const user = userEvent.setup()
    const file = makeFile('avatar.png', 'image/png')
    const onChange = vi.fn()

    render(<FileDropzone value={[file]} onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: /remove avatar\.png/i }))
    expect(onChange).toHaveBeenCalledWith([])
  })

  it('lists selected files in the file list', () => {
    const file = makeFile('banner.webp', 'image/webp')
    render(<FileDropzone value={[file]} onChange={() => undefined} />)
    expect(screen.getByRole('list', { name: /selected files/i })).toBeInTheDocument()
    expect(screen.getByText('banner.webp')).toBeInTheDocument()
  })

  it('renders a remote preview when existingImageUrl is set and value is empty', () => {
    render(
      <FileDropzone
        value={[]}
        onChange={() => undefined}
        existingImageUrl="/api/uploads/avatar.png"
        existingImageLabel="Current avatar"
      />,
    )
    const img = screen.getByRole('img', { name: 'Current avatar' })
    expect(img).toHaveAttribute('src', '/api/uploads/avatar.png')
    expect(screen.getByText('Current avatar')).toBeInTheDocument()
  })

  it('calls onClearExisting when the remote preview remove button is clicked', async () => {
    const user = userEvent.setup()
    const onClearExisting = vi.fn()
    render(
      <FileDropzone
        value={[]}
        onChange={() => undefined}
        existingImageUrl="/api/uploads/banner.jpg"
        existingImageLabel="Saved banner"
        onClearExisting={onClearExisting}
      />,
    )
    await user.click(screen.getByRole('button', { name: /remove saved banner/i }))
    expect(onClearExisting).toHaveBeenCalledTimes(1)
  })

  it('prefers newly selected files over the remote preview', () => {
    const file = makeFile('new.png', 'image/png')
    render(
      <FileDropzone
        value={[file]}
        onChange={() => undefined}
        existingImageUrl="/api/uploads/old.png"
        existingImageLabel="Old image"
      />,
    )
    expect(screen.getByText('new.png')).toBeInTheDocument()
    expect(screen.queryByText('Old image')).not.toBeInTheDocument()
  })

  it('applies comfortable density classes when requested', () => {
    render(
      <FileDropzone
        value={[]}
        onChange={() => undefined}
        density="comfortable"
        className="h-full"
      />,
    )
    expect(getDropRegion()).toHaveClass('bg-sunken')
    expect(getDropRegion()).toHaveClass('min-h-48')
  })

  itAxe('has no axe accessibility violations (empty state)', async () => {
    const { container } = render(<FileDropzone value={[]} onChange={() => undefined} />)
    await expectNoAxeViolations(container)
  })

  itAxe('has no axe accessibility violations (with files)', async () => {
    const file = makeFile('hero.jpg', 'image/jpeg')
    const { container } = render(<FileDropzone value={[file]} onChange={() => undefined} />)
    await expectNoAxeViolations(container)
  })

  itAxe('has no axe violations in disabled state', async () => {
    const { container } = render(<FileDropzone value={[]} onChange={() => undefined} disabled />)
    await expectNoAxeViolations(container)
  })
})
