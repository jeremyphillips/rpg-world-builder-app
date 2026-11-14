import { useFormContext, useWatch } from 'react-hook-form'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { useReportContentFormWriteGate } from '../../../lib/forms/shells/layout/content-form-write-gate'
import { resolveMonsterPublishCatalogReadiness } from '../../lib/resolve-monster-publish-catalog-readiness.lib'
import type { MonsterFormValues } from '../../lib/monster-form-values'

/** Reports a single strict publish gate for monster catalog dependencies. */
export function MonsterPublishCatalogWriteGate({ ctx }: { ctx: ContentFormCtx }) {
  const values = useWatch<MonsterFormValues>() as MonsterFormValues | undefined
  const { getValues } = useFormContext<MonsterFormValues>()
  const gateReason = resolveMonsterPublishCatalogReadiness(ctx, values ?? getValues())
  useReportContentFormWriteGate('strict', gateReason)
  return null
}
