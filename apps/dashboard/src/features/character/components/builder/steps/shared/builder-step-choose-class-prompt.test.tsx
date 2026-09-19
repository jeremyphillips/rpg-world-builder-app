import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { BUILDER_STEP_CHOOSE_CLASS_PROMPT_ACTION_LABEL } from '../../../../lib/builder/builder-step-choose-class-prompt.lib'
import {
  EQUIPMENT_CHOOSE_CLASS_PROMPT_DESCRIPTION,
  EQUIPMENT_CHOOSE_CLASS_PROMPT_HEADING,
} from '../../../../lib/equipment/equipment-step.lib'
import { BuilderStepChooseClassPrompt } from './builder-step-choose-class-prompt'
import {
  builderStepChooseClassPromptContentClasses,
  builderStepChooseClassPromptHeadingClasses,
  builderStepChooseClassPromptSubheadingClasses,
  builderStepChooseClassPromptTextStackClasses,
} from './builder-step-choose-class-prompt.variants'

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
      screen.getByRole('heading', { level: 2, name: EQUIPMENT_CHOOSE_CLASS_PROMPT_HEADING }),
    ).toHaveClass(builderStepChooseClassPromptHeadingClasses)
    expect(screen.getByText(EQUIPMENT_CHOOSE_CLASS_PROMPT_DESCRIPTION)).toHaveClass(
      builderStepChooseClassPromptSubheadingClasses,
    )
    expect(screen.getByText(EQUIPMENT_CHOOSE_CLASS_PROMPT_DESCRIPTION).closest('div')).toHaveClass(
      builderStepChooseClassPromptTextStackClasses,
    )
    expect(
      screen.getByText(EQUIPMENT_CHOOSE_CLASS_PROMPT_HEADING).closest('div')?.parentElement,
    ).toHaveClass(builderStepChooseClassPromptContentClasses)

    const action = screen.getByRole('button', {
      name: BUILDER_STEP_CHOOSE_CLASS_PROMPT_ACTION_LABEL,
    })
    expect(action).toHaveClass('text-action-standalone', 'text-primary', 'h-8', 'px-0', 'w-fit')

    await user.click(action)

    expect(onNavigateToStep).toHaveBeenCalledWith('class')
  })
})
