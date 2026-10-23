/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { MetadataList } from './metadata-list'

describe('MetadataList', () => {
  it('aligns labels and values without colons', () => {
    const { container } = render(
      <MetadataList
        items={[
          { label: 'Level', value: '1st' },
          { label: 'School', value: 'Enchantment' },
        ]}
      />,
    )

    expect(screen.getByText('Level').tagName).toBe('DT')
    expect(screen.getByText('1st').tagName).toBe('DD')
    const list = screen.getByText('Level').closest('dl')
    expect(list).toHaveClass(
      'ui-metadata-list',
      'ui-metadata-list--default',
      'ui-metadata-list--gap-md',
      'ui-metadata-list--track-content',
      'ui-metadata-list--emphasis-label',
      'ui-metadata-list--ruled',
      'ui-border--subtle',
    )
    expect(screen.getByText('Level')).toHaveClass('ui-metadata-list__label')
    expect(screen.getByText('1st')).toHaveClass('ui-metadata-list__value')
    expect(screen.getByText('1st')).not.toHaveClass('text-right')
    expect(container).not.toHaveTextContent('Level:')
    expect(container).not.toHaveTextContent('School:')
    expect(
      [...(list?.children ?? [])].every(
        (child) => child.tagName === 'DT' || child.tagName === 'DD',
      ),
    ).toBe(true)
  })

  it('forwards aria-labelledby and keeps links and stacked copy inside one dd', () => {
    render(
      <MetadataList
        aria-labelledby="file-heading"
        divider={false}
        emphasis="value"
        valueTrack="fill"
        items={[
          {
            label: 'Campaigns',
            value: <a href="/campaigns">View campaigns</a>,
          },
          {
            label: 'Invitations',
            value: (
              <span className="flex flex-col">
                <span>Pending: 1</span>
                <span>Accepted, incomplete: 2</span>
              </span>
            ),
          },
        ]}
      />,
    )

    const list = screen.getByText('Campaigns').closest('dl')
    expect(list).toHaveAttribute('aria-labelledby', 'file-heading')
    expect(list).not.toHaveClass('ui-metadata-list--ruled')
    expect(list).toHaveClass('ui-metadata-list--emphasis-value', 'ui-metadata-list--track-fill')

    const link = screen.getByRole('link', { name: 'View campaigns' })
    expect(link.closest('dd')?.tagName).toBe('DD')
    expect(link.parentElement?.tagName).toBe('DD')

    const invitations = screen.getByText('Pending: 1').closest('dd')
    expect(invitations).toHaveTextContent('Accepted, incomplete: 2')
    expect(invitations?.parentElement?.tagName).toBe('DL')
  })
})
