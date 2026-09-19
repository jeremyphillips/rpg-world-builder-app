import { Waypoints } from 'lucide-react'

import { Button, IconContainer } from '@rpg/ui'

import { BUILDER_STEP_CHOOSE_CLASS_PROMPT_ACTION_LABEL } from '../../../../lib/builder/builder-step-choose-class-prompt.lib'
import type { CharacterBuilderNavigateToStep } from '../../../../lib/builder/character-builder-navigation-options'
import {
  builderStepChooseClassPromptActionClasses,
  builderStepChooseClassPromptBodyClasses,
  builderStepChooseClassPromptCardClasses,
  builderStepChooseClassPromptContentClasses,
  builderStepChooseClassPromptHeadingClasses,
  builderStepChooseClassPromptSubheadingClasses,
  builderStepChooseClassPromptTextStackClasses,
} from './builder-step-choose-class-prompt.variants'

export type BuilderStepChooseClassPromptProps = {
  heading: string
  description: string
  onNavigateToStep: CharacterBuilderNavigateToStep
  actionLabel?: string
}

export function BuilderStepChooseClassPrompt({
  heading,
  description,
  onNavigateToStep,
  actionLabel = BUILDER_STEP_CHOOSE_CLASS_PROMPT_ACTION_LABEL,
}: BuilderStepChooseClassPromptProps) {
  return (
    <article className={builderStepChooseClassPromptCardClasses}>
      <div className={builderStepChooseClassPromptBodyClasses}>
        <IconContainer shape="circle">
          <Waypoints aria-hidden />
        </IconContainer>
        <div className={builderStepChooseClassPromptContentClasses}>
          <div className={builderStepChooseClassPromptTextStackClasses}>
            <h2 className={builderStepChooseClassPromptHeadingClasses}>{heading}</h2>
            <p className={builderStepChooseClassPromptSubheadingClasses}>{description}</p>
          </div>
          <Button
            type="button"
            variant="link"
            className={builderStepChooseClassPromptActionClasses}
            onClick={() => onNavigateToStep('class')}
          >
            {actionLabel}
          </Button>
        </div>
      </div>
    </article>
  )
}
