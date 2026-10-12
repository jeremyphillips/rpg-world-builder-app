import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ReactNode } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import type { MonsterFormValues } from '../../lib/monster-form-values'
import { MonsterCreatureDetailsSkillsSlot } from './monster-creature-details-skills-slot'
import {
  MonsterCreatureDetailsLanguagesSlot,
  MonsterCreatureDetailsSensesSlot,
  MonsterTelepathyRangeField,
} from './monster-creature-details-slots'
import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'

const mockCtx: ContentFormCtx = {
  campaignId: 'campaign-1',
  skillCatalogStatus: 'ready',
  senseVocabulary: {
    activeIds: new Set(['darkvision', 'blindsight']),
    labelById: { darkvision: 'Darkvision', blindsight: 'Blindsight' },
  },
  languageVocabulary: {
    activeIds: new Set(['common']),
    labelById: { common: 'Common' },
    categoryById: {},
  },
  options: {
    skills: {
      visible: [
        {
          id: 'stealth',
          slug: 'stealth',
          name: 'Stealth',
          description: 'Make a Dexterity (Stealth) check.',
          ability: 'dex',
          source: 'system',
        } as never,
      ],
    } as never,
  },
  equipmentCatalogStatus: 'ready',
}

function FormHarness({
  children,
  defaultValues,
}: {
  children: ReactNode
  defaultValues: Partial<MonsterFormValues>
}) {
  const form = useForm<MonsterFormValues>({ defaultValues: defaultValues as MonsterFormValues })
  return <FormProvider {...form}>{children}</FormProvider>
}

const meta = {
  title: 'Features/Content/Monsters/Creature details slots',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta

type Story = StoryObj

export const SkillRows: Story = {
  render: () => (
    <FormHarness
      defaultValues={{
        abilityScores: { str: 10, dex: 16, con: 10, int: 10, wis: 10, cha: 10 },
        proficiencies: {
          skills: [{ skill: 'stealth', rank: 'proficient' }],
          savingThrows: [],
          weapons: { categories: [], items: [] },
        },
        challengeRating: '1',
      }}
    >
      <MonsterCreatureDetailsSkillsSlot ctx={mockCtx} />
    </FormHarness>
  ),
}

export const SenseRows: Story = {
  render: () => (
    <FormHarness defaultValues={{ senses: [{ type: 'darkvision', range: 60 }] }}>
      <MonsterCreatureDetailsSensesSlot ctx={mockCtx} />
    </FormHarness>
  ),
}

export const TelepathyRange: Story = {
  render: () => (
    <FormHarness defaultValues={{ languages: { entries: [], telepathy: 5280 } }}>
      <MonsterTelepathyRangeField />
    </FormHarness>
  ),
}

export const LanguageRows: Story = {
  render: () => (
    <FormHarness
      defaultValues={{
        languages: { entries: [{ language: 'common' }] },
      }}
    >
      <MonsterCreatureDetailsLanguagesSlot ctx={mockCtx} />
    </FormHarness>
  ),
}
