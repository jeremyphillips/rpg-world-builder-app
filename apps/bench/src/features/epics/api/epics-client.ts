import type { CreateEpicInput, Epic, UpdateEpicInput } from '@rpg/contracts/dev-bench'
import { epicSchema } from '@rpg/contracts/dev-bench'
import { request } from '@rpg/api-client'

import { benchSendJson } from '@/lib/api/bench-send-json'
import { BENCH_EPICS_PATH, epicDetailPath } from '@/lib/api/dev-bench-paths'

export async function fetchEpics(): Promise<Epic[]> {
  const { epics } = await request<{ epics: unknown[] }>(
    BENCH_EPICS_PATH,
    undefined,
    'Could not load epics.',
  )
  return epics.map((epic) => epicSchema.parse(epic))
}

export async function fetchEpic(epicId: string): Promise<Epic> {
  const { epic } = await request<{ epic: unknown }>(
    epicDetailPath(epicId),
    undefined,
    'Could not load epic.',
  )
  return epicSchema.parse(epic)
}

export async function createEpic(input: CreateEpicInput): Promise<Epic> {
  const { epic } = await benchSendJson<{ epic: unknown }>(
    'POST',
    BENCH_EPICS_PATH,
    input,
    'Could not create epic.',
  )
  return epicSchema.parse(epic)
}

export async function updateEpic(epicId: string, input: UpdateEpicInput): Promise<Epic> {
  const { epic } = await benchSendJson<{ epic: unknown }>(
    'PATCH',
    epicDetailPath(epicId),
    input,
    'Could not update epic.',
  )
  return epicSchema.parse(epic)
}

export async function deleteEpic(epicId: string): Promise<void> {
  await benchSendJson<void>('DELETE', epicDetailPath(epicId), undefined, 'Could not delete epic.')
}
