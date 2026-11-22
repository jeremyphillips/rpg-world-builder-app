import { useEffect } from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { beforeAll, describe, expect, it } from 'vitest'
import {
  formatExperiencePoints,
  monsterLairCustomXpMinimumHint,
  resolveMonsterBaseExperiencePoints,
  suggestInLairExperience,
} from '@rpg/contracts'
import { FormItems } from '@rpg/ui/form'

import { getMonsterBySlug } from '@rpg/catalog/monsters'

import {
  MONSTER_ADD_IN_LAIR_XP_LABEL,
  MONSTER_HAS_LAIR_ENHANCEMENTS_LABEL,
  MONSTER_LAIR_EXPERIENCE_CUSTOM_LABEL,
  MONSTER_LAIR_EXPERIENCE_MODE_CUSTOM,
  MONSTER_LAIR_EXPERIENCE_MODE_LABEL,
  MONSTER_LAIR_EXPERIENCE_MODE_SUGGESTED,
  MONSTER_LAIR_EXPERIENCE_REMOVE_LABEL,
  MONSTER_LAIR_EXPERIENCE_SUGGESTED_CAPTION,
} from '../monster-form-labels'
import { createMonsterInputSchema } from '@rpg/contracts'

import { normalizeMonsterFormValues } from '../normalize-monster-form-values'
import { monsterLairFormFields } from './monster-lair-form-fields'
import { monsterToFormValues, resolveMonsterCreateDefaultValues } from '../monster-form-values'

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

function LairStateProbe() {
  const { watch, formState, getValues } = useFormContext()
  return (
    <output data-testid="lair-state">
      {JSON.stringify({
        dirty: formState.isDirty,
        lair: watch('lair') ?? null,
        experience: watch('lair.experience') ?? null,
        experienceMode: watch('lair.experience.mode'),
        rootMode: getValues('mode'),
        rootValue: getValues('value'),
        rootExperienceMode: getValues('lair.experience.mode'),
      })}
    </output>
  )
}

function lairState() {
  return JSON.parse(screen.getByTestId('lair-state').textContent ?? '{}') as {
    dirty: boolean
    lair: { enabled?: boolean; experience?: { mode?: string; value?: number } } | null
    experience: { mode?: string; value?: number } | null
    experienceMode?: string
    rootMode: unknown
    rootValue: unknown
    rootExperienceMode: unknown
  }
}

function LairHarness({ defaultValues }: { defaultValues: Record<string, unknown> }) {
  const form = useForm({ defaultValues, shouldUnregister: true })
  return (
    <FormProvider {...form}>
      <LairStateProbe />
      <FormItems items={monsterLairFormFields()} idPrefix="lair" />
    </FormProvider>
  )
}

function LairHarnessWithChallengeRating({
  challengeRating,
  defaultValues,
}: {
  challengeRating: string
  defaultValues: Record<string, unknown>
}) {
  const form = useForm({ defaultValues, shouldUnregister: true })
  useEffect(() => {
    form.setValue('challengeRating', challengeRating, { shouldDirty: true })
  }, [challengeRating, form])
  return (
    <FormProvider {...form}>
      <LairStateProbe />
      <FormItems items={monsterLairFormFields()} idPrefix="lair" />
    </FormProvider>
  )
}

function modeCombobox() {
  return screen.getByRole('combobox', { name: MONSTER_LAIR_EXPERIENCE_MODE_LABEL })
}

function lairEnhancementsSwitch() {
  return screen.getByRole('switch', { name: MONSTER_HAS_LAIR_ENHANCEMENTS_LABEL })
}

