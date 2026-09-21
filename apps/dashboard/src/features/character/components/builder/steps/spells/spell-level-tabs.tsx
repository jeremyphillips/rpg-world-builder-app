import type { SpellLevelTabModel } from '@rpg/contracts'
import { Heading, Tabs, TabsList, TabsTrigger, Text } from '@rpg/ui'

import {
  formatSpellLevelTabOrdinal,
  formatSpellLevelTabsRangeHeading,
  resolveNarrowSpellLevelTabLayout,
  resolveSpellLevelTabLayout,
  SPELL_LEVEL_TABS_SUBHEAD,
} from './spell-level-tabs.lib'
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
  minLevel,
  maxLevel,
}: {
  minLevel: number
  maxLevel: number
}) {
  return (
    <div className="space-y-1">
      <Heading variant="subsection" as="h3">
        {formatSpellLevelTabsRangeHeading(minLevel, maxLevel)}
      </Heading>
      <Text as="p" variant="muted">
        {SPELL_LEVEL_TABS_SUBHEAD}
      </Text>
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
