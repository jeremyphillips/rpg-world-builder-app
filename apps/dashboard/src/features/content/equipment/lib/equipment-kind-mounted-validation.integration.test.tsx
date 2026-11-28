/**
 * @vitest-environment jsdom
 */
import { useCallback, useMemo, useState, type ComponentType, type ReactNode } from 'react'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { EquipmentKind } from '@rpg/contracts'
import {
  collectCurrentFormValidationProducerIssues,
  Form,
  FormValidationInteractiveProducerBridge,
  FormValidationProducerProvider,
  createEmptyFormValidationProducerSession,
  type FormIssue,
  type FormValidationProducerSession,
  type FormItem,
  type FormValidationProducerSlot,
} from '@rpg/ui/form'

import { ingestContentFormValidationIssues } from '../../lib/forms/validation/ingest-content-form-validation.lib'
import { equipmentEconomyFormDefaults } from './equipment-economy-form-values'
import { buildEquipmentFields, resolveEquipmentFormSchema } from './equipment-form-fields'

function equipmentDefaults(kind: EquipmentKind) {
  return {
    kind,
    name: '',
    ...equipmentEconomyFormDefaults(kind),
    cost: { amount: 1, currency: 'gp' as const },
    ...(kind === 'weapon'
      ? {
          weaponCategory: 'simple' as const,
          damage: { dice: { count: 1, die: 6 as const }, type: 'slashing' as const },
          properties: [] as const,
          mastery: 'none' as const,
          mode: 'melee' as const,
        }
      : {
          armorCategory: 'light' as const,
        }),
  }
}

function liveProducerBoundary(
  resolverFields: FormItem[],
  stampRef: { current: number },
  sessionRef: { current: FormValidationProducerSession },
) {
  return function ProducerBoundary({ children }: { children: ReactNode }) {
    const [session, setSession] = useState(() => createEmptyFormValidationProducerSession())
    sessionRef.current = session
    const replaceSlot = useCallback(
      (slot: FormValidationProducerSlot, issues: readonly FormIssue[]) => {
        setSession((prev) => {
          const next = ingestContentFormValidationIssues(prev, slot, stampRef.current, issues)
          sessionRef.current = next
          return next
        })
      },
      [stampRef, sessionRef],
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

describe('equipment kind mounted validation', () => {
  it('clears weapon interactive paths after kind identity change and armor submit', async () => {
    const user = userEvent.setup()
    const stampRef = { current: 1 }
    const sessionRef: { current: FormValidationProducerSession } = {
      current: createEmptyFormValidationProducerSession(),
    }
    const onSubmit = vi.fn()

    function KindSwitchHarness({
      kind,
      ProducerBoundary,
    }: {
      kind: EquipmentKind
      ProducerBoundary: ComponentType<{ children: ReactNode }>
    }) {
      const fields = buildEquipmentFields({ equipmentKind: kind })
      const schema = resolveEquipmentFormSchema({ equipmentKind: kind }, 'publish')

      return (
        <Form
          schema={schema}
          fields={fields}
          producerBoundary={ProducerBoundary}
          defaultValues={equipmentDefaults(kind)}
          onSubmit={onSubmit}
          footer={<button type="submit">Save equipment</button>}
        />
      )
    }

    function EquipmentKindPilot() {
      const [kind, setKind] = useState<EquipmentKind>('weapon')
      const ProducerBoundary = useMemo(
        () =>
          liveProducerBoundary(buildEquipmentFields({ equipmentKind: kind }), stampRef, sessionRef),
        [kind],
      )

      return (
        <>
          <button
            type="button"
            onClick={() => {
              stampRef.current += 1
              setKind('armor')
            }}
          >
            Switch to armor
          </button>
          <KindSwitchHarness key={kind} kind={kind} ProducerBoundary={ProducerBoundary} />
        </>
      )
    }

    render(<EquipmentKindPilot />)

    await user.click(screen.getByRole('button', { name: 'Save equipment' }))
    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled()
    })

    await user.click(screen.getByRole('button', { name: 'Switch to armor' }))
    await user.click(screen.getByRole('button', { name: 'Save equipment' }))

    await waitFor(() => {
      const issues = collectCurrentFormValidationProducerIssues(
        sessionRef.current,
        stampRef.current,
      )
      expect(issues.some((issue) => issue.path.startsWith('range.'))).toBe(false)
      expect(issues.some((issue) => issue.path === 'name')).toBe(true)
    })
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