describe('monsterLairFormFields optional disclosure', () => {
  it('hydrates suggested mode on the nested path for Lich defaults', () => {
    const lich = getMonsterBySlug('srd-cc-5.2.1', 'lich')
    const values = monsterToFormValues(lich)
    const challengeRating = values.challengeRating as string
    const suggestion = suggestInLairExperience(challengeRating as '21')
    expect(suggestion.status).toBe('available')

    render(
      <LairHarness
        defaultValues={{
          challengeRating,
          lair: values.lair,
        }}
      />,
    )

    const combobox = modeCombobox()
    expect(
      screen.queryByRole('button', { name: MONSTER_ADD_IN_LAIR_XP_LABEL }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: MONSTER_LAIR_EXPERIENCE_REMOVE_LABEL }),
    ).toBeInTheDocument()
    expect(combobox).toHaveTextContent(MONSTER_LAIR_EXPERIENCE_MODE_SUGGESTED)
    expect(combobox).not.toHaveAttribute('data-placeholder')
    expect(
      screen.getByText(formatExperiencePoints(suggestion.experiencePoints)),
    ).toBeInTheDocument()
    expect(screen.getByText(MONSTER_LAIR_EXPERIENCE_SUGGESTED_CAPTION)).toBeInTheDocument()

    const state = lairState()
    expect(state.experience).toEqual({ mode: 'suggested' })
    expect(state.rootMode).toBeUndefined()
    expect(state.rootValue).toBeUndefined()
    expect(state.dirty).toBe(false)
  })

  it('hydrates custom mode and value on nested paths', () => {
    render(
      <LairHarness
        defaultValues={{
          challengeRating: '21',
          lair: { enabled: true, experience: { mode: 'custom', value: 7200 } },
        }}
      />,
    )

    expect(modeCombobox()).toHaveTextContent(MONSTER_LAIR_EXPERIENCE_MODE_CUSTOM)
    expect(
      screen.getByRole('spinbutton', { name: MONSTER_LAIR_EXPERIENCE_CUSTOM_LABEL }),
    ).toHaveValue(7200)
    expect(lairState().experience).toEqual({ mode: 'custom', value: 7200 })
    expect(lairState().rootMode).toBeUndefined()
    expect(lairState().rootValue).toBeUndefined()
  })

  it('stays collapsed when lair is enabled without experience', () => {
    render(
      <LairHarness
        defaultValues={{
          challengeRating: '21',
          lair: { enabled: true },
        }}
      />,
    )

    expect(screen.getByRole('button', { name: MONSTER_ADD_IN_LAIR_XP_LABEL })).toBeInTheDocument()
    expect(
      screen.queryByRole('combobox', { name: MONSTER_LAIR_EXPERIENCE_MODE_LABEL }),
    ).not.toBeInTheDocument()
  })

  it('seeds nested suggested experience when adding in-lair XP', async () => {
    const user = userEvent.setup()
    render(
      <LairHarness
        defaultValues={{
          challengeRating: '21',
          lair: { enabled: true },
        }}
      />,
    )

    await user.click(screen.getByRole('button', { name: MONSTER_ADD_IN_LAIR_XP_LABEL }))
    await waitFor(() => {
      expect(lairState().experience).toEqual({ mode: 'suggested' })
      expect(lairState().experienceMode).toBe('suggested')
      expect(lairState().rootExperienceMode).toBe('suggested')
    })
    expect(
      screen.getByRole('button', { name: MONSTER_LAIR_EXPERIENCE_REMOVE_LABEL }),
    ).toBeInTheDocument()
  })

  it('persists mode and custom value edits under lair.experience', async () => {
    const user = userEvent.setup()
    render(
      <LairHarness
        defaultValues={{
          challengeRating: '21',
          lair: { enabled: true, experience: { mode: 'suggested' } },
        }}
      />,
    )

    await user.click(modeCombobox())
    await user.click(
      within(document.body).getByRole('option', { name: MONSTER_LAIR_EXPERIENCE_MODE_CUSTOM }),
    )
    await waitFor(() => {
      expect(lairState().experience).toEqual({ mode: 'custom' })
    })

    const valueInput = screen.getByRole('spinbutton', {
      name: MONSTER_LAIR_EXPERIENCE_CUSTOM_LABEL,
    })
    await user.clear(valueInput)
    await user.type(valueInput, '8800')
    await waitFor(() => {
      expect(lairState().experience).toEqual({ mode: 'custom', value: 8800 })
    })
    expect(lairState().rootValue).toBeUndefined()
  })

  it('clears only experience on remove and keeps lair enabled', async () => {
    const user = userEvent.setup()
    render(
      <LairHarness
        defaultValues={{
          challengeRating: '21',
          lair: { enabled: true, experience: { mode: 'suggested' } },
        }}
      />,
    )

    await user.click(screen.getByRole('button', { name: MONSTER_LAIR_EXPERIENCE_REMOVE_LABEL }))
    await waitFor(() => {
      const state = lairState()
      expect(state.lair).toEqual({ enabled: true })
      expect(state.experience).toBeNull()
      expect(screen.getByRole('button', { name: MONSTER_ADD_IN_LAIR_XP_LABEL })).toBeInTheDocument()
    })
  })

  it('hides in-lair XP controls when lair enhancements are turned off', async () => {
    const user = userEvent.setup()
    render(
      <LairHarness
        defaultValues={{
          challengeRating: '21',
          lair: { enabled: true, experience: { mode: 'suggested' } },
        }}
      />,
    )

    expect(modeCombobox()).toBeInTheDocument()
    await user.click(lairEnhancementsSwitch())
    expect(
      screen.queryByRole('combobox', { name: MONSTER_LAIR_EXPERIENCE_MODE_LABEL }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: MONSTER_LAIR_EXPERIENCE_REMOVE_LABEL }),
    ).not.toBeInTheDocument()
  })

  it('serializes nested lair experience through normalize', async () => {
    const user = userEvent.setup()
    render(
      <LairHarness
        defaultValues={{
          challengeRating: '21',
          lair: { enabled: true, experience: { mode: 'suggested' } },
        }}
      />,
    )

    await user.click(modeCombobox())
    await user.click(
      within(document.body).getByRole('option', { name: MONSTER_LAIR_EXPERIENCE_MODE_CUSTOM }),
    )
    const valueInput = await screen.findByRole('spinbutton', {
      name: MONSTER_LAIR_EXPERIENCE_CUSTOM_LABEL,
    })
    await user.clear(valueInput)
    await user.type(valueInput, '5000')
    await waitFor(() => {
      expect(lairState().experience).toEqual({ mode: 'custom', value: 5000 })
    })

    const values = resolveMonsterCreateDefaultValues()
    values.challengeRating = '21'
    values.lair = lairState().lair ?? undefined
    const normalized = normalizeMonsterFormValues(values, { intent: 'draft', mode: 'create' })
    expect(normalized.lair).toEqual({
      enabled: true,
      experience: { mode: 'custom', value: 5000 },
    })
  })

  it('shows minimum normal XP in the custom field hint and updates when CR changes', async () => {
    const base10 = resolveMonsterBaseExperiencePoints({ challengeRating: '10' })
    const base21 = resolveMonsterBaseExperiencePoints({ challengeRating: '21' })
    const lairDefaults = {
      lair: { enabled: true, experience: { mode: 'custom', value: 7200 } },
    }
    const { rerender } = render(
      <LairHarnessWithChallengeRating
        challengeRating="10"
        defaultValues={{ challengeRating: '10', ...lairDefaults }}
      />,
    )
    expect(document.body).toHaveTextContent(monsterLairCustomXpMinimumHint(base10))

    rerender(
      <LairHarnessWithChallengeRating
        challengeRating="21"
        defaultValues={{ challengeRating: '10', ...lairDefaults }}
      />,
    )
    await waitFor(() => {
      expect(document.body).toHaveTextContent(monsterLairCustomXpMinimumHint(base21))
    })
    expect(
      screen.getByRole('spinbutton', { name: MONSTER_LAIR_EXPERIENCE_CUSTOM_LABEL }),
    ).toHaveValue(7200)
  })

  it('maps publish validation for sub-minimum custom XP to lair.experience.value', () => {
    const values = resolveMonsterCreateDefaultValues()
    values.name = 'Test'
    values.sizes = ['medium']
    values.creatureType = 'humanoid'
    values.alignment = 'n'
    values.challengeRating = '21'
    values.lair = { enabled: true, experience: { mode: 'custom', value: 7200 } }
    const body = normalizeMonsterFormValues(values, { intent: 'publish', mode: 'create' })
    const parsed = createMonsterInputSchema.safeParse({ slug: 'lair-xp-invalid', ...body })
    expect(parsed.success).toBe(false)
    if (parsed.success) return
    const valueIssue = parsed.error.issues.find(
      (issue) => issue.path.join('.') === 'lair.experience.value',
    )
    expect(valueIssue?.message).toMatch(/In-lair XP must exceed/)
  })
})
