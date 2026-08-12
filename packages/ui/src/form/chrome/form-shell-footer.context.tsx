'use client'

import * as React from 'react'
import { useLayoutEffect, useSyncExternalStore } from 'react'

import { DialogPanelActionRow } from '../../components/ui/dialog-panel-action-row.client'
import { Text } from '../../components/ui/text'

export type FormShellFooterModel = {
  formId: string
  footer: React.ReactNode
  formError: string | null
  validationSummary?: React.ReactNode
}

type FormShellFooterStore = {
  activePublisherId: string | null
  model: FormShellFooterModel | null
  listeners: Set<() => void>
}

type FormShellFooterScopeContextValue = {
  register: (publisherId: string, model: FormShellFooterModel) => void
  unregister: (publisherId: string) => void
  subscribe: (listener: () => void) => () => void
  getSnapshot: () => FormShellFooterModel | null
}

const FormShellFooterScopeContext = React.createContext<FormShellFooterScopeContextValue | null>(
  null,
)

const FormShellFooterFormIdContext = React.createContext<string | null>(null)

function createFormShellFooterStore(): FormShellFooterScopeContextValue {
  const store: FormShellFooterStore = {
    activePublisherId: null,
    model: null,
    listeners: new Set(),
  }

  const emit = () => {
    for (const listener of store.listeners) {
      listener()
    }
  }

  return {
    register(publisherId, model) {
      if (
        store.activePublisherId != null &&
        store.activePublisherId !== publisherId &&
        process.env.NODE_ENV !== 'production'
      ) {
        console.error(
          'FormShellFooterScope: a second form attempted to publish a footer model. Only one active publisher is allowed per scope.',
        )
      }
      store.activePublisherId = publisherId
      store.model = model
      emit()
    },
    unregister(publisherId) {
      if (store.activePublisherId !== publisherId) return
      store.activePublisherId = null
      store.model = null
      emit()
    },
    subscribe(listener) {
      store.listeners.add(listener)
      return () => {
        store.listeners.delete(listener)
      }
    },
    getSnapshot() {
      return store.model
    },
  }
}

/** Wrap overlay content so a form body and external footer slot share one footer model store. */
export function FormShellFooterScope({ children }: { children: React.ReactNode }) {
  const [store] = React.useState(createFormShellFooterStore)

  return (
    <FormShellFooterScopeContext.Provider value={store}>
      {children}
    </FormShellFooterScopeContext.Provider>
  )
}

function useFormShellFooterScope(): FormShellFooterScopeContextValue {
  const scope = React.useContext(FormShellFooterScopeContext)
  if (!scope) {
    throw new Error(
      'FormShellFooterScope is required when using externalFooter or FormShellFooterSlot.',
    )
  }
  return scope
}

export function useFormShellFooterModel(): FormShellFooterModel | null {
  const scope = useFormShellFooterScope()
  return useSyncExternalStore(scope.subscribe, scope.getSnapshot, scope.getSnapshot)
}

const noopSubscribe = () => () => {}
const noopSnapshot = (): FormShellFooterModel | null => null

/** Read the active external footer form id — used by submit buttons outside the `<form>` element. */
export function useFormShellFooterFormId(): string | null {
  const scopedFormId = React.useContext(FormShellFooterFormIdContext)
  const scope = React.useContext(FormShellFooterScopeContext)
  const model = useSyncExternalStore(
    scope?.subscribe ?? noopSubscribe,
    scope?.getSnapshot ?? noopSnapshot,
    scope?.getSnapshot ?? noopSnapshot,
  )

  if (scopedFormId) return scopedFormId
  if (!scope) return null

  return model?.formId ?? null
}

export type FormShellFooterContentProps = {
  model: FormShellFooterModel
}

/** Semantic overlay footer: form error, validation summary, and action row only. */
export function FormShellFooterContent({ model }: FormShellFooterContentProps) {
  const { formError, validationSummary, footer } = model
  const hasContent = Boolean(formError || validationSummary || footer)

  if (!hasContent) {
    return null
  }

  return (
    <FormShellFooterFormIdContext.Provider value={model.formId}>
      {formError ? (
        <Text variant="destructive" role="alert" className="mb-3">
          {formError}
        </Text>
      ) : null}
      {validationSummary}
      {footer ? <DialogPanelActionRow>{footer}</DialogPanelActionRow> : null}
    </FormShellFooterFormIdContext.Provider>
  )
}

export type FormShellFooterPublisherProps = {
  model: FormShellFooterModel | null
}

/** Publishes footer semantics into the enclosing FormShellFooterScope. */
export function FormShellFooterPublisher({ model }: FormShellFooterPublisherProps) {
  const scope = useFormShellFooterScope()
  const publisherId = React.useId()

  useLayoutEffect(() => {
    if (!model) {
      scope.unregister(publisherId)
      return
    }
    scope.register(publisherId, model)
    return () => {
      scope.unregister(publisherId)
    }
  }, [model, publisherId, scope])

  return null
}

/** Renders published footer semantics for placement inside overlay shell chrome. */
export function FormShellFooterSlot() {
  const model = useFormShellFooterModel()
  if (!model) return null
  return <FormShellFooterContent model={model} />
}
