import type { SpellAcquisitionHeader, SpellLevelTabModel } from '@rpg/contracts'
import { Heading, Tabs, TabsList, TabsTrigger, Text } from '@rpg/ui'

import { ChoiceSelectionCounter } from '../shared/choice-section/choice-selection-counter'
import {
  formatSpellLevelTabOrdinal,
  resolveNarrowSpellLevelTabLayout,
  resolveSpellLevelTabLayout,
} from './spell-level-tabs.lib'
import { spellLevelTabsSubheadClasses } from './spell-level-tabs.variants'
import {
  spellLevelTabActivityClasses,
  spellLevelTabOrdinalClasses,
  spellLevelTabTriggerClasses,
  spellLevelTabsListClasses,
  spellLevelTabsRowClasses,
} from './spell-level-tabs.variants'

export type SpellLevelTabsProps = {
  tabs: readonly SpellLevelTabModel[]
  activeLevel: number
  onActiveLevelChange: (level: number) => void
  layout?: 'desktop' | 'narrow'
}

function SpellLevelTabTrigger({ tab }: { tab: SpellLevelTabModel }) {
  return (
    <TabsTrigger value={String(tab.level)} className={spellLevelTabTriggerClasses}>
      <span className={spellLevelTabOrdinalClasses}>{formatSpellLevelTabOrdinal(tab.level)}</span>
      <span className={spellLevelTabActivityClasses}>{tab.activityLabel}</span>
    </TabsTrigger>
  )
}

export function SpellLevelTabsHeader({
  acquisitionHeader,
}: {
  acquisitionHeader: SpellAcquisitionHeader
}) {
  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Heading variant="subsection" as="h3">
          {acquisitionHeader.heading}
        </Heading>
        <ChoiceSelectionCounter
          selectedCount={acquisitionHeader.aggregateCount.selected}
          max={acquisitionHeader.aggregateCount.max}
          verb={acquisitionHeader.aggregateCount.verb ?? acquisitionHeader.counterVerb}
          requiredToComplete={acquisitionHeader.aggregateCount.requiredToComplete}
          effectiveRequiredCount={acquisitionHeader.aggregateCount.effectiveRequiredCount}
        />
      </div>
      {acquisitionHeader.subheadLines.map((line) => (
        <Text key={line} as="p" variant="muted" className={spellLevelTabsSubheadClasses}>
          {line}
        </Text>
      ))}
    </div>
  )
}

export function SpellLevelTabs({
  tabs,
  activeLevel,
  onActiveLevelChange,
  layout = 'desktop',
}: SpellLevelTabsProps) {
  if (tabs.length <= 1) return null

  const maxLevel = tabs[tabs.length - 1]?.level ?? 1
  const rows =
    layout === 'narrow'
      ? resolveNarrowSpellLevelTabLayout(maxLevel)
      : resolveSpellLevelTabLayout(maxLevel)

  return (
    <Tabs
      variant="plain"
      value={String(activeLevel)}
      onValueChange={(value: string) => onActiveLevelChange(Number(value))}
    >
      <TabsList className={spellLevelTabsListClasses} aria-label="Spell levels">
        {rows.map((row) => (
          <div
            key={row.levels.join('-')}
            className={spellLevelTabsRowClasses}
            style={{ gridTemplateColumns: `repeat(${row.columns}, minmax(0, 1fr))` }}
          >
            {row.levels.map((level) => {
              const tab = tabs.find((entry) => entry.level === level)
              if (!tab) return null

              return <SpellLevelTabTrigger key={level} tab={tab} />
            })}
          </div>
        ))}
      </TabsList>
    </Tabs>
  )
}
