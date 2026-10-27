import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  ContentDetailQueryStatus,
  formatContentDetailQueryError,
} from '../content-detail-query-status'

describe('formatContentDetailQueryError', () => {
  it('uses the catalog list sentence for a content type', () => {
    expect(formatContentDetailQueryError('classes')).toBe('Could not load classes.')
    expect(formatContentDetailQueryError('skill-proficiencies')).toBe(
      'Could not load skill proficiencies.',
    )
  })

  it('uses the closed map for non-catalog section queries', () => {
    expect(formatContentDetailQueryError('subclasses')).toBe('Could not load subclasses.')
    expect(formatContentDetailQueryError('members')).toBe('Could not load members.')
    expect(formatContentDetailQueryError('location-connections')).toBe(
      'Could not load location connections.',
    )
    expect(formatContentDetailQueryError('connected-parties')).toBe(
      'Could not load connected parties.',
    )
  })

  it('joins a nonempty catalog tuple with or', () => {
    expect(formatContentDetailQueryError(['equipment'])).toBe('Could not load equipment.')
    expect(formatContentDetailQueryError(['equipment', 'skill-proficiencies'])).toBe(
      'Could not load equipment or skill proficiencies.',
    )
  })
})

describe('ContentDetailQueryStatus', () => {
  it('announces initial pending without an alert', () => {
    render(<ContentDetailQueryStatus status="pending" />)

    expect(screen.getByRole('status')).toHaveTextContent('Loading…')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('announces an initial catalog error from the subject key', () => {
    render(<ContentDetailQueryStatus status="error" subject="classes" />)

    expect(screen.getByRole('alert')).toHaveTextContent('Could not load classes.')
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('announces only the catalogs whose initial load failed', () => {
    render(<ContentDetailQueryStatus status="error" subject={['skill-proficiencies']} />)

    expect(screen.getByRole('alert')).toHaveTextContent('Could not load skill proficiencies.')
  })
})
