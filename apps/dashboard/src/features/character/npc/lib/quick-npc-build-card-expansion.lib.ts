import * as React from 'react'

export type QuickNpcBuildExpandedAttribute = 'class' | 'level' | null

type QuickNpcBuildCardExpansionSync = {
  classProgressionApplicable: boolean
  classId: string
}

function resolveQuickNpcBuildCardExpandedSync(
  expanded: QuickNpcBuildExpandedAttribute,
  previous: QuickNpcBuildCardExpansionSync,
  current: QuickNpcBuildCardExpansionSync,
): QuickNpcBuildExpandedAttribute {
  const { classProgressionApplicable, classId } = current
  const { classProgressionApplicable: wasApplicable, classId: wasClassId } = previous

  if (!classProgressionApplicable) {
    return expanded === 'class' ? null : expanded
  }

  if (classId !== '') {
    return expanded
  }

  const becameApplicable = wasApplicable === false
  const classIdBecameEmpty = wasClassId !== ''

  if (becameApplicable || classIdBecameEmpty) {
    return 'class'
  }

  return expanded
}

export function useQuickNpcBuildCardExpandedAttribute(args: {
  classProgressionApplicable: boolean
  classId: string
}): [
  QuickNpcBuildExpandedAttribute,
  React.Dispatch<React.SetStateAction<QuickNpcBuildExpandedAttribute>>,
] {
  const { classProgressionApplicable, classId } = args
  const [expanded, setExpanded] = React.useState<QuickNpcBuildExpandedAttribute>(() =>
    classProgressionApplicable && classId === '' ? 'class' : null,
  )
  const [syncState, setSyncState] = React.useState<QuickNpcBuildCardExpansionSync>(() => ({
    classProgressionApplicable,
    classId,
  }))

  if (
    classProgressionApplicable !== syncState.classProgressionApplicable ||
    classId !== syncState.classId
  ) {
    const nextExpanded = resolveQuickNpcBuildCardExpandedSync(expanded, syncState, {
      classProgressionApplicable,
      classId,
    })
    const nextSync = { classProgressionApplicable, classId }

    setSyncState(nextSync)
    if (nextExpanded !== expanded) {
      setExpanded(nextExpanded)
    }
  }

  return [expanded, setExpanded]
}
