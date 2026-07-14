import { describe, expect, it } from 'vitest'
import type { Control } from 'react-hook-form'

import { registerArrayFieldMutators } from '@rpg/ui/form'

import { RESOLUTION_FORM_FIXTURES } from '../../fixtures'
import { readResolutionValues } from './resolution-change-form-read.lib'
import { RESOLUTION_FIELD_NAME } from './resolution-form-values'

describe('readResolutionValues', () => {
  const eldritchBlast = RESOLUTION_FORM_FIXTURES.eldritchBlast

  it('returns undefined when resolution is absent', () => {
    const getValues = (name?: string) => (name ? undefined : {})
    expect(readResolutionValues(getValues)).toBeUndefined()
  })

  it('reads resolution from the named field', () => {
    const getValues = (name?: string) => {
      if (!name) return {}
      if (name === RESOLUTION_FIELD_NAME) return eldritchBlast
      return undefined
    }

    const result = readResolutionValues(getValues)
    expect(result?.effects).toEqual(eldritchBlast.effects)
    expect(result?.outcomes).toEqual(eldritchBlast.outcomes)
  })

  it('falls back to root.resolution when the named field is unset', () => {
    const getValues = (name?: string) => {
      if (!name) return { resolution: eldritchBlast }
      if (name === `${RESOLUTION_FIELD_NAME}.effects`) return eldritchBlast.effects
      if (name === `${RESOLUTION_FIELD_NAME}.outcomes`) return eldritchBlast.outcomes
      return undefined
    }

    const result = readResolutionValues(getValues)
    expect(result?.effects).toEqual(eldritchBlast.effects)
    expect(result?.outcomes).toEqual(eldritchBlast.outcomes)
  })

  it('uses initialResolution when live values are missing', () => {
    const getValues = (name?: string) => (name ? undefined : {})
    const result = readResolutionValues(getValues, undefined, eldritchBlast)
    expect(result).toEqual(eldritchBlast)
  })

  it('prefers field-array mutators for effects over nested getValues', () => {
    const control = {} as Control
    const liveEffects = eldritchBlast.effects.slice(0, 1)
    const unregister = registerArrayFieldMutators(control, `${RESOLUTION_FIELD_NAME}.effects`, {
      getValues: () => liveEffects,
      remove: () => undefined,
      append: () => undefined,
    })

    const getValues = (name?: string) => {
      if (!name) return {}
      if (name === RESOLUTION_FIELD_NAME) return eldritchBlast
      if (name === `${RESOLUTION_FIELD_NAME}.effects`) return eldritchBlast.effects
      return undefined
    }

    try {
      const result = readResolutionValues(getValues, control)
      expect(result?.effects).toEqual(liveEffects)
    } finally {
      unregister()
    }
  })

  it('falls back to initialResolution effects when live effects are empty', () => {
    const emptyResolution = { ...eldritchBlast, effects: [] }
    const getValues = (name?: string) => {
      if (!name) return {}
      if (name === RESOLUTION_FIELD_NAME) return emptyResolution
      if (name === `${RESOLUTION_FIELD_NAME}.effects`) return []
      return undefined
    }

    const result = readResolutionValues(getValues, undefined, eldritchBlast)
    expect(result?.effects).toEqual(eldritchBlast.effects)
  })
})
