import { describe, expect, it } from 'vitest'

import type { FeatureRowForm } from '../class-feature-form-fields'
import {
  resolveDefaultFeatureLevel,
  resolveSubclassTabGate,
  resolveSubclassUsageMetaQuery,
} from './subclass-tab-state.lib'

function subclassChoiceFeature(level = 3): FeatureRowForm {
  return { name: 'Subclass', level, grants: [] }
}

describe('resolveSubclassUsageMetaQuery', () => {
  it('enables usage meta only in edit mode with campaign and class ids', () => {
    expect(resolveSubclassUsageMetaQuery('edit', 'campaign-1', 'class-1')).toEqual({
      campaignId: 'campaign-1',
      classId: 'class-1',
    })
  })

  it('disables usage meta in create mode', () => {
    expect(resolveSubclassUsageMetaQuery('create', 'campaign-1', 'class-1')).toEqual({
      campaignId: undefined,
      classId: undefined,
    })
  })
})

describe('resolveSubclassTabGate', () => {
  it('returns create when mode is create or ids are missing', () => {
    expect(
      resolveSubclassTabGate({
        mode: 'create',
        campaignId: 'campaign-1',
        classId: 'class-1',
        subclassChoiceFeature: subclassChoiceFeature(),
        isPending: false,
      }),
    ).toBe('create')

    expect(
      resolveSubclassTabGate({
        mode: 'edit',
        campaignId: undefined,
        classId: 'class-1',
        subclassChoiceFeature: subclassChoiceFeature(),
        isPending: false,
      }),
    ).toBe('create')
  })

  it('returns choice-level when subclass choice feature is missing', () => {
    expect(
      resolveSubclassTabGate({
        mode: 'edit',
        campaignId: 'campaign-1',
        classId: 'class-1',
        subclassChoiceFeature: undefined,
        isPending: false,
      }),
    ).toBe('choice-level')
  })

  it('returns loading while subclasses query is pending', () => {
    expect(
      resolveSubclassTabGate({
        mode: 'edit',
        campaignId: 'campaign-1',
        classId: 'class-1',
        subclassChoiceFeature: subclassChoiceFeature(),
        isPending: true,
      }),
    ).toBe('loading')
  })

  it('returns null when body can render', () => {
    expect(
      resolveSubclassTabGate({
        mode: 'edit',
        campaignId: 'campaign-1',
        classId: 'class-1',
        subclassChoiceFeature: subclassChoiceFeature(),
        isPending: false,
      }),
    ).toBeNull()
  })
})

describe('resolveDefaultFeatureLevel', () => {
  it('returns null when subclass choice feature is missing', () => {
    expect(resolveDefaultFeatureLevel(undefined)).toBeNull()
  })

  it('returns numeric level from subclass choice feature', () => {
    expect(resolveDefaultFeatureLevel(subclassChoiceFeature(3))).toBe(3)
  })
})
