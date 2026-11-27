import {
  createEmptyFormValidationProducerSession,
  Form,
  FormValidationProducerProvider,
  replaceFormValidationProducerSlot,
} from '@rpg/ui/form'
import type { ReactNode } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import { traitItemFields } from '@/features/content/species/lib/species-trait-form-fields'
import { makeContentFormCtx } from '@/features/content/lib/fixtures/content-form-ctx'

import { grantRowFormSchema } from '../forms/grants/grant-form-schema'
import {
  countMasterDetailRowsWithIssues,
  masterDetailRowValidationStateLabel,
  useMasterDetailRowValidation,
} from './master-detail-row-validation'

const ctx = makeContentFormCtx()

const traitsSchema = z.object({
  traits: z.array(
    z.object({
      grants: z.array(grantRowFormSchema),
    }),
  ),
})

const traitFields = [{ kind: 'array' as const, name: 'traits', fields: traitItemFields(ctx) }]

const rowIssueSession = replaceFormValidationProducerSlot(
  createEmptyFormValidationProducerSession(),
  'interactive',
  1,
  [
    {
      path: 'traits.0.grants.0.weaponProficiencySlugs',
      message: 'Choose a weapon.',
      severity: 'field',
    },
  ],
)

function RowIssueBoundary({ children }: { children: ReactNode }) {
  return (
    <FormValidationProducerProvider session={rowIssueSession} stamp={1}>
      {children}
    </FormValidationProducerProvider>
  )
}

function RowIssueCountProbe() {
  const { getRowIssueCount } = useMasterDetailRowValidation('traits', traitItemFields(ctx))
  return <div data-testid="row-issue-count">{getRowIssueCount(0)}</div>
}

describe('masterDetailRowValidationStateLabel', () => {
  it('uses singular copy for one issue', () => {
    expect(masterDetailRowValidationStateLabel(1)).toBe('1 validation issue')
  })

  it('uses plural copy for multiple issues', () => {
    expect(masterDetailRowValidationStateLabel(2)).toBe('2 validation issues')
  })
})

describe('countMasterDetailRowsWithIssues', () => {
  it('counts availability-hidden rows in the collection summary', () => {
    const rows = [{ item: { issueCount: 0 } }, { item: { issueCount: 2 } }]
    expect(countMasterDetailRowsWithIssues(rows)).toBe(1)
    expect(countMasterDetailRowsWithIssues(rows, false)).toBe(0)
  })
})

describe('useMasterDetailRowValidation', () => {
  it('returns zero counts until submit presentation activates', () => {
    render(
      <Form
        schema={traitsSchema}
        fields={traitFields}
        defaultValues={{
          traits: [
            {
              kind: 'grant',
              grants: [
                {
                  grantType: 'weaponProficiency',
                  proficiencySource: 'specific',
                  weaponProficiencySlugs: [],
                },
              ],
            },
          ],
        }}
        onSubmit={vi.fn()}
        footer={<RowIssueCountProbe />}
      />,
    )

    expect(screen.getByTestId('row-issue-count')).toHaveTextContent('0')
  })

  it('counts unique presentation paths under each row prefix after submit', async () => {
    const user = userEvent.setup()

    render(
      <Form
        schema={traitsSchema}
        fields={traitFields}
        producerBoundary={RowIssueBoundary}
        defaultValues={{
          traits: [
            {
              kind: 'grant',
              grants: [
                {
                  grantType: 'weaponProficiency',
                  proficiencySource: 'specific',
                  weaponProficiencySlugs: [],
                },
              ],
            },
          ],
        }}
        onSubmit={vi.fn()}
        footer={
          <>
            <RowIssueCountProbe />
            <button type="submit">Save</button>
          </>
        }
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(Number(screen.getByTestId('row-issue-count').textContent)).toBeGreaterThan(0)
    })
  })
})
