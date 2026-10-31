import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormProvider, useForm } from 'react-hook-form'

import { buildSeedDamageTypeVocabulary } from '@/features/vocabulary'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { useMonsterActionSections } from '../../hooks/use-monster-action-sections'
import type { MonsterActionDraftRow } from '../../lib/actions/monster-action-presets'
import {
  resolveMonsterCreateDefaultValues,
  type MonsterFormValues,
} from '../../lib/monster-form-values'
import { MonsterActionDetail } from './monster-action-detail'

const meta = {
  title: 'Dashboard/Content/Monsters/MonsterActionDetail',
  component: MonsterActionDetail,
} satisfies Meta<typeof MonsterActionDetail>

export default meta

type Story = StoryObj<typeof meta>

const ctx = {
  entityCatalogLayer: 'homebrew',
  equipmentCatalogStatus: 'ready',
  equipmentCatalogById: new Map(),
  damageTypeVocabulary: buildSeedDamageTypeVocabulary(),
} as ContentFormCtx

function Host({ action }: { action: MonsterActionDraftRow }) {
  const values = resolveMonsterCreateDefaultValues()
  values.actions = [action]
  const form = useForm<MonsterFormValues>({ shouldUnregister: true, defaultValues: values })
  return (
    <FormProvider {...form}>
      <Detail actionId={action.id} />
    </FormProvider>
  )
}

function Detail({ actionId }: { actionId: string }) {
  const sections = useMonsterActionSections()
  return <MonsterActionDetail ctx={ctx} sections={sections} located={sections.locate(actionId)} />
}

const claw: MonsterActionDraftRow = {
  id: 'claw',
  kind: 'natural-weapon',
  name: 'Claw',
  mode: 'melee',
  reach: 5,
  damageType: 'slashing',
  damage: { dice: { count: 1, faces: 6 } },
}

export const Claw: Story = {
  args: { ctx, sections: undefined as never, located: null },
  render: () => <Host action={claw} />,
}

export const WithDescriptionAndOnHit: Story = {
  args: { ctx, sections: undefined as never, located: null },
  render: () => (
    <Host
      action={{
        ...claw,
        description: '<p>Rakes with both claws.</p>',
        onHit: {
          additionalDamage: [{ damageType: 'poison', roll: { dice: { count: 1, faces: 4 } } }],
        },
      }}
    />
  ),
}
