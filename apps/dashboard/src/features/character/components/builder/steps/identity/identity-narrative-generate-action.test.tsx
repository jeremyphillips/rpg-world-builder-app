import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { createEmptyCharacterBuilderDraft } from '@rpg/contracts'
import { describe, expect, it, vi, beforeEach } from 'vitest'

import { createCampaignNpcBuilderContextFixture } from '../../../../lib/fixtures/character-builder-fixtures'
import { harborfordSettlement } from '../../../connections/picker/residence-location-picker-drawer.fixtures'
import type { IdentityFormValues } from '../../../../lib/steps/identity-form-fields'
import { IdentityNarrativeGenerateAction } from './identity-narrative-generate-action'
import {
  applyGeneratedNarrativeToForm,
  escapeNarrativeHtml,
  isEmptyNarrativeText,
} from './identity-narrative-generate-action.lib'

const generateCharacterNarrativeMock = vi.hoisted(() => vi.fn())
const locationsQueryState = vi.hoisted(() => ({
  data: [] as (typeof harborfordSettlement)[] | undefined,
  isPending: false,
  isError: false,
  error: null as Error | null,
}))

vi.mock('@rpg/character-narrative-integrations', () => ({
  buildNarrativeContext: vi.fn((input) => input),
  generateCharacterNarrative: generateCharacterNarrativeMock,
}))

vi.mock('@/features/content', () => ({
  useLocations: () => locationsQueryState,
}))

function Harness({
  defaultValues,
  context = createCampaignNpcBuilderContextFixture(),
}: {
  defaultValues: IdentityFormValues
  context?: ReturnType<typeof createCampaignNpcBuilderContextFixture>
}) {
  const form = useForm<IdentityFormValues>({ defaultValues })
  return (
    <FormProvider {...form}>
      <IdentityNarrativeGenerateAction
        context={context}
        draft={createEmptyCharacterBuilderDraft()}
      />
    </FormProvider>
  )
}

describe('identity-narrative-generate-action.lib', () => {
  it('treats empty html and nbsp backstory as fillable', () => {
    expect(isEmptyNarrativeText('<p></p>')).toBe(true)
    expect(isEmptyNarrativeText('<p>&nbsp;</p>')).toBe(true)
    expect(isEmptyNarrativeText('<p>  </p>')).toBe(true)
  })

  it('escapes interpolated names in generated html', () => {
    expect(escapeNarrativeHtml(`O'Malley & Co.`)).toBe('O&#39;Malley &amp; Co.')
  })

  it('preserves authored array rows when any row has text', () => {
    const form = {
      getValues: () => ({
        narrative: {
          personalityTraits: [{ value: 'Brave' }, { value: '' }],
          ideals: [{ value: '' }],
          bonds: [{ value: '' }],
          flaws: [{ value: '' }],
          backstory: '',
        },
      }),
      setValue: vi.fn(),
    }

    applyGeneratedNarrativeToForm(form as never, {
      personalityTraits: ['Generated trait'],
      ideals: ['Generated ideal'],
      bonds: ['Generated bond'],
      flaws: ['Generated flaw'],
      backstoryParagraphs: ['One', 'Two', 'Three'],
    })

    expect(form.setValue).not.toHaveBeenCalledWith(
      'narrative.personalityTraits',
      expect.anything(),
      expect.anything(),
    )
    expect(form.setValue).toHaveBeenCalledWith('narrative.ideals', [{ value: 'Generated ideal' }], {
      shouldDirty: true,
      shouldValidate: true,
    })
  })
})

describe('IdentityNarrativeGenerateAction', () => {
  beforeEach(() => {
    generateCharacterNarrativeMock.mockReset()
    locationsQueryState.data = []
    locationsQueryState.isPending = false
    locationsQueryState.isError = false
    locationsQueryState.error = null
  })

  it('does not generate when the locations query fails', async () => {
    const user = userEvent.setup()
    locationsQueryState.isError = true
    locationsQueryState.error = new Error('Could not load locations.')

    render(
      <Harness
        defaultValues={{
          name: '',
          gender: undefined,
          alignment: 'ng',
          narrative: {
            personalityTraits: [{ value: '' }],
            ideals: [{ value: '' }],
            bonds: [{ value: '' }],
            flaws: [{ value: '' }],
          },
        }}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Generate background' }))

    expect(generateCharacterNarrativeMock).not.toHaveBeenCalled()
    expect(screen.getByText('Could not load locations.')).toBeInTheDocument()
  })

  it('shows a no-op explanation when all narrative fields are filled', async () => {
    render(
      <Harness
        defaultValues={{
          name: '',
          gender: undefined,
          alignment: 'ng',
          narrative: {
            personalityTraits: [{ value: 'Brave' }],
            ideals: [{ value: 'Justice' }],
            bonds: [{ value: 'Family' }],
            flaws: [{ value: 'Pride' }],
            backstory: '<p>Already written.</p>',
          },
        }}
      />,
    )

    expect(
      screen.getByText('All narrative fields already have text. Clear a field to generate again.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Generate background' })).toBeDisabled()
  })

  it('generates with campaign locations when the query succeeds', async () => {
    const user = userEvent.setup()
    locationsQueryState.data = [harborfordSettlement]
    generateCharacterNarrativeMock.mockResolvedValue({
      ok: true,
      narrative: {
        personalityTraits: ['Generated trait'],
        ideals: ['Generated ideal'],
        bonds: ['Generated bond'],
        flaws: ['Generated flaw'],
        backstoryParagraphs: ['One', 'Two', 'Three'],
      },
      omittedReferenceIds: [],
    })

    render(
      <Harness
        defaultValues={{
          name: '',
          gender: undefined,
          alignment: 'ng',
          narrative: {
            personalityTraits: [{ value: '' }],
            ideals: [{ value: '' }],
            bonds: [{ value: '' }],
            flaws: [{ value: '' }],
          },
        }}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Generate background' }))

    await waitFor(() => {
      expect(generateCharacterNarrativeMock).toHaveBeenCalled()
    })
  })
})
