import { MongoMemoryServer } from 'mongodb-memory-server'

export default async function globalSetup({
  provide,
}: {
  provide: (key: 'mongoUri', value: string) => void
}): Promise<() => Promise<void>> {
  const mongod = await MongoMemoryServer.create()
  provide('mongoUri', mongod.getUri())

  return async () => {
    await mongod.stop()
  }
}
