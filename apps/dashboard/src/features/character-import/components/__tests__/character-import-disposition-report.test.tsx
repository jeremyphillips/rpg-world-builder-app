import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { CharacterImportDispositionReport } from '../character-import-disposition-report'

describe('CharacterImportDispositionReport', () => {
  it('lists ignored source fields without unsupported entries', () => {
    render(
      <CharacterImportDispositionReport
        dispositions={[
          {
            sourcePath: 'data.modifiers.class[0]',
            sourceValue: 'intelligence-saving-throws',
            targetPath: 'proficiencies.savingThrows',
            disposition: 'ignored',
            reason: 'resolved-from-local-content',
            message: 'Saving throw proficiencies are resolved from the selected local class.',
          },
        ]}
      />,
    )

    expect(screen.getByText('Ignored source fields')).toBeInTheDocument()
    expect(screen.getByText(/intelligence-saving-throws/)).toBeInTheDocument()
    expect(screen.getByText('Unsupported source fields')).toBeInTheDocument()
    expect(screen.getByText('none')).toBeInTheDocument()
  })
})
