'use client'

import * as React from 'react'

import {
  Badge,
  Modal,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  type ModalContentProps,
} from '@rpg/ui'

import { CreateSetupSummary, type CreateSetupSummaryProps } from '@/lib/create-setup'

import {
  createModalShellBodyVariants,
  createModalShellContentVariants,
  createModalShellIssueSeparatorClasses,
  createModalShellTabContentVariants,
  createModalShellTabsListRegionVariants,
  createModalShellTabsVisibilityVariants,
  createModalShellTabsVariants,
} from './create-modal-shell.variants'

export type CreateWorkflowPanelStatus = {
  invalid: boolean
  issueCount?: number
  dirty: boolean
  /** When true, composite create submit must stay disabled until resolved. */
  blocksSubmit?: boolean
}

export type CreateWorkflowPanelValidationResult = Readonly<{
  valid: boolean
  issueCount: number
}>

export type CreateWorkflowPanelController = Readonly<{
  validate: () => Promise<CreateWorkflowPanelValidationResult>
  focusFirstIssue: () => void
}>

export type CreateWorkflowDraftPanelController<TPayload, TServerIssue> =
  CreateWorkflowPanelController &
    Readonly<{
      getPayload: () => TPayload
      reset: () => void
      hydrateServerIssues: (issues: readonly TServerIssue[]) => void
    }>

export type CreateModalShellContentMode = 'managed' | 'scroll'

export type CreateModalShellTab = {
  id: string
  label: string
  content: React.ReactNode
  optional?: boolean
  status: CreateWorkflowPanelStatus
  contentMode?: CreateModalShellContentMode
}

export type CreateModalShellProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  headline: React.ReactNode
  description?: React.ReactNode
  setupSummary?: CreateSetupSummaryProps
  tabs?: readonly [CreateModalShellTab, ...CreateModalShellTab[]]
  /** Hides tab chrome/panels without unmounting them while a workflow returns to Setup. */
  tabsVisible?: boolean
  activeTabId?: string
  defaultActiveTabId?: string
  onActiveTabChange?: (tabId: string) => void
  contentMode?: CreateModalShellContentMode
  children?: React.ReactNode
  footer: React.ReactNode
  size?: ModalContentProps['size']
  closeOnOutsideClick?: boolean
  closeOnEscape?: boolean
  'aria-busy'?: boolean
}

function formatIssueAttentionLabel(count: number | undefined): string {
  if (count == null) return 'This section needs attention'
  return `${count} ${count === 1 ? 'issue needs' : 'issues need'} attention`
}

function CreateModalShellIssueBadge({ count }: { count: number | undefined }) {
  return (
    <>
      <span aria-hidden className={createModalShellIssueSeparatorClasses}>
        {' · '}
      </span>
      <Badge appearance="soft" tone="destructive" size="sm" layout="counter" aria-hidden>
        {count ?? '!'}
      </Badge>
      <span className="sr-only">, {formatIssueAttentionLabel(count)}</span>
    </>
  )
}

function CreateModalShellTabs({
  tabs,
  activeTabId,
  defaultActiveTabId,
  onActiveTabChange,
}: Pick<
  CreateModalShellProps,
  'tabs' | 'activeTabId' | 'defaultActiveTabId' | 'onActiveTabChange'
>) {
  if (!tabs) return null

  const fallbackTabId = tabs[0].id

  return (
    <Tabs
      value={activeTabId}
      defaultValue={defaultActiveTabId ?? fallbackTabId}
      onValueChange={onActiveTabChange}
      variant="line"
      className={createModalShellTabsVariants()}
    >
      <div className={createModalShellTabsListRegionVariants()}>
        <TabsList aria-label="Create sections">
          {tabs.map((tab) => {
            return (
              <TabsTrigger key={tab.id} value={tab.id} data-create-tab-trigger={tab.id}>
                {tab.label}
                {tab.optional ? ' (optional)' : null}
                {tab.status.invalid ? (
                  <CreateModalShellIssueBadge count={tab.status.issueCount} />
                ) : null}
              </TabsTrigger>
            )
          })}
        </TabsList>
      </div>

      {tabs.map((tab) => (
        <TabsContent
          key={tab.id}
          value={tab.id}
          forceMount
          data-create-tab-panel={tab.id}
          className={createModalShellTabContentVariants({ mode: tab.contentMode })}
        >
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  )
}

/**
 * Dashboard create-workflow chrome. Domain coordinators own all form state,
 * validation, dirty state, active-domain transitions, and submit orchestration.
 */
export function CreateModalShell({
  open,
  onOpenChange,
  headline,
  description,
  setupSummary,
  tabs,
  tabsVisible = true,
  activeTabId,
  defaultActiveTabId,
  onActiveTabChange,
  contentMode = 'scroll',
  children,
  footer,
  size = 'md',
  closeOnOutsideClick = false,
  closeOnEscape = true,
  'aria-busy': ariaBusy,
}: CreateModalShellProps) {
  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content
        size={size}
        layout="stable"
        stableSize="tall"
        closeOnOutsideClick={closeOnOutsideClick}
        closeOnEscape={closeOnEscape}
        aria-busy={ariaBusy || undefined}
        {...(description == null ? { 'aria-describedby': undefined } : {})}
      >
        <Modal.Header headline={headline} description={description} />
        <Modal.Body stableBody data-create-modal-body className={createModalShellBodyVariants()}>
          {setupSummary ? <CreateSetupSummary {...setupSummary} /> : null}
          {tabs ? (
            <>
              <div
                className={createModalShellTabsVisibilityVariants({ visible: tabsVisible })}
                aria-hidden={!tabsVisible || undefined}
              >
                <CreateModalShellTabs
                  tabs={tabs}
                  activeTabId={activeTabId}
                  defaultActiveTabId={defaultActiveTabId}
                  onActiveTabChange={onActiveTabChange}
                />
              </div>
              {!tabsVisible ? (
                <div
                  data-create-modal-content
                  className={createModalShellContentVariants({ mode: contentMode })}
                >
                  {children}
                </div>
              ) : null}
            </>
          ) : (
            <div
              data-create-modal-content
              className={createModalShellContentVariants({ mode: contentMode })}
            >
              {children}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer data-create-modal-footer>{footer}</Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  )
}
