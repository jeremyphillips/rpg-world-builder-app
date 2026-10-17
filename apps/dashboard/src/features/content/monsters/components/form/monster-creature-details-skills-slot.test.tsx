import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import {
  resolveMonsterCreateDefaultValues,
  type MonsterFormValues,
} from '../../lib/monster-form-values'
import { MONSTER_SKILL_MODIFIER_UNAVAILABLE_TOOLTIP } from '../../lib/monster-form-labels'
import { MonsterCreatureDetailsSkillsSlot } from './monster-creature-details-skills-slot'

const mockCtx: ContentFormCtx = {
  campaignId: 'campaign-1',
  skillCatalogStatus: 'ready',
  equipmentCatalogStatus: 'ready',
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
}

function Harness({ defaultValues }: { defaultValues: Partial<MonsterFormValues> }) {
  const form = useForm<MonsterFormValues>({ defaultValues: defaultValues as MonsterFormValues })
  const rank = form.watch('proficiencies.skills.0.rank')
  return (
    <FormProvider {...form}>
      <MonsterCreatureDetailsSkillsSlot ctx={mockCtx} />
      <output data-testid="rank">{rank}</output>
    </FormProvider>
  )
}

const skillRowDefaults = {
  ...resolveMonsterCreateDefaultValues(),
  abilityScores: { str: 10, dex: 16, con: 10, int: 10, wis: 10, cha: 10 },
  proficiencies: {
    ...resolveMonsterCreateDefaultValues().proficiencies,
    skills: [{ skill: 'stealth', rank: 'proficient' as const }],
  },
}

describe('MonsterCreatureDetailsSkillsSlot', () => {
  it('shows a plain signed modifier when challenge rating resolves proficiency bonus', () => {
    render(
      <Harness
        defaultValues={{
          ...skillRowDefaults,
          challengeRating: '1',
        }}
      />,
    )

    const modifier = screen.getByText('+5')
    expect(modifier.tagName).toBe('SPAN')
    expect(modifier).toHaveClass('text-sm', 'mr-1')
    expect(screen.queryByRole('checkbox', { name: /Proficient/i })).not.toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Expertise' })).toHaveAttribute(
      'aria-checked',
      'false',
    )
  })

  it('toggles expertise without a challenge rating', async () => {
    const user = userEvent.setup()
    render(<Harness defaultValues={skillRowDefaults} />)

    await user.click(screen.getByRole('checkbox', { name: 'Expertise' }))
    expect(screen.getByTestId('rank')).toHaveTextContent('expertise')
    await user.click(screen.getByRole('checkbox', { name: 'Expertise' }))
    expect(screen.getByTestId('rank')).toHaveTextContent('proficient')
  })

  it('shows an em dash with tooltip hint when challenge rating is missing', () => {
    render(
      <Harness
        defaultValues={{
          ...skillRowDefaults,
          challengeRating: undefined,
        }}
      />,
    )

    const placeholder = screen.getByLabelText(MONSTER_SKILL_MODIFIER_UNAVAILABLE_TOOLTIP)
    expect(placeholder).toHaveTextContent('—')
    expect(placeholder).toHaveClass('cursor-pointer')
    expect(screen.getByText('DEX +3 · PB —')).toBeInTheDocument()
  })
})
