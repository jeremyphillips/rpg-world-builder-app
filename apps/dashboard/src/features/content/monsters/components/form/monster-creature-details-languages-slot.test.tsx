import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import type { MonsterFormValues } from '../../lib/monster-form-values'
import { MonsterCreatureDetailsLanguagesSlot } from './monster-creature-details-slots'
import {
  MONSTER_LANGUAGES_FIELD_HINT,
  MONSTER_LANGUAGES_FIELD_LABEL,
  MONSTER_SPEAKS_LABEL,
  MONSTER_UNDERSTANDS_ONLY_LABEL,
} from '../../lib/monster-form-labels'

const languageCtx: ContentFormCtx = {
  campaignId: 'campaign-1',
  skillCatalogStatus: 'ready',
  equipmentCatalogStatus: 'ready',
  languageVocabulary: {
    activeIds: new Set(['common', 'draconic']),
    labelById: { common: 'Common', draconic: 'Draconic' },
    categoryById: {},
  },
  creatureTypeVocabulary: {
    activeIds: new Set(['dragon']),
    labelById: { dragon: 'Dragon' },
    languageAffinitiesById: { dragon: ['draconic'] },
  },
}

function Harness({
  defaultValues,
  ctx = languageCtx,
}: {
  defaultValues: Partial<MonsterFormValues>
  ctx?: ContentFormCtx
}) {
  const form = useForm<MonsterFormValues>({
    defaultValues: defaultValues as MonsterFormValues,
  })
  return (
    <FormProvider {...form}>
      <MonsterCreatureDetailsLanguagesSlot ctx={ctx} />
      <SpeaksProbe />
    </FormProvider>
  )
}

function SpeaksProbe() {
  const speaks = useFormContext<MonsterFormValues>().watch('proficiencies.languages.0.speaks')
  return <output data-testid="speaks">{speaks === false ? 'false' : 'unset'}</output>
}

describe('MonsterCreatureDetailsLanguagesSlot fluency chips', () => {
  it('shows understands-only as a lone toggle; speaking is implied', () => {
    render(
      <Harness
        defaultValues={{
          proficiencies: {
            savingThrows: [],
            skills: [],
            languages: [{ language: 'common' }],
            weapons: { categories: [], items: [] },
          },
        }}
      />,
    )

    expect(screen.queryByRole('checkbox', { name: MONSTER_SPEAKS_LABEL })).not.toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: MONSTER_UNDERSTANDS_ONLY_LABEL })).toHaveAttribute(
      'aria-checked',
      'false',
    )
  })

  it('writes speaks false when understands only is checked and clears it when unchecked', async () => {
    const user = userEvent.setup()
    render(
      <Harness
        defaultValues={{
          proficiencies: {
            savingThrows: [],
            skills: [],
            languages: [{ language: 'common' }],
            weapons: { categories: [], items: [] },
          },
        }}
      />,
    )

    await user.click(screen.getByRole('checkbox', { name: MONSTER_UNDERSTANDS_ONLY_LABEL }))
    expect(screen.getByTestId('speaks')).toHaveTextContent('false')
    await user.click(screen.getByRole('checkbox', { name: MONSTER_UNDERSTANDS_ONLY_LABEL }))
    expect(screen.getByTestId('speaks')).toHaveTextContent('unset')
  })
})

describe('MonsterCreatureDetailsLanguagesSlot recommendation', () => {
  it('shows recommendation for dragon with no selected languages', () => {
    render(
      <Harness
        defaultValues={{
          creatureType: 'dragon',
          proficiencies: {
            savingThrows: [],
            skills: [],
            languages: [],
            weapons: { categories: [], items: [] },
          },
        }}
      />,
    )

    expect(screen.getByText(MONSTER_LANGUAGES_FIELD_LABEL)).toBeInTheDocument()
    expect(screen.getByText(MONSTER_LANGUAGES_FIELD_HINT)).toBeInTheDocument()
    expect(screen.getByText(/Recommended for this creature type:/)).toBeInTheDocument()
    expect(screen.getByText('Dragon')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add Draconic' })).toBeInTheDocument()
    const addLanguageControl = screen.getByRole('combobox', {
      name: MONSTER_LANGUAGES_FIELD_LABEL,
    })
    expect(addLanguageControl).toBeInTheDocument()
    expect(addLanguageControl).toHaveTextContent('Add language')
  })

  it('hides recommendation after a language is selected', async () => {
    const user = userEvent.setup()
    render(
      <Harness
        defaultValues={{
          creatureType: 'dragon',
          proficiencies: {
            savingThrows: [],
            skills: [],
            languages: [],
            weapons: { categories: [], items: [] },
          },
        }}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Add Draconic' }))
    expect(screen.queryByRole('button', { name: 'Add Draconic' })).not.toBeInTheDocument()
    expect(screen.getByText('Draconic')).toBeInTheDocument()
  })

  it('quick-add matches combobox selection behavior', async () => {
    const user = userEvent.setup()
    const HarnessWithSpy = () => {
      const form = useForm<MonsterFormValues>({
        defaultValues: {
          creatureType: 'dragon',
          proficiencies: {
            savingThrows: [],
            skills: [],
            languages: [],
            weapons: { categories: [], items: [] },
          },
        } as MonsterFormValues,
      })
      const watchLanguages = form.watch('proficiencies.languages')
      return (
        <FormProvider {...form}>
          <MonsterCreatureDetailsLanguagesSlot ctx={languageCtx} />
          <span data-testid="language-count">{watchLanguages?.length ?? 0}</span>
        </FormProvider>
      )
    }

    render(<HarnessWithSpy />)
    await user.click(screen.getByRole('button', { name: 'Add Draconic' }))
    expect(screen.getByTestId('language-count')).toHaveTextContent('1')
  })

  it('does not show duplicate field labels', () => {
    render(
      <Harness
        defaultValues={{
          creatureType: 'dragon',
          proficiencies: {
            savingThrows: [],
            skills: [],
            languages: [],
            weapons: { categories: [], items: [] },
          },
        }}
      />,
    )

    expect(screen.getAllByText(MONSTER_LANGUAGES_FIELD_LABEL)).toHaveLength(1)
    expect(
      screen.queryByRole('heading', { name: MONSTER_LANGUAGES_FIELD_LABEL }),
    ).not.toBeInTheDocument()
  })
})
