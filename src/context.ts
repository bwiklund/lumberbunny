import * as mongo from "mongodb";

export interface Ctx {
  dbClient: mongo.MongoClient;
  db: mongo.Db;
}

export interface AppConfig {
  dbHost: string;
  dbName: string;
}

export async function createContext(config: AppConfig): Promise<Ctx> {
  let dbClient = await mongo.MongoClient.connect(config.dbHost);
  return {
    dbClient,
    db: dbClient.db(config.dbName)
  };
}
