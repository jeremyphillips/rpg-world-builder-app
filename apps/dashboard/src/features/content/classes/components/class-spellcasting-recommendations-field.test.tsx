import { render, screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import { buildContentFormOptionSets } from '../../lib/form-options/content-form-options'
import { makeContentFormCtx } from '../../lib/fixtures/content-form-ctx'
import { makeSpell } from '@/test/fixtures/factories/spell'
import { SPELLCASTING_RECOMMENDATION_TARGET_LABELS } from '../lib/class-spellcasting-recommendations-field.lib'
import { ClassSpellcastingRecommendationsField } from './class-spellcasting-recommendations-field'

const spellCatalog = [
  makeSpell({ slug: 'dancing-lights', name: 'Dancing Lights', level: 0 }),
  makeSpell({ slug: 'vicious-mockery', name: 'Vicious Mockery', level: 0 }),
  makeSpell({ slug: 'charm-person', name: 'Charm Person', level: 1 }),
]

const formCtx = makeContentFormCtx({
  options: buildContentFormOptionSets({ spells: spellCatalog }),
})

describe('ClassSpellcastingRecommendationsField', () => {
  it('renders recommendation editors with stored spell selections', () => {
    const Harness = () => {
      const form = useForm({
        defaultValues: {
          spellcasting: {
            recommendations: [
              { target: 'cantrips', classLevel: 1, spellIds: ['dancing-lights'] },
              {
                target: 'level1Plus',
                classLevel: 1,
                spellLevel: 1,
                spellIds: ['charm-person'],
              },
            ],
          },
        },
      })

      return (
        <FormProvider {...form}>
          <ClassSpellcastingRecommendationsField formCtx={formCtx} />
        </FormProvider>
      )
    }

    render(<Harness />)

    expect(
      screen.getByText(
        'Recommended starting spells appear as badges in the character builder spell picker. They do not grant spells or change quotas.',
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByLabelText(SPELLCASTING_RECOMMENDATION_TARGET_LABELS.cantrips),
    ).toBeInTheDocument()
    expect(
      screen.getByLabelText(SPELLCASTING_RECOMMENDATION_TARGET_LABELS.level1Plus),
    ).toBeInTheDocument()
    expect(screen.getByText('Dancing Lights')).toBeInTheDocument()
    expect(screen.getByText('Charm Person')).toBeInTheDocument()
  })
})
