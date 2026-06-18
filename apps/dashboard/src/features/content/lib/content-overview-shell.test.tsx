import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

import { ContentOverviewShell } from './content-overview-shell'

describe('ContentOverviewShell', () => {
  it('renders the loading state', () => {
    render(
      <ContentOverviewShell heading="Equipment" isPending={true} isError={false}>
        <p>Ready content</p>
      </ContentOverviewShell>,
    )
    expect(screen.getByRole('heading', { name: 'Equipment' })).toBeInTheDocument()
    expect(screen.getByText('Loading equipment…')).toBeInTheDocument()
    expect(screen.queryByText('Ready content')).not.toBeInTheDocument()
  })

  it('renders a custom loading label', () => {
    render(
      <ContentOverviewShell
        heading="Classes"
        isPending={true}
        isError={false}
        loadingLabel="Fetching classes…"
      >
        <p>Ready content</p>
      </ContentOverviewShell>,
    )
    expect(screen.getByText('Fetching classes…')).toBeInTheDocument()
  })

  it('renders the error state with role="alert"', () => {
    render(
      <ContentOverviewShell heading="Equipment" isPending={false} isError={true}>
        <p>Ready content</p>
      </ContentOverviewShell>,
    )
    expect(screen.getByRole('heading', { name: 'Equipment' })).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('Could not load equipment.')
    expect(screen.queryByText('Ready content')).not.toBeInTheDocument()
  })

  it('renders a custom error label', () => {
    render(
      <ContentOverviewShell
        heading="Equipment"
        isPending={false}
        isError={true}
        errorLabel="Something went wrong."
      >
        <p>Ready content</p>
      </ContentOverviewShell>,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong.')
  })

  it('renders the ready state with children', () => {
    render(
      <ContentOverviewShell heading="Equipment" isPending={false} isError={false}>
        <p>Ready content</p>
      </ContentOverviewShell>,
    )
    expect(screen.getByRole('heading', { name: 'Equipment' })).toBeInTheDocument()
    expect(screen.getByText('Ready content')).toBeInTheDocument()
  })
})
