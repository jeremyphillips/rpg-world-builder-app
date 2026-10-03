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
      'w-full',
      'gap-x-6',
      'gap-y-1.5',
      'border-b',
      'border-border-subtle',
      'pb-4',
    )
    expect(screen.getByText('1st')).toHaveClass('text-left')
    expect(screen.getByText('1st')).not.toHaveClass('text-right')
    expect(container).not.toHaveTextContent('Level:')
    expect(container).not.toHaveTextContent('School:')
  })
})
