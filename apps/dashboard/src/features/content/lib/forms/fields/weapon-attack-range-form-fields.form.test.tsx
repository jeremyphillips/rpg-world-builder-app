import {
  equipmentVariantValidationMessages,
  formatFieldMessage,
  getWeaponModeLabel,
  weaponRangeSchema,
  WEAPON_MODES,
} from '@rpg/contracts'
import { combineFieldVisibilityAll, Form, type FormItem } from '@rpg/ui/form'
import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { z } from 'zod'

import {
  attackRangeJoinedPairFields,
  weaponAttackRangeGroup,
} from './weapon-attack-range-form-fields'
import {
  MONSTER_ACTION_DISTANCE_SECTION_LEGEND,
  MONSTER_ACTION_LONG_RANGE_LABEL,
  MONSTER_ACTION_NORMAL_RANGE_LABEL,
  MONSTER_ACTION_REACH_FIELD_LABEL,
} from '../../../monsters/lib/monster-form-labels'

const longRangeMessage = formatFieldMessage(
  equipmentVariantValidationMessages.longRangeExceedsNormal(),
)

const reachFeetOptions = [5, 10, 15].map((feet) => ({ value: feet, label: String(feet) }))

const schema = z.object({
  range: weaponRangeSchema,
  modes: z.array(z.string()).optional(),
  reach: z.number().optional(),
})

function arrayIncludes(value: unknown, mode: string): boolean {
  return Array.isArray(value) && value.includes(mode)
}

function monsterDistanceFields(): FormItem {
  const meleeVisibility = {
    dependsOn: ['modes'] as const,
    visibleWhen: (values: Record<string, unknown>) => arrayIncludes(values.modes, 'melee'),
  }
  const rangedVisibility = {
    dependsOn: ['modes'] as const,
    visibleWhen: (values: Record<string, unknown>) => arrayIncludes(values.modes, 'ranged'),
  }
  const reach = {
    type: 'joinedPair' as const,
    label: MONSTER_ACTION_REACH_FIELD_LABEL,
    width: 'auto' as const,
    start: {
      kind: 'select' as const,
      name: 'reach',
      options: reachFeetOptions,
      digits: 2 as const,
      placeholder: '5',
      ariaLabel: 'Reach value',
    },
    end: {
      kind: 'label' as const,
      text: 'ft.',
      ariaLabel: 'Reach unit',
    },
  }
  const rangeFields = attackRangeJoinedPairFields({
    normalName: 'range.normal',
    longName: 'range.long',
    normalRequired: true,
    normalLabel: MONSTER_ACTION_NORMAL_RANGE_LABEL,
    longLabel: MONSTER_ACTION_LONG_RANGE_LABEL,
  }).map((field) => ({
    ...field,
    visibility: field.visibility
      ? combineFieldVisibilityAll(field.visibility, rangedVisibility)
      : rangedVisibility,
  }))

  return {
    kind: 'group',
    legend: MONSTER_ACTION_DISTANCE_SECTION_LEGEND,
    visibility: {
      dependsOn: ['modes'],
      visibleWhen: (values) =>
        Array.isArray(values.modes) &&
        (values.modes.includes('melee') || values.modes.includes('ranged')),
    },
    fields: [
      {
        kind: 'row',
        visibility: {
          dependsOn: ['modes'],
          visibleWhen: (values) =>
            arrayIncludes(values.modes, 'melee') && arrayIncludes(values.modes, 'ranged'),
        },
        fields: [{ ...reach, visibility: meleeVisibility }, ...rangeFields],
      },
      {
        kind: 'row',
        visibility: {
          dependsOn: ['modes'],
          visibleWhen: (values) =>
            arrayIncludes(values.modes, 'melee') && !arrayIncludes(values.modes, 'ranged'),
        },
        fields: [{ ...reach, visibility: meleeVisibility }],
      },
      {
        kind: 'row',
        visibility: {
          dependsOn: ['modes'],
          visibleWhen: (values) =>
            arrayIncludes(values.modes, 'ranged') && !arrayIncludes(values.modes, 'melee'),
        },
        fields: rangeFields,
      },
    ],
  }
}

function rangeFields(): FormItem[] {
  return [
    weaponAttackRangeGroup({
      normalName: 'range.normal',
      longName: 'range.long',
    }),
  ]
}

