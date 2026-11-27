/**
 * @vitest-environment jsdom
 */
import { useEffect } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form'
import { describe, expect, it } from 'vitest'
import {
  FormUiProvider,
  FormValidationProducerProvider,
  createEmptyFormValidationProducerSession,
  replaceFormValidationProducerSlot,
} from '@rpg/ui/form'
import type { ReactNode } from 'react'

import type { ContentFormCtx } from '../../../../lib/forms/registry/content-form-registry'
import { monsterFormTestValues } from '../../../lib/monster-form-test-values'
import type { MonsterFormValues } from '../../../lib/monster-form-values'
import { MonsterActionSections } from './action-sections'

const readyCtx: ContentFormCtx = {
  entityCatalogLayer: 'homebrew',
  equipmentCatalogStatus: 'ready',
  equipmentCatalogById: new Map(),
}

function ProducerHost({ values, children }: { values: MonsterFormValues; children: ReactNode }) {
  const session = replaceFormValidationProducerSlot(
    createEmptyFormValidationProducerSession(),
    'publish-action',
    1,
    [
      {
        path: 'actions.1.description',
        message: 'Add a description.',
        severity: 'field',
      },
    ],
  )

  return (
    <FormValidationProducerProvider session={session} stamp={1}>
      {children}
    </FormValidationProducerProvider>
  )
}

function Host({
  values,
  formRef,
}: {
  values: MonsterFormValues
  formRef?: { current: UseFormReturn<MonsterFormValues> | null }
}) {
  const form = useForm<MonsterFormValues>({ defaultValues: values })
  useEffect(() => {
    if (formRef) formRef.current = form
  })

  return (
    <FormUiProvider hasAttemptedPublish publishPresentationEnabled>
      <FormProvider {...form}>
        <ProducerHost values={values}>
          <MonsterActionSections ctx={readyCtx} />
        </ProducerHost>
      </FormProvider>
    </FormUiProvider>
  )
}

describe('MonsterActionSections availability and validation', () => {
  it('counts validation on availability-hidden rows in the collection summary', async () => {
    const values = monsterFormTestValues({
      name: 'Hidden issue',
      actions: [
        {
          id: 'visible',
          kind: 'special',
          name: 'Visible Strike',
          available: true,
          description: '<p>Ready</p>',
        },
        {
          id: 'hidden',
          kind: 'special',
          name: 'Hidden Strike',
          available: false,
          description: '',
        },
      ],
    })

    render(<Host values={values} />)

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /Visible Strike/i }).length).toBeGreaterThan(0)
    })
    expect(screen.queryByRole('button', { name: /Hidden Strike/i })).not.toBeInTheDocument()

    const validationBadges = screen.getAllByText('1', { selector: '[aria-hidden="true"]' })
    expect(validationBadges.length).toBeGreaterThan(0)
    expect(
      screen.getByRole('button', { name: /Show all campaign availability states/i }),
    ).toBeInTheDocument()
  })
})
