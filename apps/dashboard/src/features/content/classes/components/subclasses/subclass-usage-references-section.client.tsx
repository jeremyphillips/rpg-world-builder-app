'use client'

import { UsageReferencesQuerySection } from '@/lib/usage-references/usage-references-query-section'

import { isDraftSubclassId } from '../../lib/subclasses/subclass-editor-constants'
import { useSubclassEntryUsage } from '../../hooks/use-subclass-entry-usage'

export type SubclassUsageReferencesSectionProps = {
  campaignId: string
  classId: string
  subclassId: string
}

/** Nested subclass usage — unsupported for unsaved draft ids. */
export function SubclassUsageReferencesSection({
  campaignId,
  classId,
  subclassId,
}: SubclassUsageReferencesSectionProps) {
  if (isDraftSubclassId(subclassId)) {
    return null
  }

  return (
    <SubclassUsageReferencesSectionLoaded
      campaignId={campaignId}
      classId={classId}
      subclassId={subclassId}
    />
  )
}

function SubclassUsageReferencesSectionLoaded({
  campaignId,
  classId,
  subclassId,
}: SubclassUsageReferencesSectionProps) {
  const {
    data: usage,
    isPending,
    isError,
    refetch,
  } = useSubclassEntryUsage(campaignId, classId, subclassId)

  return (
    <UsageReferencesQuerySection
      campaignId={campaignId}
      isPending={isPending}
      isError={isError}
      onRetry={() => {
        void refetch()
      }}
      references={usage?.references}
    />
  )
}
