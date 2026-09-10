import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ContentPreviewCompactTrigger } from './content-preview-rail'
import { ContentPreviewUiProvider, useContentPreviewUi } from './content-preview-ui-context'

function SheetOpenProbe() {
  const { sheetOpen } = useContentPreviewUi()
  return <span data-testid="sheet-open">{String(sheetOpen)}</span>
}

describe('ContentPreviewCompactTrigger', () => {
  it('is hidden from the 2xl persistent-rail breakpoint and opens the sheet host', async () => {
    const user = userEvent.setup()

    render(
      <ContentPreviewUiProvider>
        <ContentPreviewCompactTrigger />
        <SheetOpenProbe />
      </ContentPreviewUiProvider>,
    )

    const trigger = screen.getByRole('button', { name: 'Preview' })
    expect(trigger).toHaveClass('2xl:hidden')
    expect(screen.getByTestId('sheet-open')).toHaveTextContent('false')

    await user.click(trigger)
    expect(screen.getByTestId('sheet-open')).toHaveTextContent('true')
  })
})
