/**
 * @vitest-environment jsdom
 *
 * Production entry: same useRunnerFormSubmit + ProducerBoundary wiring as campaign-settings.tsx.
 */
import { useMemo } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import {
  TabbedForm,
  FormSaveFooter,
  collectTabbedFormResolverItems,
  useFormValidationProducerContext,
  collectCurrentFormValidationProducerIssues,
  isFormValidationProducerSlotStale,
  type TabbedFormTab,
} from '@rpg/ui/form'
import { Icon } from '@rpg/ui'

import { useRunnerFormSubmit } from '@/lib/runner-form-submit.lib'
import { makeCampaign } from '@/test/fixtures/campaigns'
import { flavorFields, settingsIdentityFields } from './settings/campaign-profile-form-fields'
import { buildWorldSettingsFields } from './settings/world-settings-form-fields'
import {
  campaignSettingsSchema,
  mapCampaignToSettingsValues,
  type CampaignSettingsValues,
} from './settings/campaign-settings-form-values'

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

function ProducerInteractiveIssueProbe() {
  const producer = useFormValidationProducerContext()
  if (!producer) {
    return <output data-testid="interactive-issue-count">0</output>
  }
  const interactive = producer.session.slots.interactive
  const count =
    interactive && !isFormValidationProducerSlotStale(interactive, producer.stamp)
      ? interactive.issues.length
      : collectCurrentFormValidationProducerIssues(producer.session, producer.stamp).length
  return <output data-testid="interactive-issue-count">{count}</output>
}

describe('campaign settings invalid submit', () => {
  it('blocks persist and surfaces identity validation through producer session', async () => {
    const user = userEvent.setup()
    const persist = vi.fn()
    const campaign = makeCampaign({
      id: 'camp-settings-test',
      identity: { name: 'Sunless Citadel', description: '' },
      configuration: {
        flavor: {
          playStyle: ['dungeon_crawl'],
          mood: ['heroic'],
          magicLevel: 'standard_fantasy',
          difficulty: 'dangerous',
        },
      },
    })

    function Harness() {
      const tabs = useMemo((): TabbedFormTab[] => {
        return [
          {
            id: 'identity',
            label: 'Identity',
            leadingIcon: <Icon name="settings-sliders" size="sm" />,
            fields: settingsIdentityFields,
          },
          {
            id: 'flavor',
            label: 'Flavor',
            leadingIcon: <Icon name="palette" size="sm" />,
            fields: flavorFields,
          },
          {
            id: 'world',
            label: 'World',
            leadingIcon: <Icon name="globe" size="sm" />,
            fields: buildWorldSettingsFields([]),
          },
        ]
      }, [])

      const resolverFields = useMemo(() => collectTabbedFormResolverItems(tabs), [tabs])
      const formId = `campaign-settings-${campaign.id}`

      const { onSubmit, formError, ProducerBoundary } = useRunnerFormSubmit<CampaignSettingsValues>(
        {
          schema: campaignSettingsSchema,
          resolverFields,
          formId,
          invalidPresentation: {
            resolverFields,
            formId,
            resolveViewForPath: (path) => {
              if (path.startsWith('flavor') || path === 'description') return 'flavor'
              if (path.startsWith('world') || path === 'defaultLocationId') return 'world'
              return 'identity'
            },
          },
          fallbackMessage: 'Could not save campaign.',
          persist: async (values, form) => {
            persist(values)
            form.reset(values)
          },
        },
      )

      return (
        <TabbedForm<CampaignSettingsValues>
          id={formId}
          uiStateKey={campaign.id}
          schema={campaignSettingsSchema}
          tabs={tabs}
          defaultValues={{
            ...mapCampaignToSettingsValues(campaign),
            name: '',
          }}
          onSubmit={onSubmit}
          formError={formError}
          publishPresentationEnabled
          producerBoundary={ProducerBoundary}
          footer={(form) => (
            <>
              <ProducerInteractiveIssueProbe />
              <FormSaveFooter pending={form.formState.isSubmitting} submitLabel="Save changes" />
            </>
          )}
        />
      )
    }

    render(<Harness />)

    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() => {
      expect(persist).not.toHaveBeenCalled()
      expect(Number(screen.getByTestId('interactive-issue-count').textContent)).toBeGreaterThan(0)
    })
  })
})
