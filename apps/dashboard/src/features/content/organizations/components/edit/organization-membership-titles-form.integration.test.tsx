import { render, screen } from '@testing-library/react'
import { useFormContext } from 'react-hook-form'
import { describe, expect, it } from 'vitest'
import { Form } from '@rpg/ui/form'

import { OrganizationAuthoringProvider } from '../authoring/organization-authoring-context'
import { OrganizationMembershipTitlesRegistration } from '../authoring/organization-membership-titles-registration'
import {
  buildOrganizationFormValueSyncs,
  organizationDraftFormSchema,
} from '../../../lib/forms/organization-form-projection'
import { buildOrganizationMembershipTitlesArrayField } from '../../lib/membership-titles/organization-membership-titles-form.lib'
import { snapshotOrganizationMembershipTitlesFromPreset } from '@rpg/contracts'

function ValuesProbe() {
  const form = useFormContext()
  return (
    <output data-testid="members-titles-json">
      {JSON.stringify(form.getValues('members.titles'))}
    </output>
  )
}

describe('organization membership titles form integration', () => {
  it('renders preset materialized titles while class affinity chips are mounted', () => {
    const titles = snapshotOrganizationMembershipTitlesFromPreset('thieves_guild', () => 'omt_test')

    render(
      <OrganizationAuthoringProvider>
        <Form
          schema={organizationDraftFormSchema}
          fields={[
            {
              kind: 'slot',
              name: '_organizationMembershipTitlesRegistration',
              render: () => <OrganizationMembershipTitlesRegistration />,
            },
            {
              type: 'chips',
              name: 'members.classAffinityIds',
              label: 'Class affinities',
              options: [{ value: 'class-rogue', label: 'Rogue' }],
              multiple: true,
            },
            buildOrganizationMembershipTitlesArrayField(),
          ]}
          defaultValues={{
            members: { classAffinityIds: ['class-rogue'], speciesAffinityIds: [], titles },
          }}
          onSubmit={() => undefined}
        />
      </OrganizationAuthoringProvider>,
    )

    expect(screen.getAllByDisplayValue('Guildmaster').length).toBeGreaterThan(0)
  })

  it('registers members.titles while quick-create optional details stay closed', () => {
    render(
      <OrganizationAuthoringProvider presentation="quick">
        <Form
          schema={organizationDraftFormSchema}
          fields={[
            {
              kind: 'slot',
              name: '_organizationMembershipTitlesRegistration',
              render: () => <OrganizationMembershipTitlesRegistration />,
            },
            {
              kind: 'slot',
              name: '_valuesProbe',
              render: () => <ValuesProbe />,
            },
          ]}
          defaultValues={{
            members: {
              classAffinityIds: [],
              speciesAffinityIds: [],
              titles: [{ id: 'omt_fixture', label: 'Fixture', priority: 10 }],
            },
          }}
          onSubmit={() => undefined}
        />
      </OrganizationAuthoringProvider>,
    )

    expect(screen.getByTestId('members-titles-json').textContent).toContain('omt_fixture')
  })

  it('materializes titles through starting-point value sync', () => {
    const [sync] = buildOrganizationFormValueSyncs(undefined, [])
    const patch = sync?.apply({ startingPointId: 'thieves_guild' }, ['startingPointId'])
    expect(patch?.['members.titles']).toEqual(expect.any(Array))
    expect((patch?.['members.titles'] as unknown[]).length).toBeGreaterThan(0)
  })
})
