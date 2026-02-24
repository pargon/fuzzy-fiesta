import { Sequelize } from "sequelize-typescript";
import { PERSISTENCE_MODELS } from "./models";

let sequelizeInstance: Sequelize | undefined;

function createSequelizeClient(): Sequelize {
  const sslEnabled = process.env.DB_SSL !== "false";

  return new Sequelize({
    dialect: "postgres",
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 5432),
    database: process.env.DB_NAME ?? "fuzzy_db",
    username: process.env.DB_USER ?? "postgres",
    password: process.env.DB_PASSWORD ?? "postgres",
    models: [...PERSISTENCE_MODELS],
    timezone: "+00:00",
    logging: false,
    dialectOptions: sslEnabled
      ? { ssl: { require: true, rejectUnauthorized: false } }
      : {},
  });
}

export function getSequelizeClient(): Sequelize {
  if (sequelizeInstance === undefined) {
    sequelizeInstance = createSequelizeClient();
  }

  return sequelizeInstance;
}
