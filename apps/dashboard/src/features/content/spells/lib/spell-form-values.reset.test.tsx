/**
 * @vitest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import { reincarnateSpeciesTableFixture } from '@rpg/contracts'
import { RICH_TEXT_TABLE_EMBED_ATTR } from '@rpg/ui'

import { makeSpell } from '@/test/fixtures/factories/spell'

import { spellToFormValues } from './spell-form-values'
import type { SpellFormValues } from './spell-form-fields'

const reincarnateEmbedHtml = `<div ${RICH_TEXT_TABLE_EMBED_ATTR}="reincarnate-species"></div>`

describe('spellToFormValues reset pair', () => {
  it('restores aligned description and tables after a dirty orphan state', () => {
    const stored = makeSpell({
      description: reincarnateEmbedHtml,
      tables: [reincarnateSpeciesTableFixture],
    })
    const baseline = spellToFormValues(stored)

    const { result } = renderHook(() =>
      useForm<SpellFormValues>({
        defaultValues: baseline,
      }),
    )

    act(() => {
      result.current.setValue('description', '<p>Embed removed.</p>', { shouldDirty: true })
      result.current.setValue('tables', [reincarnateSpeciesTableFixture], { shouldDirty: true })
    })

    expect(result.current.getValues('description')).toBe('<p>Embed removed.</p>')

    act(() => {
      result.current.reset(baseline)
    })

    expect(result.current.getValues('description')).toBe(reincarnateEmbedHtml)
    expect(result.current.getValues('tables')).toEqual([reincarnateSpeciesTableFixture])
  })
})
