import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

import type { GeneratedName } from '@rpg/contracts/name-generator'

import { NameGeneratorResultRow } from './name-generator-result-row.client'

const FIXTURE_RESULT: GeneratedName = {
  value: 'Aelar Galanodel',
  conventionId: 'elvish-personal',
  structureId: 'full',
  parts: {
    given: 'Aelar',
    family: 'Galanodel',
  },
}

describe('NameGeneratorResultRow', () => {
  const writeText = vi.fn().mockResolvedValue(undefined)

  beforeEach(() => {
    writeText.mockClear()
    vi.stubGlobal('navigator', {
      ...navigator,
      clipboard: { writeText },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('copies the generated name and announces success', async () => {
    render(<NameGeneratorResultRow result={FIXTURE_RESULT} rowKey="row-1" />)

    fireEvent.click(screen.getByRole('button', { name: 'Copy Aelar Galanodel' }))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith('Aelar Galanodel')
    })

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Copied Aelar Galanodel')
    })
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(<NameGeneratorResultRow result={FIXTURE_RESULT} rowKey="row-1" />)

    await expectNoAxeViolations(container)
  })
})
