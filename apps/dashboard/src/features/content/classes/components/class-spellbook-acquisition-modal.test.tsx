import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it, vi } from 'vitest'

import { makeContentFormCtx } from '../../lib/fixtures/content-form-ctx'
import { ClassSpellbookAcquisitionField } from './class-spellbook-acquisition-field'
import { ClassSpellbookAcquisitionModal } from './class-spellbook-acquisition-modal'
import { buildClassSpellbookAcquisitionDraft } from '../lib/class-spellbook-acquisition-field.lib'
import {
  materializeRegularGain,
  SPELLBOOK_GAIN_MODE_REGULAR,
  SPELLBOOK_GAIN_MODE_VARIABLE,
} from '../lib/class-spell-selection-form.lib'

describe('ClassSpellbookAcquisitionField', () => {
  it('renders a summary card without the gain progression badge', () => {
    const Harness = () => {
      const form = useForm({
        defaultValues: {
          spellbookAcquisitionIrregular: false,
          spellbookAcquisitionStarting: 6,
          spellbookAcquisitionPerLevel: 2,
          spellbookAcquisitionThroughLevel: 20,
        },
      })

      return (
        <FormProvider {...form}>
          <ClassSpellbookAcquisitionField formCtx={makeContentFormCtx()} />
        </FormProvider>
      )
    }

    render(<Harness />)

    expect(screen.getByText('Spellbook acquisition')).toBeInTheDocument()
    expect(
      screen.getByText('Start with 6 · Gain 2 each level through level 20'),
    ).toBeInTheDocument()
    expect(screen.queryByText('Gain progression')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
  })
})

describe('ClassSpellbookAcquisitionModal', () => {
  it('shows the live regular acquisition alert', () => {
    render(
      <ClassSpellbookAcquisitionModal
        open
        formCtx={makeContentFormCtx()}
        maxLevel={20}
        allowedLevels={Array.from({ length: 20 }, (_, index) => index + 1)}
        initialGainMode={SPELLBOOK_GAIN_MODE_REGULAR}
        initialStarting={6}
        initialPerLevel={2}
        initialThroughLevel={20}
        initialTableDraft={buildClassSpellbookAcquisitionDraft(
          materializeRegularGain({ starting: 6, perLevel: 2, throughLevel: 20 }),
        )}
        onSave={() => undefined}
        onOpenChange={() => undefined}
      />,
    )

    expect(
      screen.getByText('Start with 6 spells. Gain 2 spells at each later level through level 20.'),
    ).toBeInTheDocument()
  })

  it('switches to the variable pane when varies by level is selected', async () => {
    const user = userEvent.setup()

    render(
      <ClassSpellbookAcquisitionModal
        open
        formCtx={makeContentFormCtx()}
        maxLevel={20}
        allowedLevels={Array.from({ length: 20 }, (_, index) => index + 1)}
        initialGainMode={SPELLBOOK_GAIN_MODE_REGULAR}
        initialStarting={6}
        initialPerLevel={2}
        initialThroughLevel={3}
        initialTableDraft={buildClassSpellbookAcquisitionDraft(
          materializeRegularGain({ starting: 6, perLevel: 2, throughLevel: 3 }),
        )}
        onSave={() => undefined}
        onOpenChange={() => undefined}
      />,
    )

    await user.click(screen.getByRole('radio', { name: /Varies by level/i }))

    expect(screen.getByText('Spell gains by level')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add level' })).toBeInTheDocument()
    expect(
      screen.getByText(
        'Only add levels where spells are gained. A level without a value grants 0 spells.',
      ),
    ).toBeInTheDocument()
  })

  it('calls onSave with regular values', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()

    render(
      <ClassSpellbookAcquisitionModal
        open
        formCtx={makeContentFormCtx()}
        maxLevel={20}
        allowedLevels={Array.from({ length: 20 }, (_, index) => index + 1)}
        initialGainMode={SPELLBOOK_GAIN_MODE_REGULAR}
        initialStarting={6}
        initialPerLevel={2}
        initialThroughLevel={20}
        initialTableDraft={buildClassSpellbookAcquisitionDraft(
          materializeRegularGain({ starting: 6, perLevel: 2, throughLevel: 20 }),
        )}
        onSave={onSave}
        onOpenChange={() => undefined}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSave).toHaveBeenCalledWith({
      irregular: false,
      starting: 6,
      perLevel: 2,
      throughLevel: 20,
    })
  })

  it('calls onSave with an irregular curve from the variable pane', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()

    render(
      <ClassSpellbookAcquisitionModal
        open
        formCtx={makeContentFormCtx()}
        maxLevel={20}
        allowedLevels={Array.from({ length: 20 }, (_, index) => index + 1)}
        initialGainMode={SPELLBOOK_GAIN_MODE_VARIABLE}
        initialTableDraft={buildClassSpellbookAcquisitionDraft({
          curve: {
            rows: [
              { level: 1, count: 6 },
              { level: 2, count: 2 },
              { level: 4, count: 3 },
            ],
          },
          extension: 'zero',
        })}
        onSave={onSave}
        onOpenChange={() => undefined}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSave).toHaveBeenCalledWith({
      irregular: true,
      curve: {
        curve: {
          rows: [
            { level: 1, count: 6 },
            { level: 2, count: 2 },
            { level: 4, count: 3 },
          ],
        },
        extension: 'zero',
      },
    })
  })
})
