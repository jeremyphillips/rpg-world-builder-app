import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  ProgressionTierSeparatorGridBand,
  ProgressionTierSeparatorTableRow,
} from './progression-tier-separator'
import { progressionTierSeparatorLabelVariants } from './progression-tier-separator.variants'

describe('ProgressionTierSeparator', () => {
  it('renders preview table separator with tier suffix', () => {
    render(
      <table>
        <tbody>
          <ProgressionTierSeparatorTableRow
            colSpan={3}
            label="Epic Destiny Tier"
            variant="preview"
          />
        </tbody>
      </table>,
    )

    expect(screen.getByText('Epic Destiny Tier')).toHaveClass(
      progressionTierSeparatorLabelVariants({ variant: 'preview' }),
    )
  })

  it('renders values grid band without tier suffix and subtle styling', () => {
    render(<ProgressionTierSeparatorGridBand tierName="Epic Destiny" />)

    expect(screen.getByText('Epic Destiny')).toHaveClass(
      progressionTierSeparatorLabelVariants({ variant: 'values' }),
    )
  })
})
