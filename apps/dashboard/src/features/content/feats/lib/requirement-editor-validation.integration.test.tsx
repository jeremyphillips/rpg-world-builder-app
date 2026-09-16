/**
 * @vitest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  Form,
  resolveFieldErrorMessage,
  resolveNestedFieldErrorMessage,
  safeParseWithFieldErrors,
} from '@rpg/ui/form'
import { describe, expect, it } from 'vitest'

import { buildFeatFields, createFeatFormSchema } from './feat-form-fields'
import { newRequirementGroup } from './requirement-editor-form-schema'
import { featCreateDefaultValues } from './feat-form-values'

describe('feat prerequisite editor validation integration', () => {
  it('shows condition type copy on publish submit with full feat field tree', async () => {
    const user = userEvent.setup()
    const ctx = { campaignId: 'campaign-1', mode: 'create' as const, options: {} }
    const typePath = 'prerequisiteEditor.groups.0.requirements.0.type'

    render(
      <Form
        schema={createFeatFormSchema()}
        fields={buildFeatFields(ctx)}
        defaultValues={{
          ...featCreateDefaultValues,
          name: 'Test Feat',
          category: 'general',
          prerequisiteEditor: { groups: [newRequirementGroup()] },
        }}
        onSubmit={() => undefined}
        footer={(form) => {
          const parsed = safeParseWithFieldErrors(
            createFeatFormSchema(),
            form.getValues(),
            buildFeatFields(ctx),
          )
          return (
            <>
              <div data-testid="values-probe">
                {JSON.stringify(form.getValues('prerequisiteEditor'))}
              </div>
              <div data-testid="parse-probe">
                {parsed.success ? 'ok' : parsed.error.issues.length.toString()}
              </div>
              <div data-testid="error-probe">
                {resolveFieldErrorMessage(
                  resolveNestedFieldErrorMessage(form.formState.errors, typePath),
                ) ?? 'none'}
              </div>
              <button type="submit" data-testid="submit">
                Publish
              </button>
            </>
          )
        }}
      />,
    )

    await user.click(screen.getByTestId('submit'))

    await waitFor(() => {
      expect(screen.getByTestId('error-probe').textContent).toBe('Choose condition type.')
      expect(screen.getAllByText('Choose condition type.')).toHaveLength(2)
    })
  })
})
