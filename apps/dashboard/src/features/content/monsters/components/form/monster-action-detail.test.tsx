/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import { buildSeedDamageTypeVocabulary } from '@/features/vocabulary'
import { pickEquipment } from '@/test/fixtures/pick'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { useEmbeddedMasterDetailRows } from '../../../lib/master-detail/use-embedded-master-detail-rows'
import { useMonsterActionSections } from '../../hooks/use-monster-action-sections'
import { MONSTER_ACTION_ITEM_NOUN } from '../../lib/monster-form-labels'
import type { MonsterActionDraftRow } from '../../lib/actions/monster-action-presets'
import {
  resolveMonsterCreateDefaultValues,
  type MonsterFormValues,
} from '../../lib/monster-form-values'
import { MonsterActionDetail } from './monster-action-detail'

const shortbow = pickEquipment('shortbow')

function Host({
  action,
  equipped,
  catalogReady,
}: {
  action: MonsterActionDraftRow
  equipped: boolean
  catalogReady: boolean
}) {
  const values = resolveMonsterCreateDefaultValues()
  values.challengeRating = '1'
  values.abilityScores = { str: 16, dex: 14, con: 13, int: 8, wis: 11, cha: 8 }
  values.equipment = [{ entryId: 'bow', equipmentId: 'shortbow', quantity: 1, equipped }]
  values.actions = [action]
  const form = useForm<MonsterFormValues>({ defaultValues: values })
  const ctx = {
    entityCatalogLayer: 'homebrew',
    equipmentCatalogStatus: catalogReady ? 'ready' : 'pending',
    equipmentCatalogById: new Map([['shortbow', shortbow]]),
    damageTypeVocabulary: buildSeedDamageTypeVocabulary(),
  } as ContentFormCtx
  return (
    <FormProvider {...form}>
      <Detail ctx={ctx} actionId={action.id} />
    </FormProvider>
  )
}

function Detail({ ctx, actionId }: { ctx: ContentFormCtx; actionId: string }) {
  const sections = useMonsterActionSections()
  const located = sections.locate(actionId)
  const rows = useEmbeddedMasterDetailRows({
    formCtx: ctx,
    fieldName: located?.section ?? 'actions',
    editor: sections.editors[located?.section ?? 'actions'],
    itemFields: [],
    itemNoun: MONSTER_ACTION_ITEM_NOUN,
    mapListItem: ({ row, index }) => ({
      title: (row as { name?: string } | undefined)?.name?.trim() || `Action ${index + 1}`,
    }),
  })
  return <MonsterActionDetail ctx={ctx} sections={sections} located={located} rows={rows} />
}

const shot: MonsterActionDraftRow = {
  id: 'shot',
  kind: 'weapon',
  equipmentEntryId: 'bow',
}

describe('MonsterActionDetail advisories', () => {
  it('shows the attack panel and then the unequipped note', () => {
    render(<Host action={shot} equipped={false} catalogReady />)

    const preview = screen.getByText('Attack preview')
    const alert = screen.getByText(`${shortbow.name} is not equipped.`)
    expect(preview.closest('.ui-panel')).toBeTruthy()
    expect(preview.compareDocumentPosition(alert) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(alert.closest('.ui-alert')).toHaveClass('ui-alert--warning')
  })

  it('keeps the unequipped note when the attack profile is unavailable', () => {
    render(<Host action={shot} equipped={false} catalogReady={false} />)

    expect(screen.getByText(/Attack summary unavailable/)).toBeInTheDocument()
    expect(screen.queryByText('Attack preview')).not.toBeInTheDocument()
    expect(screen.getByText(`${shortbow.name} is not equipped.`)).toBeInTheDocument()
  })
})
