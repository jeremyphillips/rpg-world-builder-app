import { expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MediaManager } from './media-manager'
import { mediaFixture, mediaFixtureAssets } from '../fixtures'

it('switches presentations on a shared source without changing role assignments', () => {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MediaManager
        open
        onOpenChange={vi.fn()}
        domain="character"
        value={{
          ...mediaFixture,
          roles: { primary: { imageId: 'image-0' }, portrait: { imageId: 'image-0' } },
        }}
        scope={{ kind: 'user-pc', userId: 'demo' }}
        initialAssets={mediaFixtureAssets}
        mode="form"
        onSave={vi.fn()}
      />
    </QueryClientProvider>,
  )
  expect(screen.getByLabelText('Zoom')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Primary image' }))
  expect(screen.queryByLabelText('Zoom')).not.toBeInTheDocument()
  expect(screen.getByRole('checkbox', { name: 'Portrait' })).toBeChecked()
  expect(screen.getByRole('checkbox', { name: 'Primary image' })).toBeChecked()
  expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled()
})
