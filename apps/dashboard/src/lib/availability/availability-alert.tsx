import { Link } from 'react-router-dom'
import { Alert, buttonVariants, cn } from '@rpg/ui'

import {
  getAvailabilityReasonDefinition,
  resolveReasonAction,
  type AvailabilityActionCtx,
} from './availability-reason-registry'
import { resolveAvailabilityAlertVariant, type Availability } from './availability'

const MULTIPLE_REASONS_ALERT_TITLE = 'Inactive for this campaign'

export interface AvailabilityAlertProps {
  availability: Availability
  context: AvailabilityActionCtx
  /** Override the generic title used when multiple reasons are present. */
  multipleReasonsTitle?: string
}

function AvailabilityAlertActions({
  availability,
  context,
}: Pick<AvailabilityAlertProps, 'availability' | 'context'>) {
  const reasons = availability.reasons ?? []
  const actions = reasons
    .map((reason) => resolveReasonAction(reason, context))
    .filter((action): action is NonNullable<typeof action> => action !== undefined)

  if (actions.length === 0) return null

  return (
    <>
      {actions.map((action) => (
        <Link
          key={`${action.label}-${action.href}`}
          to={action.href}
          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
        >
          {action.label}
        </Link>
      ))}
    </>
  )
}

/**
 * Campaign availability alert composed from the reason registry and `@rpg/ui` Alert.
 */
export function AvailabilityAlert({
  availability,
  context,
  multipleReasonsTitle = MULTIPLE_REASONS_ALERT_TITLE,
}: AvailabilityAlertProps) {
  if (availability.status === 'active') return null

  const reasons = availability.reasons ?? []
  if (reasons.length === 0) return null

  const variant = resolveAvailabilityAlertVariant(availability)

  if (reasons.length === 1) {
    const definition = getAvailabilityReasonDefinition(reasons[0]!.code)
    return (
      <Alert
        variant={variant}
        title={definition.title}
        description={definition.description}
        actions={<AvailabilityAlertActions availability={availability} context={context} />}
      />
    )
  }

  return (
    <Alert
      variant={variant}
      title={multipleReasonsTitle}
      actions={<AvailabilityAlertActions availability={availability} context={context} />}
    >
      <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
        {reasons.map((reason) => {
          const definition = getAvailabilityReasonDefinition(reason.code)
          return (
            <li key={reason.code}>
              <span className="font-body-emphasis text-foreground">{definition.title}</span>
              <span>{`: ${definition.description}`}</span>
            </li>
          )
        })}
      </ul>
    </Alert>
  )
}
