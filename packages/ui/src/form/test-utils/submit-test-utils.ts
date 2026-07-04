import { screen, waitFor } from '@testing-library/react'
import { expect, type Mock } from 'vitest'
import type { UserEvent } from '@testing-library/user-event'

export type SubmitAndExpectPayloadOptions = {
  /** Expected `onSubmit` call count after the click (default 1). */
  times?: number
  /** Accessible name of the submit button (default 'Save'). */
  buttonName?: string
  /** 'equal' → `toEqual`, 'object' → `toMatchObject` (default 'equal'). */
  match?: 'equal' | 'object'
}

/** Clicks the submit button, waits for `onSubmit`, and asserts the last payload. */
export async function submitAndExpectPayload(
  user: UserEvent,
  onSubmit: Mock,
  expected: unknown,
  { times = 1, buttonName = 'Save', match = 'equal' }: SubmitAndExpectPayloadOptions = {},
): Promise<void> {
  await user.click(screen.getByRole('button', { name: buttonName }))
  await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(times))
  if (match === 'object') {
    expect(onSubmit.mock.lastCall?.[0]).toMatchObject(expected as Record<string, unknown>)
  } else {
    expect(onSubmit.mock.lastCall?.[0]).toEqual(expected)
  }
}
