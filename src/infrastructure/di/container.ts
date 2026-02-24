import { asClass, createContainer as createAwilixContainer, InjectionMode } from "awilix";
import { CreateOrderUseCase } from "../../application/use-cases/create-order.use-case";
import { CancelOrderUseCase } from "../../application/use-cases/cancel-order.use-case";
import { GetPortfolioUseCase } from "../../application/use-cases/get-portfolio.use-case";
import { SearchInstrumentsUseCase } from "../../application/use-cases/search-instruments.use-case";
import { PortfolioApplicationService } from "../../application/services/portfolio.application-service";
import { PortfolioFromFilledOrdersService } from "../../domain/services/portfolio-from-filled-orders.service";
import { OrderAvailabilityService } from "../../domain/services/order-availability.service";
import { OrderFactoryService } from "../../domain/services/order-factory.service";
import { OrderPricingService } from "../../domain/services/order-pricing.service";
import { OrderSizeService } from "../../domain/services/order-size.service";
import { InstrumentController } from "../controllers/instrument.controller";
import { OrderController } from "../controllers/order.controller";
import { PortfolioController } from "../controllers/portfolio.controller";
import { InstrumentRepository } from "../persistence/repositories/instrument.repository";
import { MarketDataRepository } from "../persistence/repositories/market-data.repository";
import { OrderRepository } from "../persistence/repositories/order.repository";
import { ConsoleLogger } from "../logger/console.logger";
import { InMemoryCacheAdapter } from "../cache/in-memory-cache.adapter";

export function createContainer() {
  const container = createAwilixContainer({
    injectionMode: InjectionMode.PROXY,
  });

  container.register({
    logger: asClass(ConsoleLogger).singleton(),
    portfolioCache: asClass(InMemoryCacheAdapter).singleton(),
    
    orderRepository: asClass(OrderRepository).scoped(),
    instrumentRepository: asClass(InstrumentRepository).scoped(),
    marketDataReader: asClass(MarketDataRepository).scoped(),
    
    portfolioService: asClass(PortfolioFromFilledOrdersService).scoped(),
    portfolioApplicationService: asClass(PortfolioApplicationService).scoped(),
    availabilityService: asClass(OrderAvailabilityService).scoped(),
    sizeService: asClass(OrderSizeService).scoped(),
    orderFactory: asClass(OrderFactoryService).scoped(),
    pricingService: asClass(OrderPricingService).scoped(),
    createOrderUseCase: asClass(CreateOrderUseCase).scoped(),
    cancelOrderUseCase: asClass(CancelOrderUseCase).scoped(),
    searchInstrumentsUseCase: asClass(SearchInstrumentsUseCase).scoped(),
    getPortfolioUseCase: asClass(GetPortfolioUseCase).scoped(),
    orderController: asClass(OrderController).scoped(),
    instrumentController: asClass(InstrumentController).scoped(),
    portfolioController: asClass(PortfolioController).scoped(),
  });

  return container;
}
