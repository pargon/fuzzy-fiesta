import "express-async-errors";
import express from "express";
import swaggerUi from "swagger-ui-express";
import yaml from "js-yaml";
import fs from "fs";
import path from "path";
import { errorMiddleware } from "./error-middleware";
import { registerRoutes } from "./routes";
import { getSequelizeClient } from "../infrastructure/persistence/sequelize-client";

const swaggerDocument = yaml.load(
  fs.readFileSync(path.join(__dirname, "../infrastructure/docs/swagger.yaml"), "utf-8"),
) as object;

export function createApp() {
  getSequelizeClient();

  const app = express();
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  registerRoutes(app);
  app.use(errorMiddleware);

  return app;
}
