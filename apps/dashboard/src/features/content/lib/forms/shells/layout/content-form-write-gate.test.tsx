import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
  ContentFormWriteGateProvider,
  useContentFormWriteGateReason,
  useReportContentFormWriteGate,
} from './content-form-write-gate'

function StrictGateReader() {
  return <span data-testid="strict">{useContentFormWriteGateReason('strict') ?? 'none'}</span>
}

function DraftReporter() {
  useReportContentFormWriteGate('draft', 'draft blocked')
  return null
}

function StrictReporter({ reason }: { reason: string | null }) {
  useReportContentFormWriteGate('strict', reason)
  return null
}

describe('ContentFormWriteGateProvider', () => {
  it('scopes strict and draft reasons independently', () => {
    render(
      <ContentFormWriteGateProvider>
        <StrictReporter reason="strict blocked" />
        <DraftReporter />
        <StrictGateReader />
      </ContentFormWriteGateProvider>,
    )
    expect(screen.getByTestId('strict')).toHaveTextContent('strict blocked')
  })

  it('clears a reporter reason on unmount', async () => {
    const user = userEvent.setup()

    function Toggle({ on }: { on: boolean }) {
      return on ? <StrictReporter reason="hold" /> : null
    }

    function Host() {
      const [on, setOn] = useState(true)
      return (
        <ContentFormWriteGateProvider>
          <Toggle on={on} />
          <StrictGateReader />
          <button type="button" onClick={() => setOn(false)}>
            off
          </button>
        </ContentFormWriteGateProvider>
      )
    }

    render(<Host />)
    expect(screen.getByTestId('strict')).toHaveTextContent('hold')
    await user.click(screen.getByRole('button', { name: 'off' }))
    expect(screen.getByTestId('strict')).toHaveTextContent('none')
  })
})
