import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormProvider, useForm } from 'react-hook-form'

import { buildContentFormOptionSets } from '../../lib/form-options/content-form-options'
import { makeContentFormCtx } from '../../lib/fixtures/content-form-ctx'
import { makeSpell } from '@/test/fixtures/factories/spell'
import { ClassSpellcastingRecommendationsField } from './class-spellcasting-recommendations-field'

const meta = {
  title: 'Content/Classes/ClassSpellcastingRecommendationsField',
  component: ClassSpellcastingRecommendationsField,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ClassSpellcastingRecommendationsField>

export default meta
type Story = StoryObj

const spellCatalog = [
  makeSpell({ slug: 'dancing-lights', name: 'Dancing Lights', level: 0 }),
  makeSpell({ slug: 'vicious-mockery', name: 'Vicious Mockery', level: 0 }),
  makeSpell({ slug: 'charm-person', name: 'Charm Person', level: 1 }),
  makeSpell({ slug: 'healing-word', name: 'Healing Word', level: 1 }),
]

const formCtx = makeContentFormCtx({
  options: buildContentFormOptionSets({ spells: spellCatalog }),
})

function RecommendationsHarness() {
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

export const WithRecommendations: Story = {
  name: 'Cantrips and level 1 spells',
  render: () => <RecommendationsHarness />,
}
