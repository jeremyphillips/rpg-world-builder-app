import { useId, useMemo, useState } from 'react'
import {
  borderStrength,
  Button,
  CheckboxField,
  cn,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  DialogPanelScrollRegion,
  FilenamePreview,
  Panel,
  Text,
  type ScrollBoundaryState,
} from '@rpg/ui'
import { Form, type FormItem, type FormValueSync } from '@rpg/ui/form'
import { ChevronDown } from 'lucide-react'
import {
  MEDIA_ROLE_ENTRIES,
  asCropPresentation,
  contentImageSchema,
  formatFieldMessage,
  resolveEffectiveImageRoles,
  resolveMediaRoleEligibility,
  roleAssignmentMatchesSelection,
  type AvailableContentImage,
  type AvailableContentMediaSource,
  type ContentMedia,
  type ContentMediaPolicy,
  type MediaAsset,
  type MediaRole,
} from '@rpg/contracts'

const altSchema = contentImageSchema.pick({ alt: true })
const altFields: FormItem[] = [
  {
    name: 'alt',
    type: 'text',
    label: 'Image description',
    hint: 'Describe this image for accessibility.',
    chrome: { variant: 'none' },
  },
]

export type MediaImageDetailsProps = {
  selectedAvailable: AvailableContentImage
  availableSources: readonly AvailableContentMediaSource[]
  assignedSourceMissing?: boolean
  media: ContentMedia
  policy: ContentMediaPolicy
  assignedRoles: MediaRole[]
  asset?: MediaAsset
  onAlt: (alt: string) => void
  onRole: (role: MediaRole, assigned: boolean) => void
  onRemove?: () => void
  canRemove: boolean
  onScrollBoundaryChange?: (state: ScrollBoundaryState) => void
}

