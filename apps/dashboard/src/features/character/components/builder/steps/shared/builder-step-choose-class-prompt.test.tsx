import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UI_CARD_DESCRIPTION_CLASS, UI_CARD_TITLE_CLASS } from '@rpg/ui'

import { BUILDER_STEP_CHOOSE_CLASS_PROMPT_ACTION_LABEL } from '../../../../lib/builder/builder-step-choose-class-prompt.lib'
import {
  EQUIPMENT_CHOOSE_CLASS_PROMPT_DESCRIPTION,
  EQUIPMENT_CHOOSE_CLASS_PROMPT_HEADING,
} from '../../../../lib/equipment/equipment-step.lib'
import { BuilderStepChooseClassPrompt } from './builder-step-choose-class-prompt'
import {
  builderStepChooseClassPromptContentClasses,
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
      screen.getByRole('heading', { level: 3, name: EQUIPMENT_CHOOSE_CLASS_PROMPT_HEADING }),
    ).toHaveClass(UI_CARD_TITLE_CLASS)
    expect(screen.getByText(EQUIPMENT_CHOOSE_CLASS_PROMPT_DESCRIPTION)).toHaveClass(
      UI_CARD_DESCRIPTION_CLASS,
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
