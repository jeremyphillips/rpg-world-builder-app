/**
 * @vitest-environment jsdom
 */
import { QueryClientProvider } from '@tanstack/react-query'
import { getMonsterBySlug } from '@rpg/catalog/monsters'
import { TabbedForm, collectTabbedFormResolverItems, type FormIssue } from '@rpg/ui/form'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useCallback, useMemo, useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import type { ZodType } from 'zod'
import type { ContentStatus } from '@rpg/contracts'

import { makeTestQueryClient } from '@/test/render'
import type * as CharacterModule from '@/features/character'
import type * as VocabularyModule from '@/features/vocabulary'

import { CampaignAccessFormProvider } from '../../../lib/campaign-access/campaign-access-form-context'
import { ContentDraftPublishValidationSurfaceBridge } from '../../../lib/forms/validation/content-draft-publish-validation-surface.client'
import { ContentFormWriteGateProvider } from '../../../lib/forms/shells/layout/content-form-write-gate'
import { ContentFormPublishValidationBridge } from '../../../lib/forms/validation/content-form-publish-validation.client'
import { loadContentEditFormState } from '../../../lib/forms/shells/edit/content-edit-load'
import { ContentFormSaveFooter } from '../../../lib/forms/shells/layout/content-form-shell-layout.lib'
import { TEST_CAMPAIGN_ID, makeContentFormCtx } from '../../../lib/fixtures/content-form-ctx'
import { augmentTabsWithHoistedName } from '../../../lib/forms/shells/layout/content-schema-form-tabs.lib'
import { buildMonsterTabs } from '../monster-form-fields'
import { monsterFormDef } from '../monster-form-def'
import { resolveMonsterFormSchema } from '../monster-form-schema'
import type { MonsterFormValues } from '../monster-form-values'
import {
  MONSTER_LAIR_EXPERIENCE_CUSTOM_LABEL,
  MONSTER_LAIR_EXPERIENCE_MODE_CUSTOM,
  MONSTER_LAIR_EXPERIENCE_MODE_LABEL,
} from '../monster-form-labels'

vi.mock('@/features/vocabulary/hooks/use-vocabulary-set', async (importOriginal) => {
  const actual = await importOriginal<Pick<typeof VocabularyModule, 'useVocabularySet'>>()
  return {
    ...actual,
    useVocabularySet: () => ({ data: undefined, isLoading: false, isPending: false }),
  }
})

vi.mock('@/features/character', async (importOriginal) => {
  const actual = await importOriginal<typeof CharacterModule>()
  return {
    ...actual,
    EquipmentPickerDrawer: () => null,
  }
})

beforeAll(() => {
  if (!HTMLElement.prototype.hasPointerCapture) {
    HTMLElement.prototype.hasPointerCapture = () => false
    HTMLElement.prototype.setPointerCapture = () => {}
    HTMLElement.prototype.releasePointerCapture = () => {}
  }
  if (!HTMLElement.prototype.scrollIntoView) {
    HTMLElement.prototype.scrollIntoView = () => {}
  }
})

function catalogLich(status: ContentStatus = 'published') {
  const row = getMonsterBySlug('srd-cc-5.2.1', 'lich')
  return { ...row, status }
}

function editShellLoad(status: ContentStatus) {
  const entity = catalogLich(status)
  const optionsCtx = makeContentFormCtx({
    equipmentCatalogStatus: 'ready',
    equipmentCatalogById: new Map(),
    skillCatalogStatus: 'ready',
    skillCatalogBySlug: new Map(),
    spellCatalogStatus: 'ready',
    spellCatalogById: new Map(),
  })
  return loadContentEditFormState({
    def: monsterFormDef,
    entity,
    optionsCtx,
    campaignId: TEST_CAMPAIGN_ID,
    entityId: entity.id,
  })
}

