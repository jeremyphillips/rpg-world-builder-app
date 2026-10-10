import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import * as React from 'react'

import { SemanticClassCaption } from './semantic-class-caption.client'

describe('SemanticClassCaption', () => {
  it('updates when the target class attribute changes', async () => {
    function Harness() {
      const ref = React.useRef<HTMLButtonElement>(null)
      const [cls, setCls] = React.useState('ui-button ui-button--md')

      return (
        <div>
          <button
            ref={ref}
            type="button"
            className={cls}
            onClick={() => setCls('ui-button ui-button--sm')}
          >
            Toggle
          </button>
          <SemanticClassCaption targetRef={ref} />
        </div>
      )
    }

    render(<Harness />)
    expect(screen.getByTestId('semantic-class-caption')).toHaveTextContent(
      'ui-button ui-button--md',
    )

    await userEvent.click(screen.getByRole('button', { name: 'Toggle' }))
    await waitFor(() => {
      expect(screen.getByTestId('semantic-class-caption')).toHaveTextContent(
        'ui-button ui-button--sm',
      )
    })
  })
})
