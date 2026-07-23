import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { z } from 'zod'

import {
  Form,
  TabbedForm,
  useFormUiContext,
  useSilentFormValidity,
  type TabbedFormTab,
} from '../index'
import type { FormItem } from '../field-config'

const flatSchema = z.object({
  name: z.string().min(1, 'Name is required'),
})

type FlatValues = z.infer<typeof flatSchema>

const flatFields: FormItem[] = [{ type: 'text', name: 'name', label: 'Name', required: true }]

function SilentValidityProbe() {
  const { validateSilently } = useFormUiContext()
  const { canSubmit, isChecking } = useSilentFormValidity()

  return (
    <div
      data-testid="silent-validity"
      data-has-validate-silently={String(Boolean(validateSilently))}
      data-can-submit={String(canSubmit)}
      data-is-checking={String(isChecking)}
    />
  )
}

describe('validateSilently context wiring', () => {
  describe('flat Form', () => {
    it('provides validateSilently and resolves valid defaults', async () => {
      render(
        <Form<FlatValues>
          schema={flatSchema}
          fields={flatFields}
          defaultValues={{ name: 'Fireball' }}
          onSubmit={vi.fn()}
          footer={() => <SilentValidityProbe />}
        />,
      )

      expect(screen.getByTestId('silent-validity')).toHaveAttribute(
        'data-has-validate-silently',
        'true',
      )

      await waitFor(() => {
        expect(screen.getByTestId('silent-validity')).toHaveAttribute('data-can-submit', 'true')
      })
    })

    it('reports invalid values without calling form.trigger', async () => {
      const triggerSpy = vi.fn()
      render(
        <Form<FlatValues>
          schema={flatSchema}
          fields={flatFields}
          defaultValues={{ name: '' }}
          onSubmit={vi.fn()}
          footer={(form) => {
            triggerSpy.mockImplementation(form.trigger)
            return <SilentValidityProbe />
          }}
        />,
      )

      await waitFor(() => {
        expect(screen.getByTestId('silent-validity')).toHaveAttribute('data-can-submit', 'false')
      })
      expect(triggerSpy).not.toHaveBeenCalled()
    })
  })

  describe('TabbedForm with header-only resolverFields', () => {
    const embeddedSchema = z.object({
      heritage: z.object({
        name: z.string().min(1, 'Heritage name is required'),
      }),
    })

    type EmbeddedValues = z.infer<typeof embeddedSchema>

    const tabs: TabbedFormTab[] = [
      {
        id: 'heritage',
        label: 'Heritage',
        fields: [],
        errorPaths: ['heritage.name'],
        resolverFields: [
          { type: 'text', name: 'heritage.name', label: 'Heritage name', required: true },
        ],
        header: <p>Embedded editor</p>,
      },
    ]

    it('includes resolverFields in silent validation', async () => {
      render(
        <TabbedForm<EmbeddedValues>
          schema={embeddedSchema}
          tabs={tabs}
          defaultValues={{ heritage: { name: '' } }}
          onSubmit={vi.fn()}
          footer={() => <SilentValidityProbe />}
        />,
      )

      await waitFor(() => {
        expect(screen.getByTestId('silent-validity')).toHaveAttribute('data-can-submit', 'false')
      })
    })

    it('accepts valid resolver-only values', async () => {
      render(
        <TabbedForm<EmbeddedValues>
          schema={embeddedSchema}
          tabs={tabs}
          defaultValues={{ heritage: { name: 'Moon elf' } }}
          onSubmit={vi.fn()}
          footer={() => <SilentValidityProbe />}
        />,
      )

      await waitFor(() => {
        expect(screen.getByTestId('silent-validity')).toHaveAttribute('data-can-submit', 'true')
      })
    })
  })
})

describe('useSilentFormValidity', () => {
  it('updates after debounced edits', async () => {
    const user = userEvent.setup()

    render(
      <Form<FlatValues>
        schema={flatSchema}
        fields={flatFields}
        defaultValues={{ name: '' }}
        onSubmit={vi.fn()}
        footer={() => (
          <>
            <SilentValidityProbe />
          </>
        )}
      />,
    )

    await waitFor(() => {
      expect(screen.getByTestId('silent-validity')).toHaveAttribute('data-can-submit', 'false')
    })

    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Fireball')

    await waitFor(
      () => {
        expect(screen.getByTestId('silent-validity')).toHaveAttribute('data-can-submit', 'true')
      },
      { timeout: 2000 },
    )
  })
})