function MonsterEditShellHarness({
  status,
  onSubmit,
}: {
  status: ContentStatus
  onSubmit: (values: MonsterFormValues, form: UseFormReturn<MonsterFormValues>) => Promise<void>
}) {
  const loaded = useMemo(() => editShellLoad(status), [status])
  const { layoutCtx, schema, validationIntent, defaultValues } = loaded
  const tabs = useMemo(
    () =>
      augmentTabsWithHoistedName(buildMonsterTabs(layoutCtx), monsterFormDef.nameField(layoutCtx)),
    [layoutCtx],
  )
  const publishFields = useMemo(() => collectTabbedFormResolverItems(tabs), [tabs])
  const publishSchema = useMemo(
    () => resolveMonsterFormSchema(layoutCtx, 'publish') as unknown as ZodType<MonsterFormValues>,
    [layoutCtx],
  )
  const [hasAttemptedPublish, setHasAttemptedPublish] = useState(false)
  const [publishPresentationIssues, setPublishPresentationIssues] = useState<FormIssue[]>([])
  const markPublishAttempted = useCallback(() => setHasAttemptedPublish(true), [])
  const resetValidationPresentation = useCallback(() => {
    setHasAttemptedPublish(false)
    setPublishPresentationIssues([])
  }, [])
  const handlePublishIssuesChange = useCallback(({ issues }: { issues: readonly FormIssue[] }) => {
    setPublishPresentationIssues([...issues])
  }, [])

  return (
    <QueryClientProvider client={makeTestQueryClient()}>
      <CampaignAccessFormProvider>
        <ContentFormWriteGateProvider>
          <TabbedForm<MonsterFormValues>
            id="monster-edit"
            schema={schema as ZodType<MonsterFormValues>}
            tabs={tabs}
            defaultValues={defaultValues as MonsterFormValues}
            valueSyncs={monsterFormDef.valueSyncs?.()}
            publishPresentationEnabled
            hasAttemptedPublish={hasAttemptedPublish}
            onMarkPublishAttempted={markPublishAttempted}
            publishPresentationIssues={publishPresentationIssues}
            onResetValidationPresentation={resetValidationPresentation}
            onSubmit={onSubmit}
            header={() => (
              <>
                {validationIntent === 'draft' ? (
                  <ContentDraftPublishValidationSurfaceBridge
                    def={monsterFormDef}
                    ctx={layoutCtx}
                    validationIntent={layoutCtx.validationIntent}
                    publishFields={publishFields}
                    formId="monster-edit"
                    onPublishIssuesChange={handlePublishIssuesChange}
                  />
                ) : null}
                <ContentFormPublishValidationBridge
                  schema={publishSchema}
                  tabs={tabs}
                  onValidationChange={handlePublishIssuesChange}
                />
              </>
            )}
            footer={(form) => (
              <ContentFormSaveFooter
                form={form}
                formMode="edit"
                submitLabel="Save changes"
                submitPending={false}
                onSubmit={onSubmit}
              />
            )}
          />
        </ContentFormWriteGateProvider>
      </CampaignAccessFormProvider>
    </QueryClientProvider>
  )
}

async function openStatisticsTab(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Statistics' }))
  const panel = document.getElementById('monster-edit-panel-statistics')
  if (!panel) throw new Error('Statistics panel missing')
  return within(panel)
}

async function setCustomInLairXp(
  user: ReturnType<typeof userEvent.setup>,
  amount: string,
  statistics: ReturnType<typeof within> = within(document.body),
) {
  await user.click(statistics.getByRole('combobox', { name: MONSTER_LAIR_EXPERIENCE_MODE_LABEL }))
  await user.click(
    within(document.body).getByRole('option', { name: MONSTER_LAIR_EXPERIENCE_MODE_CUSTOM }),
  )
  const spinbutton = await statistics.findByRole('spinbutton', {
    name: MONSTER_LAIR_EXPERIENCE_CUSTOM_LABEL,
  })
  await user.clear(spinbutton)
  if (amount.length > 0) {
    await user.type(spinbutton, amount)
  }
}

function expectXpFloorChrome() {
  const spinbutton = screen.getByRole('spinbutton', { name: MONSTER_LAIR_EXPERIENCE_CUSTOM_LABEL })
  expect(spinbutton).toBeInvalid()
  const alerts = screen.getAllByRole('alert')
  expect(alerts.some((alert) => /In-lair XP must exceed/.test(alert.textContent ?? ''))).toBe(true)
}

describe('monster in-lair XP on the real edit shell', () => {
  it('blocks published save and paints the XP amount field', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn(async () => {})
    render(<MonsterEditShellHarness status="published" onSubmit={onSubmit} />)

    const statistics = await openStatisticsTab(user)
    await setCustomInLairXp(user, '1', statistics)
    const save = screen.getByRole('button', { name: 'Save changes' })
    await waitFor(() => expect(save).toBeEnabled())
    await user.click(save)

    await waitFor(() => {
      expectXpFloorChrome()
    })
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('rejects published save when custom in-lair XP equals the normal amount', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn(async () => {})
    render(<MonsterEditShellHarness status="published" onSubmit={onSubmit} />)

    const statistics = await openStatisticsTab(user)
    await setCustomInLairXp(user, '33000', statistics)
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() => expectXpFloorChrome())
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
