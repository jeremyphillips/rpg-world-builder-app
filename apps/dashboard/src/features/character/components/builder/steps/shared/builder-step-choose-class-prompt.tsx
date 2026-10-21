import { Waypoints } from 'lucide-react'

import { Button, Card, CardContent, CardDescription, CardTitle, IconContainer } from '@rpg/ui'

import { BUILDER_STEP_CHOOSE_CLASS_PROMPT_ACTION_LABEL } from '../../../../lib/builder/builder-step-choose-class-prompt.lib'
import type { CharacterBuilderNavigateToStep } from '../../../../lib/builder/character-builder-navigation-options'
import {
  builderStepChooseClassPromptBodyClasses,
  builderStepChooseClassPromptContentClasses,
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
    <Card tone="subtle" density="comfortable" className="w-full min-w-0">
      <CardContent>
        <div className={builderStepChooseClassPromptBodyClasses}>
          <IconContainer shape="circle">
            <Waypoints aria-hidden />
          </IconContainer>
          <div className={builderStepChooseClassPromptContentClasses}>
            <div className={builderStepChooseClassPromptTextStackClasses}>
              <CardTitle>{heading}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
            <Button
              type="button"
              variant="text"
              tone="accent"
              onClick={() => onNavigateToStep('class')}
            >
              {actionLabel}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
