import * as React from 'react'

export type QuickNpcBuildExpandedAttribute = 'class' | 'level' | null

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
  const previousClassIdRef = React.useRef<string | undefined>(undefined)
  const previousApplicableRef = React.useRef<boolean | undefined>(undefined)

  React.useEffect(() => {
    const wasApplicable = previousApplicableRef.current
    const wasClassId = previousClassIdRef.current

    if (!classProgressionApplicable) {
      setExpanded((current) => (current === 'class' ? null : current))
    } else if (classId === '') {
      const becameApplicable = wasApplicable === false
      const classIdBecameEmpty = wasClassId !== undefined && wasClassId !== ''
      const isInitialApplicableEmpty = wasApplicable === undefined && wasClassId === undefined

      if (becameApplicable || classIdBecameEmpty || isInitialApplicableEmpty) {
        setExpanded('class')
      }
    }

    previousClassIdRef.current = classId
    previousApplicableRef.current = classProgressionApplicable
  }, [classId, classProgressionApplicable])

  return [expanded, setExpanded]
}
