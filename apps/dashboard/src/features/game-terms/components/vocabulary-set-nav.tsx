import { useNavigate, NavLink } from 'react-router-dom'

import { Eyebrow, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, cn } from '@rpg/ui'
import type { VocabularyOptionSetId } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'

import { GAME_TERMS_VOCABULARY_CATEGORIES } from '../lib/hub/vocabulary-set-registry'

type VocabularySetNavProps = {
  campaignId: string
  activeSetId: VocabularyOptionSetId
}

function navLinkClass(isActive: boolean) {
  return cn(
    'block rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-accent text-accent-foreground'
      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
  )
}

/** Desktop rail + mobile select for switching vocabulary sets. */
export function VocabularySetNav({ campaignId, activeSetId }: VocabularySetNavProps) {
  const navigate = useNavigate()

  return (
    <>
      <nav className="hidden w-56 shrink-0 lg:block" aria-label="Game Terms categories">
        <Eyebrow size="sm" className="mb-2 px-3">
          Game Terms
        </Eyebrow>
        <ul className="space-y-1">
          {GAME_TERMS_VOCABULARY_CATEGORIES.map((entry) => (
            <li key={entry.setId}>
              <NavLink
                to={ROUTES.gameTerms.overview(campaignId, entry.setId)}
                className={({ isActive }) => navLinkClass(isActive)}
              >
                {entry.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="lg:hidden">
        <Select
          value={activeSetId}
          onValueChange={(nextSetId) => navigate(ROUTES.gameTerms.overview(campaignId, nextSetId))}
        >
          <SelectTrigger aria-label="Game Terms category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {GAME_TERMS_VOCABULARY_CATEGORIES.map((entry) => (
              <SelectItem key={entry.setId} value={entry.setId}>
                {entry.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  )
}
