import { MongoClient } from 'mongodb'

import { flatten } from './utils'

interface MongoOptions {
  url: string,
  database: string
}

interface MongoResult {
  id: string,
  data: Record<string, any>
}

export enum MongoErrors {
  MissingOptions = 'Missing options at mongo instanciation, `database & url` are required',
  MissingCollectionOrData = 'Missing collection or data in query',
  MissingId = 'Missing `id` or `_id` in params or data'
}

export class MongoPlugin {
  dbType: string
  dbName: string
  mongoUrl: string

  client: Record<string, any>
  db: Record<string, any>

  constructor (options: MongoOptions) {
    if (!options || !options.database || !options.url) {
      throw new Error(MongoErrors.MissingOptions)
    }

    this.dbType = 'mongo'
    this.dbName = options.database
    this.mongoUrl = options.url
  }

  async connect (): Promise<Object> {
    const client = await MongoClient.connect(this.mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })

    this.client = client
    this.db = client.db(this.dbName)

    return { client: this.client, db: this.db }
  }

  async create (collection: string, data: Object): Promise<MongoResult> {
    if (!collection || !data) throw new Error(MongoErrors.MissingCollectionOrData)

    await this.connect()
    const inserted = await this.db.collection(collection).insertOne(data)
    this.client.close()

    const { ops, insertedId } = inserted
    return { id: insertedId, data: ops[0] }
  }

  async update (collection: string, data: Record<string, any>, id: string) : Promise<MongoResult> {
    if (!collection || !data) throw new Error(MongoErrors.MissingCollectionOrData)
    if (!id && !data._id) throw new Error(MongoErrors.MissingId)

    await this.connect()

    const { _id, ...rest } = data
    const flatData = flatten(rest)

    const updated = await this.db.collection(collection).findOneAndUpdate({
      _id: id || _id
    }, {
      $set: flatData
    }, {
      returnOriginal: false
    })
    this.client.close()

    const { value } = updated
    return { id: value._id, data: value }
  }
}
