import { describe, expect, it } from 'vitest'

import type { FormItem } from '../field-config'
import {
  collectInactiveFieldPaths,
  isFieldPathEligibleForPresentation,
  isInactivePathPrefix,
  isPresentationSessionExpanded,
  shouldShowFieldErrorPresentation,
} from './resolve-field-error-presentation.lib'
import { resolvePresentedFieldError } from '../context/array-item-presentation.context'

describe('resolve-field-error-presentation.lib', () => {
  it('matches inactive prefixes on segment boundaries only', () => {
    expect(isInactivePathPrefix('features.1', 'features.1.name')).toBe(true)
    expect(isInactivePathPrefix('features.1', 'features.10.name')).toBe(false)
  })

  it('collects dependent and visibility-gated paths as inactive', () => {
    const fields: FormItem[] = [
      {
        kind: 'dependent',
        controller: { type: 'switch', name: 'enabled', label: 'Enabled' },
        dependents: {
          fields: [
            {
              type: 'text',
              name: 'detail',
              label: 'Detail',
              required: true,
            },
          ],
        },
      },
    ]

    const inactiveWhenOff = collectInactiveFieldPaths(fields, { enabled: false })
    expect(isFieldPathEligibleForPresentation('detail', inactiveWhenOff)).toBe(false)
    expect(isFieldPathEligibleForPresentation('enabled', inactiveWhenOff)).toBe(true)

    const inactiveWhenOn = collectInactiveFieldPaths(fields, { enabled: true })
    expect(isFieldPathEligibleForPresentation('detail', inactiveWhenOn)).toBe(true)
  })

  it('expands presentation after submit or publish attempts', () => {
    expect(
      isPresentationSessionExpanded({
        validationPresentation: 'progressive',
        hasAttemptedSubmit: false,
        hasAttemptedPublish: false,
        publishPresentationEnabled: false,
      }),
    ).toBe(false)
    expect(
      isPresentationSessionExpanded({
        validationPresentation: 'progressive',
        hasAttemptedSubmit: true,
        hasAttemptedPublish: false,
        publishPresentationEnabled: false,
      }),
    ).toBe(true)
  })

  it('resolvePresentedFieldError hides copy until touch when session is collapsed', () => {
    const presentation = {
      issues: [],
      hasAttemptedSubmit: false,
      hasAttemptedPublish: false,
      publishPresentationEnabled: false,
      validationPresentation: 'progressive' as const,
      inactivePaths: new Set<string>(),
      touchedPaths: [] as string[],
    }
    expect(
      resolvePresentedFieldError('Name is required', 'name', presentation).error,
    ).toBeUndefined()
    expect(
      resolvePresentedFieldError('Name is required', 'name', {
        ...presentation,
        touchedPaths: ['name'],
      }).error,
    ).toBe('Name is required')
  })

  it('gates field errors on touch until session expands', () => {
    const session = {
      validationPresentation: 'progressive' as const,
      hasAttemptedSubmit: false,
      hasAttemptedPublish: false,
      publishPresentationEnabled: false,
    }
    const inactive = new Set<string>()
    expect(shouldShowFieldErrorPresentation('name', session, inactive, [])).toBe(false)
    expect(shouldShowFieldErrorPresentation('name', session, inactive, ['name'])).toBe(true)
  })
})
