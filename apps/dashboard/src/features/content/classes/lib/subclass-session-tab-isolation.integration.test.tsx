/**
 * @vitest-environment jsdom
 *
 * FV-026: nested subclass editor producer issues stay outside the parent class TabbedForm chrome.
 * SubclassEditorShell mounts ProducerBoundary — parent class tabs must not badge those issues.
 */
import { describe, expect, it } from 'vitest'
import { collectTabbedFormResolverItems, resolveTabValidationState } from '@rpg/ui/form'

import { makeContentFormCtx } from '../../lib/fixtures/content-form-ctx'
import { buildClassTabs } from './class-form-fields'

describe('subclass session tab isolation', () => {
  it('does not badge the class Subclasses tab for subclass-session name issues', () => {
    const ctx = makeContentFormCtx({ mode: 'edit' })
    const classTabs = buildClassTabs(ctx)
    const resolverFields = collectTabbedFormResolverItems(classTabs)

    const tabStates = resolveTabValidationState(
      [{ path: 'name', message: 'Subclass name is required.', severity: 'field' }],
      classTabs,
      resolverFields,
    )

    expect(tabStates.find((state) => state.tabId === 'subclasses')?.count ?? 0).toBe(0)
  })

  it('blocks persist attribution on the parent class tab chrome for nested producer paths', () => {
    const ctx = makeContentFormCtx({ mode: 'edit' })
    const classTabs = buildClassTabs(ctx)
    const resolverFields = collectTabbedFormResolverItems(classTabs)
    const subclassFieldIssue = {
      path: 'features.0.name',
      message: 'Feature name is required.',
      severity: 'field' as const,
    }

    const tabStates = resolveTabValidationState([subclassFieldIssue], classTabs, resolverFields)

    expect(tabStates.find((state) => state.tabId === 'features')?.count).toBe(1)
    expect(tabStates.find((state) => state.tabId === 'subclasses')?.count ?? 0).toBe(0)
  })
})
