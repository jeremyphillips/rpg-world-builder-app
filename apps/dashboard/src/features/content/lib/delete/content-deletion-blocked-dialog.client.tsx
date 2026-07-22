import type { ContentDeletionBlocker } from '@rpg/contracts'
import { Button, Modal, Text } from '@rpg/ui'
import { Link } from 'react-router-dom'

import {
  formatContentDeletionBlockedDescription,
  formatContentDeletionBlockedHeadline,
} from '../content-type-labels'
import { resolveContentUsageReferenceHref } from './resolve-content-usage-href'

export interface ContentDeletionBlockedDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entityName: string
  blockers: ContentDeletionBlocker[]
}

export function ContentDeletionBlockedDialog({
  open,
  onOpenChange,
  entityName,
  blockers,
}: ContentDeletionBlockedDialogProps) {
  const usageBlockers = blockers.filter((blocker) => blocker.kind === 'usage')
  const ruleBlockers = blockers.filter((blocker) => blocker.kind === 'rule')

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="sm">
        <Modal.Header
          headline={formatContentDeletionBlockedHeadline(entityName)}
          description={formatContentDeletionBlockedDescription(
            usageBlockers.length > 0 ? usageBlockers.length : blockers.length,
          )}
        />

        {usageBlockers.length > 0 ? (
          <Modal.Body>
            <ul className="space-y-2">
              {usageBlockers.map((blocker) => (
                <li key={blocker.usage.id}>
                  <Link
                    to={resolveContentUsageReferenceHref(blocker.usage)}
                    className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                  >
                    {blocker.usage.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Modal.Body>
        ) : null}

        {ruleBlockers.length > 0 ? (
          <Modal.Body>
            <ul className="space-y-2">
              {ruleBlockers.map((blocker) => (
                <li key={blocker.code}>
                  <Text variant="small">{blocker.message}</Text>
                </li>
              ))}
            </ul>
          </Modal.Body>
        ) : null}

        <Modal.Footer>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  )
}
