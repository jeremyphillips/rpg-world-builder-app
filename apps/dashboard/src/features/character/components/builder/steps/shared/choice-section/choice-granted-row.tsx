import type { BuilderChoiceGrantedRow } from '@rpg/contracts'
import { BadgeCheck } from 'lucide-react'

import {
  choiceGrantedRowBodyClasses,
  choiceGrantedRowCopyClasses,
  choiceGrantedRowDescriptionClasses,
  choiceGrantedRowFrameClasses,
  choiceGrantedRowHeadingClasses,
  choiceGrantedRowIconClasses,
} from './choice-granted-row.variants'

export type ChoiceGrantedRowProps = {
  row: BuilderChoiceGrantedRow
}

export function ChoiceGrantedRow({ row }: ChoiceGrantedRowProps) {
  return (
    <article className={choiceGrantedRowFrameClasses}>
      <div className={choiceGrantedRowBodyClasses}>
        <BadgeCheck className={choiceGrantedRowIconClasses} aria-hidden />
        <div className={choiceGrantedRowCopyClasses}>
          <div className={choiceGrantedRowHeadingClasses}>{row.label}</div>
          {row.sourceLabel ? (
            <div className={choiceGrantedRowDescriptionClasses}>{row.sourceLabel}</div>
          ) : null}
        </div>
      </div>
    </article>
  )
}
