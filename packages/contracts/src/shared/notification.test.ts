import { describe, expect, it } from 'vitest'

import {
  NOTIFICATION_CATEGORY_ENTRIES,
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_CLASSIFICATION_BY_TYPE,
  NOTIFICATION_PRIORITIES,
  NOTIFICATION_PRIORITY_ENTRIES,
  NOTIFICATION_TOPIC_ENTRIES,
  NOTIFICATION_TOPICS,
} from './notification-classification'
import {
  NOTIFICATION_PAYLOAD_SCHEMAS,
  notificationPayloadSchemaKeys,
} from './notification-payloads'
import { notificationSchema } from './notification'
import { NOTIFICATION_TYPES } from './notification-types'

describe('notification inventory parity', () => {
  it('covers every notification type with a payload schema', () => {
    expect(Object.keys(NOTIFICATION_PAYLOAD_SCHEMAS).sort()).toEqual([...NOTIFICATION_TYPES].sort())
    expect(notificationPayloadSchemaKeys).toEqual(NOTIFICATION_TYPES)
  })

  it('covers every notification type in the public DTO union', () => {
    const dtoTypes = notificationSchema.options.map((option) => option.shape.type.value)
    expect(dtoTypes.sort()).toEqual([...NOTIFICATION_TYPES].sort())
  })

  it('has no duplicate notification type keys', () => {
    expect(new Set(NOTIFICATION_TYPES).size).toBe(NOTIFICATION_TYPES.length)
  })
})

describe('notification classification vocab', () => {
  it('covers every notification type with classification defaults', () => {
    expect(Object.keys(NOTIFICATION_CLASSIFICATION_BY_TYPE).sort()).toEqual(
      [...NOTIFICATION_TYPES].sort(),
    )
  })

  it('covers every category with entries', () => {
    for (const category of NOTIFICATION_CATEGORIES) {
      expect(NOTIFICATION_CATEGORY_ENTRIES[category]).toBeDefined()
    }
    expect(Object.keys(NOTIFICATION_CATEGORY_ENTRIES).sort()).toEqual(
      [...NOTIFICATION_CATEGORIES].sort(),
    )
  })

  it('covers every topic with entries', () => {
    for (const topic of NOTIFICATION_TOPICS) {
      expect(NOTIFICATION_TOPIC_ENTRIES[topic]).toBeDefined()
    }
    expect(Object.keys(NOTIFICATION_TOPIC_ENTRIES).sort()).toEqual([...NOTIFICATION_TOPICS].sort())
  })

  it('covers every priority with entries', () => {
    for (const priority of NOTIFICATION_PRIORITIES) {
      expect(NOTIFICATION_PRIORITY_ENTRIES[priority]).toBeDefined()
    }
    expect(Object.keys(NOTIFICATION_PRIORITY_ENTRIES).sort()).toEqual(
      [...NOTIFICATION_PRIORITIES].sort(),
    )
  })
})
