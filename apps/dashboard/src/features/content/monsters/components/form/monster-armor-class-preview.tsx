import { useFormContext, useWatch } from 'react-hook-form'
import { InsetPanel, SemanticText, Text } from '@rpg/ui'

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

  return (
    <InsetPanel size="sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start">
        <div className="flex flex-col gap-1">
          <p className={abilityScoreCardScoreValueClassesFor('md')}>
            {resolution ? resolution.ac : '—'}
          </p>
          <Text as="p" variant="supporting">
            {resolution ? monsterArmorClassCaption(resolution) : (unavailable ?? 'Not set')}
          </Text>
        </div>
        {resolution ? (
          <dl className="flex min-w-0 flex-1 flex-col gap-1">
            {monsterArmorClassBreakdownRows(resolution).map((row) => (
              <div key={row.id} className="flex items-baseline justify-between gap-3">
                <dt>
                  <Text as="span" variant="supporting">
                    {row.label}
                  </Text>
                </dt>
                <dd>
                  <Text as="span" variant="supporting">
                    {row.value}
                  </Text>
                </dd>
              </div>
            ))}
            <div className="flex items-baseline justify-between gap-3">
              <dt>
                <Text as="span" variant="label">
                  Total
                </Text>
              </dt>
              <dd>
                <Text as="span" variant="label">
                  {resolution.ac}
                </Text>
              </dd>
            </div>
            {monsterArmorClassAlternativeMessages(resolution).map((message) => (
              <Text key={message} as="p" variant="supporting">
                {message}
              </Text>
            ))}
          </dl>
        ) : null}
      </div>
    </InsetPanel>
  )
}
