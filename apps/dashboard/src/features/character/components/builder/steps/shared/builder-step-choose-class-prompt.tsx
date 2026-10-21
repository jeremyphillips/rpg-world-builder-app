import { Waypoints } from 'lucide-react'

import { Button, Card, CardContent, CardDescription, CardTitle, IconContainer } from '@rpg/ui'

import { BUILDER_STEP_CHOOSE_CLASS_PROMPT_ACTION_LABEL } from '../../../../lib/builder/builder-step-choose-class-prompt.lib'
import type { CharacterBuilderNavigateToStep } from '../../../../lib/builder/character-builder-navigation-options'

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
        <div className="flex items-start gap-4">
          <IconContainer shape="circle">
            <Waypoints aria-hidden />
          </IconContainer>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <CardTitle>{heading}</CardTitle>
            <CardDescription>{description}</CardDescription>
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
