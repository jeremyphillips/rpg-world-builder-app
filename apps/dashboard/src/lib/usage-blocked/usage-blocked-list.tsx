import type { ContentUsageBlocker } from '@rpg/contracts'
import { Modal, Text } from '@rpg/ui'
import { Link } from 'react-router-dom'

import { resolveContentUsageReferenceHref } from '@/features/content/lib/delete/resolve-content-usage-href'

import { resolveContentBlockerHref } from './resolve-content-blocker-href'

export interface UsageBlockedListProps {
  blockers: ContentUsageBlocker[]
  campaignId?: string
}

export function UsageBlockedList({ blockers, campaignId }: UsageBlockedListProps) {
  const usageBlockers = blockers.filter((blocker) => blocker.kind === 'usage')
  const contentBlockers = blockers.filter((blocker) => blocker.kind === 'content')
  const ruleBlockers = blockers.filter((blocker) => blocker.kind === 'rule')

  return (
    <>
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

      {contentBlockers.length > 0 ? (
        <Modal.Body>
          <ul className="space-y-2">
            {contentBlockers.map((blocker) => (
              <li key={`${blocker.contentTypeKey}:${blocker.id}`}>
                {campaignId ? (
                  <Link
                    to={resolveContentBlockerHref(campaignId, blocker)}
                    className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                  >
                    {blocker.label}
                  </Link>
                ) : (
                  <Text variant="small">{blocker.label}</Text>
                )}
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
    </>
  )
}
