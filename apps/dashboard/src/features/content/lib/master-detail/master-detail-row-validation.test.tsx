import { Form } from '@rpg/ui/form'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import { traitItemFields } from '@/features/content/species/lib/species-trait-form-fields'
import { makeContentFormCtx } from '@/features/content/lib/fixtures/content-form-ctx'

import { grantRowFormSchema } from '../forms/grants/grant-form-schema'
import {
  masterDetailRowValidationStateLabel,
  useMasterDetailRowValidation,
} from './master-detail-row-validation'

const ctx = makeContentFormCtx()

const traitsSchema = z.object({
  traits: z.array(
    z.object({
      kind: z.literal('grant'),
      grants: z.array(grantRowFormSchema),
    }),
  ),
})

const traitFields = [{ kind: 'array' as const, name: 'traits', fields: traitItemFields(ctx) }]

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
