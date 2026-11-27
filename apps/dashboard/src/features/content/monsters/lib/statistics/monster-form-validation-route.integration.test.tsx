/**
 * @vitest-environment jsdom
 *
 * Production-entry checks for the monster tabbed form (pilot route boundary).
 * Complements proxy browser verification in docs/agent-browser.md.
 */
import { useCallback, useRef, useState, type ReactNode } from 'react'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor, within } from '@testing-library/react'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import type { ZodType } from 'zod'
import {
  TabbedForm,
  TABBED_FORM_SECTIONS_ARIA_LABEL,
  collectTabbedFormResolverItems,
  FormUiProvider,
  FormValidationInteractiveProducerBridge,
  FormValidationProducerProvider,
  type FormIssue,
  type FormValidationProducerSlot,
  createEmptyFormValidationProducerSession,
} from '@rpg/ui/form'

import { makeContentFormCtx } from '../../../lib/fixtures/content-form-ctx'
import { ingestContentFormValidationIssues } from '../../../lib/forms/validation/ingest-content-form-validation.lib'
import { augmentTabsWithHoistedName } from '../../../lib/forms/shells/layout/content-schema-form-tabs.lib'
import { monsterFormDef } from '../monster-form-def'
import { buildMonsterTabs } from '../monster-form-fields'
import { MONSTER_FORM_TAB } from '../monster-form-view'
import { resolveMonsterFormSchema } from '../monster-form-schema'
import { resolveMonsterCreateDefaultValues, type MonsterFormValues } from '../monster-form-values'

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

const ctx = makeContentFormCtx({
  equipmentCatalogStatus: 'ready',
  skillCatalogStatus: 'ready',
  spellCatalogStatus: 'ready',
})

function monsterPilotTabs() {
  const all = augmentTabsWithHoistedName(buildMonsterTabs(ctx), monsterFormDef.nameField(ctx))
  return all.filter(
    (tab) => tab.id === MONSTER_FORM_TAB.identity || tab.id === MONSTER_FORM_TAB.statistics,
  )
}

function getSectionsNav() {
  return screen.getByRole('group', { name: TABBED_FORM_SECTIONS_ARIA_LABEL })
}

function adoptedProducerBoundary(
  resolverFields: ReturnType<typeof collectTabbedFormResolverItems>,
) {
  return function ProducerBoundary({ children }: { children: ReactNode }) {
    const [session, setSession] = useState(() => createEmptyFormValidationProducerSession())
    const stampRef = useRef(0)
    const replaceSlot = useCallback(
      (slot: FormValidationProducerSlot, issues: readonly FormIssue[]) => {
        setSession((prev) =>
          ingestContentFormValidationIssues(prev, slot, stampRef.current, issues),
        )
      },
      [],
    )

    return (
      <FormValidationProducerProvider
        session={session}
        stamp={stampRef.current}
        replaceSlot={replaceSlot}
      >
        <FormValidationInteractiveProducerBridge fields={resolverFields} />
        {children}
      </FormValidationProducerProvider>
    )
  }
}

function invalidMovementPublishValues(): MonsterFormValues {
  const values = resolveMonsterCreateDefaultValues()
  values.name = ''
  values.sizes = ['medium']
  values.creatureType = 'beast'
  values.alignment = 'u'
  values.challengeRating = '1/8'
  values.movement = [{ mode: 'walk', feet: 20 }]
  values.movementAlternative = { modes: ['fly'], feet: 20 }
  return values
}

describe('monster form validation route (integration)', () => {
  it('cancels pending Review focus when the author picks another monster tab', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const publishSchema = resolveMonsterFormSchema(ctx, 'publish') as ZodType<MonsterFormValues>
    const tabs = monsterPilotTabs()
    const resolverFields = collectTabbedFormResolverItems(tabs)
    const defaultValues = invalidMovementPublishValues()

    render(
      <FormUiProvider fields={resolverFields} publishPresentationEnabled>
        <TabbedForm
          id="monster-route-review-cancel"
          schema={publishSchema}
          tabs={tabs}
          defaultValues={defaultValues}
          producerBoundary={adoptedProducerBoundary(resolverFields)}
          validationPresentation="progressive"
          publishPresentationEnabled
          onSubmit={vi.fn()}
          footer={<button type="submit">Publish</button>}
        />
      </FormUiProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Publish' }))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Review Statistics' })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Review Statistics' }))
    await user.click(within(getSectionsNav()).getByRole('button', { name: /Identity/i }))

    await vi.runAllTimersAsync()

    expect(within(getSectionsNav()).getByRole('button', { name: /Identity/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    const statisticsPanel = document.getElementById('monster-route-review-cancel-panel-statistics')
    expect(statisticsPanel?.contains(document.activeElement)).toBe(false)

    vi.useRealTimers()
  })
})
