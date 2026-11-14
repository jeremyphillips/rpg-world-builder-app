import {
  buildContentPurposeSelectors,
  collectMonsterClassificationIssues,
  addApiValidationIssueToRefinement,
} from '@rpg/contracts'
import { Form } from '@rpg/ui/form'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { makeCharacterClass } from '@/test/fixtures/factories/character-class'
import { buildContentFormOptionSets } from '../../lib/form-options/content-form-options'
import { buildSeedCreatureFamilyVocabulary } from '@/features/vocabulary'
import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import {
  monsterClassificationFields,
  monsterFamilyFieldOptions,
  monsterClassFieldOptions,
} from './monster-classification-fields'
import { normalizeMonsterFormValues } from './normalize-monster-form-values'
import { monsterToFormValues, resolveMonsterCreateDefaultValues } from './monster-form-values'
import { buildMonsterPreviewIdentity } from './monster-form-preview'
import { pickMonster } from '@/test/fixtures/pick'

const wizard = makeCharacterClass({ id: 'custom:wizard', name: 'Wizard' })
const ctx: ContentFormCtx = {
  creatureFamilyVocabulary: buildSeedCreatureFamilyVocabulary(),
  options: buildContentFormOptionSets({ classes: [wizard] }),
}
const schema = z.object({
  creatureType: z.string(),
  creatureFamilyIds: z.array(z.string()).optional(),
  classIds: z.array(z.string()).optional(),
})

describe('monster classification authoring', () => {
  it('filters new families while retaining incompatible and unresolved selections', () => {
    const options = monsterFamilyFieldOptions(ctx, 'monstrosity', ['demon', 'missing'])
    expect(options.map((row) => row.value)).toEqual(
      expect.arrayContaining(['lycanthrope', 'titan', 'demon', 'missing']),
    )
    expect(options.find((row) => row.value === 'chromatic')).toBeUndefined()
    expect(options.find((row) => row.value === 'demon')?.label).toContain('Incompatible')
    expect(options.find((row) => row.value === 'missing')?.label).toContain('Unresolved')
    expect(monsterClassFieldOptions(ctx).map((row) => row.value)).toEqual([wizard.id])
  })
  it('retains draft class classifications visibly without offering them as new choices', () => {
    const draft = makeCharacterClass({ id: 'custom:draft', name: 'Draft Wizard', status: 'draft' })
    const options = monsterClassFieldOptions(
      { options: { classes: buildContentPurposeSelectors([draft]) } },
      [draft.id],
    )
    expect(options).toEqual([
      expect.objectContaining({ value: draft.id, label: expect.stringContaining('Draft') }),
    ])
  })
  it('keeps authored families when the creature type changes in the live form', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(
      <Form
        schema={schema}
        fields={[
          { type: 'text', name: 'creatureType', label: 'Creature type' },
          ...monsterClassificationFields(ctx),
        ]}
        defaultValues={{
          creatureType: 'fiend',
          creatureFamilyIds: ['demon'],
          classIds: [wizard.id],
        }}
        onSubmit={onSubmit}
        footer={<button type="submit">Save</button>}
      />,
    )
    await user.clear(screen.getByRole('textbox', { name: 'Creature type' }))
    await user.type(screen.getByRole('textbox', { name: 'Creature type' }), 'dragon')
    expect(screen.getByText(/Demon.*Incompatible creature type/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({
      creatureType: 'dragon',
      creatureFamilyIds: ['demon'],
      classIds: [wizard.id],
    })
  })
  it('shows publish errors on a multi-select with an indexed invalid reference', async () => {
    const user = userEvent.setup()
    const publishSchema = schema.superRefine((values, refinement) => {
      for (const issue of collectMonsterClassificationIssues(
        values,
        { creatureFamilies: ctx.creatureFamilyVocabulary!.byId },
        'publish',
      )) {
        addApiValidationIssueToRefinement(refinement, issue)
      }
    })
    render(
      <Form
        schema={publishSchema}
        fields={monsterClassificationFields(ctx)}
        defaultValues={{ creatureType: 'dragon', creatureFamilyIds: ['demon'] }}
        onSubmit={vi.fn()}
        footer={<button type="submit">Publish</button>}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Publish' }))
    expect(
      await screen.findByText(
        'This creature family is not compatible with the chosen creature type.',
      ),
    ).toBeInTheDocument()
  })

  it('round trips stored refs, formats preview, and explicitly clears persisted selections', () => {
    const monster = { ...pickMonster('lich'), creatureFamilyIds: ['titan'], classIds: [wizard.id] }
    const values = monsterToFormValues(monster)
    expect(normalizeMonsterFormValues(values, { intent: 'draft' })).toMatchObject({
      creatureFamilyIds: ['titan'],
      classIds: [wizard.id],
    })
    expect(buildMonsterPreviewIdentity(values, ctx).facts?.[0]?.value).toContain('(Titan, Wizard)')
    const cleared = normalizeMonsterFormValues(
      { ...values, creatureFamilyIds: [], classIds: [] },
      {
        intent: 'draft',
        mode: 'update',
        baseline: { creatureFamilyIds: ['titan'], classIds: [wizard.id] },
      },
    )
    expect(cleared).toMatchObject({ creatureFamilyIds: null, classIds: null })
    expect(
      normalizeMonsterFormValues(resolveMonsterCreateDefaultValues(), { intent: 'draft' }),
    ).not.toHaveProperty('creatureFamilyIds')
  })
  it('reports compatibility at the selected family path without changing input', () => {
    const body = { creatureType: 'dragon', creatureFamilyIds: ['demon'] }
    expect(
      collectMonsterClassificationIssues(
        body,
        { creatureFamilies: ctx.creatureFamilyVocabulary!.byId },
        'publish',
      ),
    ).toEqual([expect.objectContaining({ path: 'creatureFamilyIds.0' })])
    expect(body.creatureFamilyIds).toEqual(['demon'])
  })
})