// fallow-ignore-next-line complexity
export function MediaImageDetails({
  selectedAvailable,
  availableSources,
  assignedSourceMissing = false,
  media,
  policy,
  assignedRoles,
  asset,
  onAlt,
  onRole,
  onRemove,
  canRemove,
  onScrollBoundaryChange,
}: MediaImageDetailsProps) {
  const id = useId()
  const [accessibilityOpen, setAccessibilityOpen] = useState(false)
  const uploadImage = selectedAvailable.kind === 'upload' ? selectedAvailable.attachment : undefined
  const syncs = useMemo<FormValueSync[]>(
    () => [
      {
        dependsOn: ['alt'],
        apply: (values) => {
          onAlt(String(values.alt ?? ''))
          return undefined
        },
      },
    ],
    [onAlt],
  )
  const source =
    selectedAvailable.kind === 'system'
      ? selectedAvailable.sourceDimensions
      : asset
        ? { width: asset.orientedWidth, height: asset.orientedHeight }
        : undefined
  const effectiveRoles = resolveEffectiveImageRoles(
    media,
    selectedAvailable.id,
    policy.allowedRoles,
    availableSources,
  )
  const galleryOnlyUpload =
    selectedAvailable.kind === 'upload' &&
    effectiveRoles.roles.length === 0 &&
    effectiveRoles.derivedRoles.length === 0

  return (
    <aside className="media-manager__column" aria-label="Image details">
      <DialogPanelScrollRegion
        inset="innerLeading"
        regionClassName="media-manager__column-scroll"
        viewportClassName="media-manager__column-viewport"
        showTopBoundaryShadow={false}
        showBottomBoundaryShadow={false}
        onBoundaryStateChange={onScrollBoundaryChange}
      >
        <div className="min-w-0 space-y-4">
          <h3 className="text-sm font-semibold">Image details</h3>
          {assignedSourceMissing ? (
            <p className="text-sm text-destructive" role="alert">
              A saved role points at a missing image. The preview uses the fallback source until you
              reassign the role.
            </p>
          ) : null}
          {galleryOnlyUpload ? (
            <Text variant="supporting">
              Gallery only — assign a role to show this image on cards and detail pages.
            </Text>
          ) : null}
          <Panel tone="quiet" bleed className="media-manager__details">
            <section className="space-y-3 p-4" aria-labelledby={`${id}-roles-heading`}>
              <h4 id={`${id}-roles-heading`} className="text-sm font-semibold">
                Assign roles
              </h4>
              <div className="space-y-3" role="group" aria-labelledby={`${id}-roles-heading`}>
                {/* fallow-ignore-next-line complexity */}
                {policy.allowedRoles.map((role) => {
                  const assignment = media.roles[role]
                  const checked = assignedRoles.includes(role)
                  const derivedOnly = effectiveRoles.derivedRoles.includes(role)
                  const cropPresentation = asCropPresentation(
                    assignment && roleAssignmentMatchesSelection(assignment, selectedAvailable.id)
                      ? assignment.presentation
                      : undefined,
                  )
                  const eligibility = source
                    ? resolveMediaRoleEligibility(role, source, cropPresentation)
                    : { eligible: false, message: 'Image details are still loading.' }
                  const hint = !eligibility.eligible
                    ? formatFieldMessage(eligibility.message)
                    : derivedOnly
                      ? 'System artwork stays visible until you assign another image.'
                      : ((eligibility.eligible && 'hint' in eligibility
                          ? eligibility.hint
                          : undefined) ?? MEDIA_ROLE_ENTRIES[role].description)

                  return (
                    <CheckboxField
                      key={role}
                      id={`${id}-${role}`}
                      label={MEDIA_ROLE_ENTRIES[role].label}
                      hint={hint}
                      checked={checked}
                      disabled={!eligibility.eligible || derivedOnly}
                      onCheckedChange={(nextChecked) => onRole(role, nextChecked === true)}
                    />
                  )
                })}
              </div>
            </section>
            <section
              className={cn('space-y-3 border-t p-4', borderStrength('subtle'))}
              aria-labelledby={`${id}-file-heading`}
            >
              <h4 id={`${id}-file-heading`} className="text-sm font-semibold">
                File
              </h4>
              <dl
                className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-4 gap-y-2 text-style-caption"
                aria-labelledby={`${id}-file-heading`}
              >
                {selectedAvailable.kind === 'system' ? (
                  <>
                    <dt className="text-muted-foreground">Source</dt>
                    <dd className="m-0 min-w-0">System artwork</dd>
                    <dt className="text-muted-foreground">Dimensions</dt>
                    <dd className="m-0 min-w-0">
                      {selectedAvailable.sourceDimensions.width} ×{' '}
                      {selectedAvailable.sourceDimensions.height}
                    </dd>
                  </>
                ) : asset ? (
                  <>
                    <dt className="text-muted-foreground">File name</dt>
                    <dd className="m-0 min-w-0">
                      <FilenamePreview filename={asset.filename} density="metadata" />
                    </dd>
                    <dt className="text-muted-foreground">Dimensions</dt>
                    <dd className="m-0 min-w-0">
                      {asset.orientedWidth} × {asset.orientedHeight}
                    </dd>
                    <dt className="text-muted-foreground">File size</dt>
                    <dd className="m-0 min-w-0">
                      {new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(
                        asset.byteSize / 1024,
                      )}{' '}
                      KB
                    </dd>
                  </>
                ) : null}
              </dl>
              {asset?.animated ? (
                <Text variant="supporting">Animated source; still preview.</Text>
              ) : null}
            </section>
            {uploadImage ? (
              <section className={cn('space-y-3 border-t p-4', borderStrength('subtle'))}>
                {/* TODO(disclosure): consolidate ad hoc collapsible trigger/caret with shared @rpg/ui disclosure primitives. */}
                <Collapsible open={accessibilityOpen} onOpenChange={setAccessibilityOpen}>
                  <CollapsibleTrigger asChild>
                    <Button
                      type="button"
                      variant="text"
                      size="sm"
                      className="group h-auto w-full justify-between px-0 py-0 text-sm font-semibold"
                      aria-expanded={accessibilityOpen}
                    >
                      Accessibility & details
                      <ChevronDown
                        className="size-4 shrink-0 transition-transform group-data-[state=open]:rotate-180"
                        aria-hidden="true"
                      />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-3">
                    <Form
                      key={uploadImage.id}
                      schema={altSchema}
                      fields={altFields}
                      defaultValues={{ alt: uploadImage.alt ?? '' }}
                      onSubmit={(values) => onAlt(values.alt ?? '')}
                      valueSyncs={syncs}
                      footer={null}
                    />
                  </CollapsibleContent>
                </Collapsible>
              </section>
            ) : null}
          </Panel>
          {canRemove && onRemove ? (
            <Button type="button" variant="outline" onClick={onRemove}>
              Remove image
            </Button>
          ) : null}
        </div>
      </DialogPanelScrollRegion>
    </aside>
  )
}
