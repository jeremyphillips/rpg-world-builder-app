/**
 * @vitest-environment jsdom
 *
 * Production entry: SubclassDetailEditor + useRunnerFormSubmit ProducerBoundary session.
 */
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { QueryClientProvider } from '@tanstack/react-query'
import { useRef } from 'react'

import { makeTestQueryClient } from '@/test/render'
import { makeContentFormCtx, TEST_CAMPAIGN_ID } from '../../lib/fixtures/content-form-ctx'
import { SubclassDetailEditor } from '../components/subclasses/subclass-detail-editor'
import { subclassCreateDefaultValues } from './subclasses/subclass-form-values'
import type { SubclassFormValues } from './subclasses/subclass-form-fields'

beforeAll(() => {
  if (!HTMLElement.prototype.hasPointerCapture) {
    HTMLElement.prototype.hasPointerCapture = () => false
    HTMLElement.prototype.setPointerCapture = () => {}
    HTMLElement.prototype.releasePointerCapture = () => {}
  }
  if (!HTMLElement.prototype.scrollIntoView) {
    HTMLElement.prototype.scrollIntoView = () => {}
  }
})

vi.mock('../../lib/campaign-access/campaign-access-form-state', () => ({
  useCampaignAccessForm: () => ({
    isDirty: false,
  }),
}))

vi.mock('../components/subclasses/subclass-editor-campaign-access-field', () => ({
  SubclassEditorCampaignAccessField: () => null,
}))

vi.mock('../components/subclasses/subclass-usage-references-section', () => ({
  SubclassUsageReferencesSection: () => null,
}))

describe('subclass edit invalid submit', () => {
  it('blocks persist and surfaces body validation through isolated ProducerBoundary session', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    const formCtx = makeContentFormCtx({ mode: 'edit' })
    const defaultValues: SubclassFormValues = {
      ...subclassCreateDefaultValues(),
      name: '',
    }

    function Harness() {
      const campaignAccessDialogRef = useRef<HTMLDivElement>(null)
      return (
        <QueryClientProvider client={makeTestQueryClient()}>
          <SubclassDetailEditor
            subclassId="draft-subclass-batch-b"
            classId="srd-cc-5.2.1:fighter"
            campaignId={formCtx.campaignId ?? TEST_CAMPAIGN_ID}
            defaultValues={defaultValues}
            formCtx={formCtx}
            campaignAccessDialogRef={campaignAccessDialogRef}
            onValuesChange={() => undefined}
            onAvailabilityChange={() => undefined}
            onSave={onSave}
          />
        </QueryClientProvider>
      )
    }

    render(<Harness />)

    await user.click(screen.getByRole('button', { name: 'Save subclass' }))

    await waitFor(() => {
      expect(onSave).not.toHaveBeenCalled()
    })

    const nameInput = screen.getByRole('textbox', { name: /^name$/i })
    expect(nameInput).toHaveAttribute('aria-invalid', 'true')
  })
})
