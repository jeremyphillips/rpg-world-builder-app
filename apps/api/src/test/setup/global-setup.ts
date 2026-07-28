import { MongoMemoryReplSet } from 'mongodb-memory-server'

export default async function globalSetup({
  provide,
}: {
  provide: (key: 'mongoUri', value: string) => void
}): Promise<() => Promise<void>> {
  const replSet = await MongoMemoryReplSet.create({
    replSet: { count: 1, storageEngine: 'wiredTiger' },
  })
  await replSet.waitUntilRunning()
  provide('mongoUri', replSet.getUri())

  return async () => {
    await replSet.stop()
  }
}
