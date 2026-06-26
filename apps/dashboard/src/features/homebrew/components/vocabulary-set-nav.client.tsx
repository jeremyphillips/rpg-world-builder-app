'use client'

import { NavLink, useNavigate } from 'react-router-dom'
import { cn, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Text } from '@rpg/ui'
import type { VocabularyOptionSetId } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'

import { HOMEBREW_VOCABULARY_SETS } from '../lib/vocabulary-set-registry'

type VocabularySetNavProps = {
  campaignId: string
  activeSetId: VocabularyOptionSetId
}

function navLinkClass(isActive: boolean, enabled: boolean) {
  return cn(
    'block rounded-md px-3 py-2 text-sm font-medium transition-colors',
    enabled
      ? isActive
        ? 'bg-accent text-accent-foreground'
        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
      : 'cursor-not-allowed text-muted-foreground/60',
  )
}

/** Desktop rail + mobile select for switching vocabulary sets. */
export function VocabularySetNav({ campaignId, activeSetId }: VocabularySetNavProps) {
  const navigate = useNavigate()

  return (
    <>
      <nav className="hidden w-56 shrink-0 lg:block" aria-label="Rules vocabulary sets">
        <Text variant="small" className="mb-2 px-3 font-medium uppercase tracking-wide">
          Rules vocabulary
        </Text>
        <ul className="space-y-1">
          {HOMEBREW_VOCABULARY_SETS.map((entry) => (
            <li key={entry.setId}>
              {entry.enabled ? (
                <NavLink
                  to={ROUTES.homebrew.vocabulary(campaignId, entry.setId)}
                  className={({ isActive }) => navLinkClass(isActive, true)}
                >
                  {entry.label}
                </NavLink>
              ) : (
                <span className={navLinkClass(false, false)} aria-disabled="true">
                  {entry.label}
                </span>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="lg:hidden">
        <Select
          value={activeSetId}
          onValueChange={(nextSetId) => navigate(ROUTES.homebrew.vocabulary(campaignId, nextSetId))}
        >
          <SelectTrigger aria-label="Rules vocabulary set">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {HOMEBREW_VOCABULARY_SETS.map((entry) => (
              <SelectItem key={entry.setId} value={entry.setId} disabled={!entry.enabled}>
                {entry.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  )
}
