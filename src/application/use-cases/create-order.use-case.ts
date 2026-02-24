import { IPortfolioApplicationService } from "../ports/portfolio-application-service.port";
import { InstrumentId } from "../../domain/value-objects/instrument-id.vo";
import { OrderSide } from "../../domain/value-objects/order-side.vo";
import { OrderType } from "../../domain/value-objects/order-type.vo";
import { CreateOrderCommand } from "../dtos/create-order.command";
import { CreateOrderResult } from "../dtos/create-order.result";
import { OrderAvailabilityService } from "../../domain/services/order-availability.service";
import { OrderFactoryService } from "../../domain/services/order-factory.service";
import { OrderPricingService } from "../../domain/services/order-pricing.service";
import { OrderSizeService } from "../../domain/services/order-size.service";
import { OrderRepositoryPort } from "../../domain/ports/order-repository.port";
import { InstrumentRepositoryPort } from "../../domain/ports/instrument-repository.port";
import { CachePort } from "../../domain/ports/cache.port";
import { PortfolioResult } from "../../domain/services/portfolio-from-filled-orders.service";
import { ILogger } from "../../domain/ports/logger.port";
import { OrderRejectedError } from "../../domain/errors/order-rejected.error";
import { InstrumentNotFoundError } from "../../domain/errors/instrument-not-found.error";
import { UserId } from "../../domain/value-objects/user-id.vo";
import { OrderDatetime } from "../../domain/value-objects/order-datetime.vo";

interface Dependencies {
  orderRepository: OrderRepositoryPort;
  instrumentRepository: InstrumentRepositoryPort;
  portfolioApplicationService: IPortfolioApplicationService;
  pricingService: OrderPricingService;
  availabilityService: OrderAvailabilityService;
  sizeService: OrderSizeService;
  orderFactory: OrderFactoryService;
  portfolioCache: CachePort<PortfolioResult>;
  logger: ILogger;
}

export class CreateOrderUseCase {
  private readonly orderRepository: OrderRepositoryPort;
  private readonly instrumentRepository: InstrumentRepositoryPort;
  private readonly portfolioApplicationService: IPortfolioApplicationService;
  private readonly pricingService: OrderPricingService;
  private readonly availabilityService: OrderAvailabilityService;
  private readonly sizeService: OrderSizeService;
  private readonly orderFactory: OrderFactoryService;
  private readonly portfolioCache: CachePort<PortfolioResult>;
  private readonly logger: ILogger;

  constructor({ orderRepository, instrumentRepository, portfolioApplicationService, pricingService, availabilityService, sizeService, orderFactory, portfolioCache, logger }: Dependencies) {
    this.orderRepository = orderRepository;
    this.instrumentRepository = instrumentRepository;
    this.portfolioApplicationService = portfolioApplicationService;
    this.pricingService = pricingService;
    this.availabilityService = availabilityService;
    this.sizeService = sizeService;
    this.orderFactory = orderFactory;
    this.portfolioCache = portfolioCache;
    this.logger = logger;
  }

  async execute(command: Readonly<CreateOrderCommand>): Promise<CreateOrderResult> {
    const orderType = OrderType.create(command.type);
    const orderSide = OrderSide.create(command.side);
    const userId = UserId.create(command.userId);
    const datetime = OrderDatetime.create(command.datetime ?? new Date());

    const instrument = await this.instrumentRepository.findById(InstrumentId.create(command.instrumentId));
    if (instrument === undefined) {
      throw new InstrumentNotFoundError(`Instrument ${command.instrumentId} not found.`);
    }
    this.orderFactory.validateInstrumentCompatibility(instrument, orderSide, orderType);

    const price = await this.pricingService.resolveUnitPrice({
      side: orderSide,
      instrument,
      type: orderType,
      price: command.price,
    });

    const portfolio = await this.portfolioApplicationService.getOrderAvailability(userId);

    const orderSize = this.sizeService.resolveSize({ size: command.size, amount: command.amount, side: orderSide, price });

    const availability = this.availabilityService.validate({
      side: orderSide,
      instrument,
      size: orderSize,
      price,
      pesosBalance: portfolio.pesosBalance,
      assets: portfolio.assets,
    });

    if (!availability.success) {
      const rejectedOrder = this.orderFactory.createRejected({
        userId,
        instrument,
        side: orderSide,
        type: orderType,
        size: orderSize,
        price,
        datetime,
      });
      await this.orderRepository.save(rejectedOrder);
      throw new OrderRejectedError(availability.reason);
    }

    const order = this.orderFactory.createAccepted({
      userId,
      instrument,
      side: orderSide,
      type: orderType,
      size: orderSize,
      price,
      datetime,
    });

    const persistedOrder = await this.orderRepository.save(order);
    const cacheKey = `portfolio:${userId.value}`;
    await this.portfolioCache.delete(cacheKey);
    this.logger.info(`[Cache INVALIDATED] ${cacheKey}`);
    return { order: persistedOrder };
  }
}