describe('weaponAttackRangeGroup form', () => {
  it('hides long range behind add until opened', () => {
    render(
      <Form
        schema={schema}
        fields={rangeFields()}
        defaultValues={{ range: { normal: 60 } }}
        onSubmit={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: 'Add long range' })).toBeInTheDocument()
    expect(screen.queryByRole('combobox', { name: 'Long value' })).not.toBeInTheDocument()
  })

  it('hides add long range until normal is chosen', () => {
    render(
      <Form
        schema={schema}
        fields={rangeFields()}
        defaultValues={{ range: { normal: undefined } }}
        onSubmit={vi.fn()}
      />,
    )
    expect(screen.queryByRole('button', { name: 'Add long range' })).not.toBeInTheDocument()
  })

  it('hides add when no greater presets exist', () => {
    render(
      <Form
        schema={schema}
        fields={rangeFields()}
        defaultValues={{ range: { normal: 600 } }}
        onSubmit={vi.fn()}
      />,
    )
    expect(screen.queryByRole('button', { name: 'Add long range' })).not.toBeInTheDocument()
  })

  it('keeps long visible when normal clears but long is authored', () => {
    render(
      <Form
        schema={schema}
        fields={rangeFields()}
        defaultValues={{ range: { normal: undefined, long: 240 } }}
        onSubmit={vi.fn()}
      />,
    )
    expect(screen.queryByRole('button', { name: 'Add long range' })).not.toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Long value' })).toHaveTextContent('240')
  })

  it('opens an empty long select after add long range', async () => {
    const user = userEvent.setup()
    render(
      <Form
        schema={schema}
        fields={rangeFields()}
        defaultValues={{ range: { normal: 60 } }}
        onSubmit={vi.fn()}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Add long range' }))
    const long = screen.getByRole('combobox', { name: 'Long value' })
    expect(long).toBeInTheDocument()
    expect(long).not.toHaveTextContent('60')
  })

  it('keeps an invalid long visible after normal increases', async () => {
    const user = userEvent.setup()
    render(
      <Form
        schema={schema}
        fields={rangeFields()}
        defaultValues={{ range: { normal: 150, long: 120 } }}
        onSubmit={vi.fn()}
        mode="onChange"
        footer={<button type="submit">Save</button>}
      />,
    )
    expect(screen.getByRole('combobox', { name: 'Long value' })).toHaveTextContent('120')
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(screen.getByText(longRangeMessage)).toBeInTheDocument()
  })

  it('clears long on remove', async () => {
    const user = userEvent.setup()
    render(
      <Form
        schema={schema}
        fields={rangeFields()}
        defaultValues={{ range: { normal: 60, long: 240 } }}
        onSubmit={vi.fn()}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Remove Long' }))
    await waitFor(() => {
      expect(screen.queryByRole('combobox', { name: 'Long value' })).not.toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: 'Add long range' })).toBeInTheDocument()
  })
})

describe('monster distance inline range form', () => {
  it('renders optional disclosure in an inline row with monster labels', async () => {
    const user = userEvent.setup()
    render(
      <Form
        schema={schema}
        fields={[monsterDistanceFields()]}
        defaultValues={{ modes: ['ranged'], range: { normal: 60 } }}
        onSubmit={vi.fn()}
      />,
    )
    expect(screen.getByText(MONSTER_ACTION_NORMAL_RANGE_LABEL)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add long range' })).toBeInTheDocument()
    expect(screen.queryByText(MONSTER_ACTION_REACH_FIELD_LABEL)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Add long range' }))
    expect(screen.getByRole('combobox', { name: 'Long range value' })).toBeInTheDocument()
  })

  it('shows melee and ranged controls in one row when both modes are selected', () => {
    render(
      <Form
        schema={schema}
        fields={[monsterDistanceFields()]}
        defaultValues={{ modes: ['melee', 'ranged'], range: { normal: 60 }, reach: 5 }}
        onSubmit={vi.fn()}
      />,
    )
    expect(screen.getByText(MONSTER_ACTION_REACH_FIELD_LABEL)).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Normal range value' })).toBeInTheDocument()
  })

  it('keeps authored range in form values after toggling melee and back to ranged-only', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const modeOptions = WEAPON_MODES.map((id) => ({ value: id, label: getWeaponModeLabel(id) }))
    render(
      <Form
        schema={schema.extend({ modes: z.array(z.string()).min(1) })}
        fields={[
          {
            type: 'chips',
            name: 'modes',
            label: 'Modes',
            options: modeOptions,
          },
          monsterDistanceFields(),
        ]}
        defaultValues={{
          modes: ['ranged'],
          range: { normal: 60, long: 120 },
        }}
        onSubmit={onSubmit}
        footer={<button type="submit">Save</button>}
      />,
    )
    expect(screen.getByRole('combobox', { name: 'Long range value' })).toHaveTextContent('120')

    await user.click(screen.getByRole('checkbox', { name: getWeaponModeLabel('ranged') }))
    await user.click(screen.getByRole('checkbox', { name: getWeaponModeLabel('melee') }))
    expect(screen.queryByRole('combobox', { name: 'Normal range value' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('checkbox', { name: getWeaponModeLabel('melee') }))
    await user.click(screen.getByRole('checkbox', { name: getWeaponModeLabel('ranged') }))
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        modes: ['ranged'],
        range: { normal: 60, long: 120 },
      }),
      expect.anything(),
    )
  })
})
