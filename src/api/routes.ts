import { Express } from "express";
import { createContainer } from "../infrastructure/di/container";
import { InstrumentController } from "../infrastructure/controllers/instrument.controller";
import { OrderController } from "../infrastructure/controllers/order.controller";
import { PortfolioController } from "../infrastructure/controllers/portfolio.controller";

export function registerRoutes(app: Express) {
  const container = createContainer();
  const orderController = container.resolve<OrderController>("orderController");
  const instrumentController = container.resolve<InstrumentController>("instrumentController");
  const portfolioController = container.resolve<PortfolioController>("portfolioController");

  app.get("/instruments", (req, res) => instrumentController.search(req, res));
  app.get("/portfolio/:userId", (req, res) => portfolioController.get(req, res));
  app.post("/orders", (req, res) => orderController.create(req, res));
  app.delete("/orders/:orderId", (req, res) => orderController.cancel(req, res));
}
