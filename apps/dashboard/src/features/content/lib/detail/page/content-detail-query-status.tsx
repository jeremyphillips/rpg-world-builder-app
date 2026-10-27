import { Text } from '@rpg/ui'

import {
  CONTENT_DETAIL_QUERY_PENDING_LABEL,
  formatContentDetailQueryError,
  type ContentDetailQueryErrorSubject,
} from './content-detail-query-status.lib'

type ContentDetailQueryStatusProps =
  | { status: 'pending' }
  | { status: 'error'; subject: ContentDetailQueryErrorSubject }

/** Pending or initial-error copy for a secondary content-detail query. */
export function ContentDetailQueryStatus(props: ContentDetailQueryStatusProps) {
  if (props.status === 'pending') {
    return (
      <Text as="span" variant="supporting" role="status">
        {CONTENT_DETAIL_QUERY_PENDING_LABEL}
      </Text>
    )
  }

  return (
    <Text as="span" variant="destructive" role="alert">
      {formatContentDetailQueryError(props.subject)}
    </Text>
  )
}
