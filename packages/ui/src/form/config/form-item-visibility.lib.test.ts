import { describe, expect, it } from 'vitest'

import type { FormItem } from '../field-config'
import {
  collectHiddenFormItemBoundNames,
  formItemsHaveVisibleRenderableFields,
} from './form-item-visibility.lib'

const sizeRow: FormItem = {
  kind: 'row',
  heading: { label: 'Eligible sizes' },
  visibility: {
    dependsOn: ['kind'],
    visibleWhen: (values) => values.kind === 'size',
  },
  fields: [
    { type: 'select', name: 'bound', label: 'Size', options: [] },
    { type: 'select', name: 'comparison', label: 'Size limit', options: [] },
  ],
}

const willingOnlyFields: FormItem[] = [
  sizeRow,
  {
    type: 'checkbox',
    name: 'willing',
    label: 'Also allow willing creatures',
    visibility: {
      dependsOn: ['kind', 'presence'],
      visibleWhen: (values) =>
        values.kind === 'any-of' || (values.kind === 'condition' && values.presence !== 'lacks'),
    },
  },
]

describe('formItemsHaveVisibleRenderableFields', () => {
  it('returns false for summary-only willing and sight rows with hidden size row', () => {
    expect(formItemsHaveVisibleRenderableFields(willingOnlyFields, { kind: 'willing' })).toBe(false)
    expect(formItemsHaveVisibleRenderableFields(willingOnlyFields, { kind: 'sight' })).toBe(false)
  })

  it('returns true for editable size rows behind a visible row container', () => {
    expect(
      formItemsHaveVisibleRenderableFields(willingOnlyFields, {
        kind: 'size',
        comparison: 'or-smaller',
      }),
    ).toBe(true)
  })

  it('returns false for a hidden row even when leaves have no visibility', () => {
    const fields: FormItem[] = [
      {
        kind: 'row',
        visibility: {
          dependsOn: ['show'],
          visibleWhen: (values) => values.show === true,
        },
        fields: [
          { type: 'text', name: 'detail', label: 'Detail' },
          { type: 'text', name: 'notes', label: 'Notes' },
        ],
      },
    ]
    expect(formItemsHaveVisibleRenderableFields(fields, { show: false })).toBe(false)
    expect(formItemsHaveVisibleRenderableFields(fields, { show: true })).toBe(true)
  })

  it('returns false for a visible row when every leaf is hidden', () => {
    const fields: FormItem[] = [
      {
        kind: 'row',
        fields: [
          {
            type: 'text',
            name: 'detail',
            label: 'Detail',
            visibility: {
              dependsOn: ['enabled'],
              visibleWhen: (values) => values.enabled === true,
            },
          },
        ],
      },
    ]
    expect(formItemsHaveVisibleRenderableFields(fields, { enabled: false })).toBe(false)
  })

  it('traverses nested groups and columns', () => {
    const fields: FormItem[] = [
      {
        kind: 'group',
        visibility: {
          dependsOn: ['mode'],
          visibleWhen: (values) => values.mode === 'advanced',
        },
        fields: [
          {
            kind: 'columns',
            columns: [
              {
                fields: [
                  {
                    type: 'text',
                    name: 'left',
                    label: 'Left',
                    visibility: {
                      dependsOn: ['showLeft'],
                      visibleWhen: (values) => values.showLeft === true,
                    },
                  },
                ],
              },
              {
                fields: [{ type: 'text', name: 'right', label: 'Right' }],
              },
            ],
          },
        ],
      },
    ]
    expect(formItemsHaveVisibleRenderableFields(fields, { mode: 'simple' })).toBe(false)
    expect(
      formItemsHaveVisibleRenderableFields(fields, {
        mode: 'advanced',
        showLeft: false,
      }),
    ).toBe(true)
    expect(
      formItemsHaveVisibleRenderableFields(fields, {
        mode: 'advanced',
        showLeft: false,
      }),
    ).toBe(true)
  })

  it('respects dependent controller and dependents gating', () => {
    const fields: FormItem[] = [
      {
        kind: 'dependent',
        controller: { type: 'switch', name: 'featureEnabled', label: 'Enable' },
        dependents: {
          fields: [{ type: 'text', name: 'detail', label: 'Detail' }],
        },
      },
    ]
    expect(formItemsHaveVisibleRenderableFields(fields, { featureEnabled: false })).toBe(true)
    expect(formItemsHaveVisibleRenderableFields(fields, { featureEnabled: true })).toBe(true)
  })

  it('returns true for flat leaves without containers', () => {
    const fields: FormItem[] = [{ type: 'text', name: 'title', label: 'Title' }]
    expect(formItemsHaveVisibleRenderableFields(fields, {})).toBe(true)
  })
})

describe('collectHiddenFormItemBoundNames', () => {
  it('hides row descendants when the row container is hidden', () => {
    const hidden = collectHiddenFormItemBoundNames(willingOnlyFields, { kind: 'willing' })
    expect(hidden).toEqual(expect.arrayContaining(['bound', 'comparison']))
  })
})
