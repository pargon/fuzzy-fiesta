import { MarketDataReaderPort } from "../../domain/ports/market-data-reader.port";
import { OrderRepositoryPort } from "../../domain/ports/order-repository.port";
import { InstrumentRepositoryPort } from "../../domain/ports/instrument-repository.port";
import { CachePort } from "../../domain/ports/cache.port";
import { IPortfolioCalculatorPort } from "../../domain/ports/portfolio-calculator.port";
import { ILogger } from "../../domain/ports/logger.port";
import {
  InstrumentInfo,
  PortfolioResult,
  OrderAvailability
} from "../../domain/services/portfolio-from-filled-orders.service";
import { InstrumentId } from "../../domain/value-objects/instrument-id.vo";
import { UserId } from "../../domain/value-objects/user-id.vo";
import { IPortfolioApplicationService } from "../ports/portfolio-application-service.port";

const cacheKey = (userId: number): string => `portfolio:${userId}`;

interface Dependencies {
  orderRepository: OrderRepositoryPort;
  instrumentRepository: InstrumentRepositoryPort;
  marketDataReader: MarketDataReaderPort;
  portfolioService: IPortfolioCalculatorPort;
  portfolioCache: CachePort<PortfolioResult>;
  logger: ILogger;
}

export class PortfolioApplicationService implements IPortfolioApplicationService {
  private readonly orderRepository: OrderRepositoryPort;
  private readonly instrumentRepository: InstrumentRepositoryPort;
  private readonly marketDataReader: MarketDataReaderPort;
  private readonly portfolioService: IPortfolioCalculatorPort;
  private readonly portfolioCache: CachePort<PortfolioResult>;
  private readonly logger: ILogger;

  constructor({ orderRepository, instrumentRepository, marketDataReader, portfolioService, portfolioCache, logger }: Dependencies) {
    this.orderRepository = orderRepository;
    this.instrumentRepository = instrumentRepository;
    this.marketDataReader = marketDataReader;
    this.portfolioService = portfolioService;
    this.portfolioCache = portfolioCache;
    this.logger = logger;
  }

  async getOrderAvailability(userId: UserId): Promise<OrderAvailability> {
    const filledOrders = await this.orderRepository.getFilledByUserIdSortedByDate(userId);
    return this.portfolioService.calculatePositions(filledOrders);
  }

  async calculateForUser(userId: UserId): Promise<PortfolioResult> {
    const key = cacheKey(userId.value);
    const cached = await this.portfolioCache.get(key);
    if (cached !== undefined) {
      this.logger.info(`[Cache HIT] ${key}`);
      return cached;
    }
    this.logger.info(`[Cache MISS] ${key}`);

    const filledOrders = await this.orderRepository.getFilledByUserIdSortedByDate(userId);

    const instrumentIds = [...new Set(filledOrders.map((o) => o.instrumentId.value))].map((id) =>
      InstrumentId.create(id),
    );

    const [instruments, pricesArray] = await Promise.all([
      this.instrumentRepository.findByIds(instrumentIds),
      this.marketDataReader.getPricesByInstrumentIds(instrumentIds),
    ]);

    const instrumentMap = new Map<number, InstrumentInfo>(
      instruments.map((i) => [i.id.value, { ticker: i.ticker.value, description: i.name.value }]),
    );
    const priceMap = new Map(pricesArray.map((p) => [p.instrumentId, { close: p.close, previousClose: p.previousClose }]));

    const result = this.portfolioService.calculate(filledOrders, instrumentMap, priceMap);
    await this.portfolioCache.set(key, result);
    return result;
  }
}
