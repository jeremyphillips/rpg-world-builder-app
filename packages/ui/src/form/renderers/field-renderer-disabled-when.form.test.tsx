import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import type { FormItem } from '../field-config'
import { Form } from '../shells/form.client'
import { submitAndExpectPayload } from '../test-utils'

beforeAll(() => {
  if (!HTMLElement.prototype.hasPointerCapture) {
    HTMLElement.prototype.hasPointerCapture = () => false
  }
  if (!HTMLElement.prototype.setPointerCapture) {
    HTMLElement.prototype.setPointerCapture = () => {}
  }
  if (!HTMLElement.prototype.releasePointerCapture) {
    HTMLElement.prototype.releasePointerCapture = () => {}
  }
  if (!HTMLElement.prototype.scrollIntoView) {
    HTMLElement.prototype.scrollIntoView = () => {}
  }
})

const lockField: FormItem = {
  type: 'switch',
  name: 'lock',
  label: 'Lock',
  defaultValue: false,
}

function disabledWhenLocked() {
  return {
    dependsOn: ['lock'],
    disabledWhen: (values: Record<string, unknown>) => values.lock === true,
  }
}

describe('disabledWhen across renderer families', () => {
  it('keeps a select registered, then accepts a new value after the predicate clears', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const fields: FormItem[] = [
      lockField,
      {
        type: 'select',
        name: 'rarity',
        label: 'Rarity',
        defaultValue: 'common',
        options: [
          { value: 'common', label: 'Common' },
          { value: 'rare', label: 'Rare' },
        ],
        interactivity: disabledWhenLocked(),
      },
    ]

    render(
      <Form
        schema={z.object({ lock: z.boolean(), rarity: z.string() })}
        fields={fields}
        footer={<button type="submit">Save</button>}
        onSubmit={onSubmit}
      />,
    )

    const rarity = screen.getByRole('combobox', { name: 'Rarity' })
    expect(rarity).toBeEnabled()
    await user.click(screen.getByRole('switch', { name: 'Lock' }))
    expect(rarity).toBeDisabled()
    await submitAndExpectPayload(user, onSubmit, { lock: true, rarity: 'common' })

    await user.click(screen.getByRole('switch', { name: 'Lock' }))
    expect(rarity).toBeEnabled()
    await user.click(rarity)
    await user.click(screen.getByRole('option', { name: 'Rare' }))
    await submitAndExpectPayload(user, onSubmit, { lock: false, rarity: 'rare' }, { times: 2 })
  })

  it('keeps text suggestions registered, then accepts input after the predicate clears', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const fields: FormItem[] = [
      lockField,
      {
        type: 'textSuggestions',
        name: 'epithet',
        label: 'Epithet',
        defaultValue: 'ash',
        suggestions: { dependsOn: [], suggestionsWhen: () => ['ash', 'oak'] },
        interactivity: disabledWhenLocked(),
      },
    ]

    render(
      <Form
        schema={z.object({ lock: z.boolean(), epithet: z.string() })}
        fields={fields}
        footer={<button type="submit">Save</button>}
        onSubmit={onSubmit}
      />,
    )

    const epithet = screen.getByRole('textbox', { name: 'Epithet' })
    expect(epithet).toBeEnabled()
    await user.click(screen.getByRole('switch', { name: 'Lock' }))
    expect(epithet).toBeDisabled()
    await submitAndExpectPayload(user, onSubmit, { lock: true, epithet: 'ash' })

    await user.click(screen.getByRole('switch', { name: 'Lock' }))
    expect(epithet).toBeEnabled()
    await user.click(epithet)
    await user.keyboard('{Control>}a{/Control}oak')
    await submitAndExpectPayload(user, onSubmit, { lock: false, epithet: 'oak' }, { times: 2 })
  })

  it('keeps an input-select value registered, then accepts input after the predicate clears', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const fields: FormItem[] = [
      lockField,
      {
        type: 'inputSelect',
        name: 'cost',
        label: 'Cost',
        inputType: 'number',
        valueKey: 'amount',
        unitKey: 'currency',
        options: [
          { value: 'gp', label: 'GP' },
          { value: 'sp', label: 'SP' },
        ],
        defaultValue: { amount: 4, currency: 'gp' },
        interactivity: disabledWhenLocked(),
      },
    ]

    render(
      <Form
        schema={z.object({
          lock: z.boolean(),
          cost: z.object({ amount: z.number(), currency: z.string() }),
        })}
        fields={fields}
        footer={<button type="submit">Save</button>}
        onSubmit={onSubmit}
      />,
    )

    const amount = screen.getByRole('spinbutton', { name: /Cost value/ })
    expect(amount).toBeEnabled()
    await user.click(screen.getByRole('switch', { name: 'Lock' }))
    expect(amount).toBeDisabled()
    await submitAndExpectPayload(user, onSubmit, {
      lock: true,
      cost: { amount: 4, currency: 'gp' },
    })

    await user.click(screen.getByRole('switch', { name: 'Lock' }))
    expect(amount).toBeEnabled()
    await user.click(amount)
    await user.keyboard('{Control>}a{/Control}9')
    await submitAndExpectPayload(
      user,
      onSubmit,
      { lock: false, cost: { amount: 9, currency: 'gp' } },
      { times: 2 },
    )
  })
})
