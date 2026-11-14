import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import {
  TabbedForm,
  collectTabbedFormResolverItems,
  prepareFormIssues,
  type FormIssue,
} from '@rpg/ui/form'

import { makeTestQueryClient } from '@/test/render'

import { blankSaveAction } from './lib/actions/monster-action-claim-fixtures'
import { makeContentFormCtx } from '../lib/fixtures/content-form-ctx'
import { applyContentPublishValidation } from '../lib/forms/validation/content-publish-validation.lib'
import { buildMonsterTabs } from './lib/monster-form-fields'
import { resolveMonsterFormSchema } from './lib/monster-form-schema'
import {
  resolveMonsterCreateDefaultValues,
  type MonsterFormValues,
} from './lib/monster-form-values'

vi.mock('@/features/vocabulary/hooks/use-vocabulary-set', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/features/vocabulary/hooks/use-vocabulary-set')>()
  return {
    ...actual,
    useVocabularySet: () => ({ data: undefined, isLoading: false, isPending: false }),
  }
})

vi.mock('@/features/character', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/character')>()
  return {
    ...actual,
    EquipmentPickerDrawer: () => null,
  }
})

const ctx = makeContentFormCtx({
  equipmentCatalogStatus: 'ready',
  equipmentCatalogById: new Map(),
  skillCatalogStatus: 'ready',
  skillCatalogBySlug: new Map(),
  spellCatalogStatus: 'ready',
  spellCatalogById: new Map(),
})

function MonsterPublishHarness() {
  const tabs = buildMonsterTabs(ctx)
  const fields = collectTabbedFormResolverItems(tabs)
  const [hasAttemptedPublish, setHasAttemptedPublish] = useState(false)
  const [publishPresentationIssues, setPublishPresentationIssues] = useState<FormIssue[]>([])

  return (
    <QueryClientProvider client={makeTestQueryClient()}>
      <TabbedForm<MonsterFormValues>
        schema={resolveMonsterFormSchema(ctx, 'draft')}
        tabs={tabs}
        defaultValues={{
          ...resolveMonsterCreateDefaultValues(),
          actions: [blankSaveAction()],
        }}
        onSubmit={vi.fn()}
        publishPresentationEnabled
        hasAttemptedPublish={hasAttemptedPublish}
        publishPresentationIssues={publishPresentationIssues}
        footer={(form) => (
          <button
            type="button"
            onClick={() => {
              const values = form.getValues()
              const applied = applyContentPublishValidation(
                form,
                resolveMonsterFormSchema(ctx, 'publish'),
                values,
                fields,
              )
              if (!applied) return
              setPublishPresentationIssues(
                prepareFormIssues(
                  applied.map((issue) => ({
                    path: issue.path.split('.'),
                    message: issue.message,
                  })),
                  fields,
                  values,
                ),
              )
              setHasAttemptedPublish(true)
            }}
          >
            Publish
          </button>
        )}
      />
    </QueryClientProvider>
  )
}

describe('monster save publish routing', () => {
  it('shows one count for a blank save action after publish', async () => {
    const user = userEvent.setup()
    render(<MonsterPublishHarness />)

    const actionsTab = screen.getByRole('button', { name: 'Actions' })
    await user.click(actionsTab)
    const actionsPanel = document.getElementById(actionsTab.getAttribute('aria-controls') ?? '')
    if (!actionsPanel) throw new Error('Actions panel did not render')
    const saveRow = within(actionsPanel).getAllByRole('button', { name: /Saving Throw/i })[0]
    if (!saveRow) throw new Error('Saving throw row did not render')
    await user.click(saveRow)
    await user.click(screen.getByRole('button', { name: 'Publish' }))

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /Actions.*5 fields need attention/i }),
      ).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /5 validation issues/i })).toBeInTheDocument()
    expect(screen.getByText('5 issues')).toBeInTheDocument()

    expect(within(actionsPanel).getAllByRole('alert')).toHaveLength(5)
    expect(
      within(actionsPanel).getByRole('textbox', { name: 'Failure note' }),
    ).toHaveAccessibleDescription(/.+/)
  })
})
