import { useFormContext, useWatch } from 'react-hook-form'
import { cn, Icon, InsetPanel, SemanticText, Text } from '@rpg/ui'

import { abilityScoreCardScoreValueClassesFor } from '@/components/ability-score/ability-score-card.variants'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { deriveMonsterFormDraft } from '../../lib/monster-form-derivation'
import { monsterUnavailableReasonCopy } from '../../lib/monster-display'
import {
  MONSTER_EQUIPMENT_CATALOG_ERROR,
  MONSTER_LOADING_EQUIPMENT,
} from '../../lib/monster-form-labels'
import {
  monsterArmorClassAlternativeMessages,
  monsterArmorClassBreakdownRows,
  monsterArmorClassCaption,
  monsterArmorClassDexAdvisory,
} from '../../lib/statistics/monster-armor-class-presentation'
import type { MonsterFormValues } from '../../lib/monster-form-values'

export function MonsterArmorClassPreview({ ctx }: { ctx: ContentFormCtx }) {
  const form = useFormContext<MonsterFormValues>()
  useWatch({ control: form.control })
  const values = form.getValues()
  if (!values.hitPoints || !values.armorClass) return null

  if (ctx.equipmentCatalogStatus !== 'ready') {
    return (
      <Text as="span" variant="supporting">
        <SemanticText tone="warning">
          {ctx.equipmentCatalogStatus === 'error'
            ? MONSTER_EQUIPMENT_CATALOG_ERROR
            : MONSTER_LOADING_EQUIPMENT}
        </SemanticText>
      </Text>
    )
  }

  const derived = deriveMonsterFormDraft(values, ctx)
  const resolution = derived?.ac.status === 'resolved' ? derived.ac.value : undefined
  const unavailable =
    derived?.ac.status === 'unavailable'
      ? monsterUnavailableReasonCopy(derived.ac.reason, 'armor')
      : undefined
  const comparisonMessages = resolution ? monsterArmorClassAlternativeMessages(resolution) : []
  const dexAdvisory = resolution ? monsterArmorClassDexAdvisory(resolution) : undefined

  return (
    <InsetPanel size="sm">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-4 md:flex-row md:items-stretch md:gap-0">
          <div className="flex shrink-0 flex-col items-center justify-center gap-0.5 text-center md:w-[220px] md:border-r md:border-border md:pr-4">
            <p className={cn(abilityScoreCardScoreValueClassesFor('md'), 'text-center')}>
              {resolution ? resolution.ac : '—'}
            </p>
            <Text as="p" variant="caption" className="text-center">
              {resolution ? monsterArmorClassCaption(resolution) : (unavailable ?? 'Not set')}
            </Text>
          </div>
          {resolution ? (
            <dl className="flex min-w-0 flex-1 flex-col md:pl-4">
              <div className="flex flex-col gap-0.5">
                {monsterArmorClassBreakdownRows(resolution).map((row) => (
                  <div key={row.id} className="flex items-baseline justify-between gap-3 leading-4">
                    <dt>
                      <Text as="span" variant="caption">
                        {row.label}
                      </Text>
                    </dt>
                    <dd>
                      <Text as="span" variant="caption">
                        {row.value}
                      </Text>
                    </dd>
                  </div>
                ))}
              </div>
              <div className="mt-1 flex items-baseline justify-between gap-3 border-t border-border pt-1 leading-4">
                <dt>
                  <Text as="span" className="text-xs font-semibold">
                    Total
                  </Text>
                </dt>
                <dd>
                  <Text as="span" className="text-xs font-semibold">
                    {resolution.ac}
                  </Text>
                </dd>
              </div>
            </dl>
          ) : null}
        </div>
        {comparisonMessages.length > 0 || dexAdvisory ? (
          <div className="flex flex-col">
            {comparisonMessages.length > 0 ? (
              <div className="flex flex-col gap-0.5">
                {comparisonMessages.map((message) => (
                  <Text key={message} as="p" variant="caption">
                    {message}
                  </Text>
                ))}
              </div>
            ) : null}
            {dexAdvisory ? (
              <Text as="p" variant="micro" className="mt-1">
                <SemanticText tone="neutral" emphasis="low" icon={<Icon name="info" size="xs" />}>
                  {dexAdvisory}
                </SemanticText>
              </Text>
            ) : null}
          </div>
        ) : null}
      </div>
    </InsetPanel>
  )
}
