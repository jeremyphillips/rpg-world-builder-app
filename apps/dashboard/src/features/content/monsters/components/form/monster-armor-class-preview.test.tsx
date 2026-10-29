import { render, screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import { pickEquipment } from '@/test/fixtures/pick'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { createPlainMonsterEquipmentEntry } from '../../lib/equipment/monster-equipment-loadout.lib'
import {
  resolveMonsterCreateDefaultValues,
  type MonsterFormValues,
} from '../../lib/monster-form-values'
import { MonsterArmorClassPreview } from './monster-armor-class-preview'

const scaleMail = pickEquipment('scale-mail')
const shield = pickEquipment('shield')

const ctx = {
  equipmentCatalogStatus: 'ready',
  equipmentCatalogById: new Map([
    [scaleMail.id, scaleMail],
    [shield.id, shield],
  ]),
  skillCatalogStatus: 'ready',
} satisfies ContentFormCtx

function Host() {
  const defaults = resolveMonsterCreateDefaultValues()
  const form = useForm<MonsterFormValues>({
    defaultValues: {
      ...defaults,
      abilityScores: { ...defaults.abilityScores, dex: 18 },
      armorClass: { naturalArmorBonus: 3, useFixedAc: false },
      equipment: [
        createPlainMonsterEquipmentEntry(scaleMail.id),
        createPlainMonsterEquipmentEntry(shield.id),
      ],
    },
  })
  return (
    <FormProvider {...form}>
      <MonsterArmorClassPreview ctx={ctx} />
    </FormProvider>
  )
}

describe('MonsterArmorClassPreview', () => {
  it('shows the natural-versus-armor comparison and the DEX limit', () => {
    render(<Host />)

    expect(screen.getByText('Natural armor wins: 19 vs. 18 with scale mail.')).toBeInTheDocument()
    expect(screen.getByText('Scale mail limits the +4 DEX modifier to +2.')).toBeInTheDocument()
    expect(
      screen.getByText('Scale mail limits the +4 DEX modifier to +2.').closest('p'),
    ).toHaveClass('text-style-micro')
  })
})
