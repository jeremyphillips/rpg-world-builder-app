import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { BUILDER_STEP_CHOOSE_CLASS_PROMPT_ACTION_LABEL } from '../../../../lib/builder/builder-step-choose-class-prompt.lib'
import {
  EQUIPMENT_CHOOSE_CLASS_PROMPT_DESCRIPTION,
  EQUIPMENT_CHOOSE_CLASS_PROMPT_HEADING,
} from '../../../../lib/equipment/equipment-step.lib'
import { BuilderStepChooseClassPrompt } from './builder-step-choose-class-prompt'

describe('BuilderStepChooseClassPrompt', () => {
  it('renders the prompt card and navigates to the class step', async () => {
    const user = userEvent.setup()
    const onNavigateToStep = vi.fn()

    render(
      <BuilderStepChooseClassPrompt
        heading={EQUIPMENT_CHOOSE_CLASS_PROMPT_HEADING}
        description={EQUIPMENT_CHOOSE_CLASS_PROMPT_DESCRIPTION}
        onNavigateToStep={onNavigateToStep}
      />,
    )

    expect(
      screen.getByRole('heading', { level: 3, name: EQUIPMENT_CHOOSE_CLASS_PROMPT_HEADING }),
    ).toHaveClass('ui-card__title')
    expect(screen.getByText(EQUIPMENT_CHOOSE_CLASS_PROMPT_DESCRIPTION)).toHaveClass(
      'ui-card__description',
    )
    expect(screen.getByText(EQUIPMENT_CHOOSE_CLASS_PROMPT_HEADING).parentElement).toHaveClass(
      'flex',
      'min-w-0',
      'flex-1',
      'flex-col',
      'gap-1',
    )

    const action = screen.getByRole('button', {
      name: BUILDER_STEP_CHOOSE_CLASS_PROMPT_ACTION_LABEL,
    })
    expect(action).toHaveClass(
      'text-action-standalone',
      'text-primary',
      'ui-button--text',
      'ui-button__text--default',
    )

    await user.click(action)

    expect(onNavigateToStep).toHaveBeenCalledWith('class')
  })
})
