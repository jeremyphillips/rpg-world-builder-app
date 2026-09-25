import { expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { getContentMediaPolicy } from '@rpg/contracts'
import { MediaImageDetails } from './media-image-details'
import { mediaFixture, mediaFixtureAssets } from '../fixtures'

const uploadAvailable = {
  kind: 'upload' as const,
  id: mediaFixture.images[0]!.id,
  attachment: mediaFixture.images[0]!,
}

it('explains why a small image cannot have Portrait or Primary', () => {
  render(
    <MediaImageDetails
      selectedAvailable={uploadAvailable}
      availableImages={[uploadAvailable]}
      asset={{ ...mediaFixtureAssets[0]!, orientedWidth: 64, orientedHeight: 64 }}
      media={{ ...mediaFixture, roles: {} }}
      policy={getContentMediaPolicy('character')}
      assignedRoles={[]}
      onAlt={vi.fn()}
      onRole={vi.fn()}
      canRemove
      onRemove={vi.fn()}
    />,
  )
  expect(screen.getByRole('checkbox', { name: 'Portrait' })).toBeDisabled()
  expect(screen.getByRole('checkbox', { name: 'Primary image' })).toBeDisabled()
  expect(screen.getByText(/Portrait needs a 1:1 crop at least/)).toHaveTextContent('64 × 64')
  expect(screen.getByText(/Primary image needs a 4:3 crop at least/)).toHaveTextContent('64 × 64')
})

it('keeps accessibility fields inside a collapsed disclosure by default', () => {
  render(
    <MediaImageDetails
      selectedAvailable={uploadAvailable}
      availableImages={[uploadAvailable]}
      asset={mediaFixtureAssets[0]!}
      media={mediaFixture}
      policy={getContentMediaPolicy('character')}
      assignedRoles={['portrait']}
      onAlt={vi.fn()}
      onRole={vi.fn()}
      canRemove
      onRemove={vi.fn()}
    />,
  )
  expect(screen.getByRole('button', { name: 'Accessibility & details' })).toHaveAttribute(
    'aria-expanded',
    'false',
  )
  expect(screen.queryByLabelText('Image description')).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Accessibility & details' }))
  expect(screen.getByLabelText('Image description')).toBeInTheDocument()
})
