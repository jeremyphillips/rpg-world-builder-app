import { expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { getContentMediaPolicy } from '@rpg/contracts'
import { MediaImageDetails } from './media-image-details'
import { mediaFixture, mediaFixtureAssets } from '../fixtures'

it('explains why a small image cannot have Portrait without disabling Primary', () => {
  render(
    <MediaImageDetails
      image={mediaFixture.images[0]!}
      asset={{ ...mediaFixtureAssets[0]!, orientedWidth: 64, orientedHeight: 64 }}
      media={{ ...mediaFixture, roles: {} }}
      policy={getContentMediaPolicy('character')}
      onAlt={vi.fn()}
      onRole={vi.fn()}
      onRemove={vi.fn()}
    />,
  )
  expect(screen.getByRole('checkbox', { name: 'Portrait' })).toBeDisabled()
  expect(screen.getByRole('checkbox', { name: 'Primary image' })).toBeEnabled()
  expect(screen.getByText(/Requires at least/)).toHaveTextContent('64 × 64')
})
