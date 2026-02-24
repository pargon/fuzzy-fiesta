import { MarketDataReaderPort } from "../../domain/ports/market-data-reader.port";
import { OrderRepositoryPort } from "../../domain/ports/order-repository.port";
import { InstrumentRepositoryPort } from "../../domain/ports/instrument-repository.port";
import {
  PortfolioFromFilledOrdersService,
  InstrumentInfo,
  PortfolioResult,
  OrderAvailability
} from "../../domain/services/portfolio-from-filled-orders.service";
import { InstrumentId } from "../../domain/value-objects/instrument-id.vo";
import { UserId } from "../../domain/value-objects/user-id.vo";
import { IPortfolioApplicationService } from "../ports/portfolio-application-service.port";

interface Dependencies {
  orderRepository: OrderRepositoryPort;
  instrumentRepository: InstrumentRepositoryPort;
  marketDataReader: MarketDataReaderPort;
  portfolioService: PortfolioFromFilledOrdersService;
}

export class PortfolioApplicationService implements IPortfolioApplicationService {
  private readonly orderRepository: OrderRepositoryPort;
  private readonly instrumentRepository: InstrumentRepositoryPort;
  private readonly marketDataReader: MarketDataReaderPort;
  private readonly portfolioService: PortfolioFromFilledOrdersService;

  constructor({ orderRepository, instrumentRepository, marketDataReader, portfolioService }: Dependencies) {
    this.orderRepository = orderRepository;
    this.instrumentRepository = instrumentRepository;
    this.marketDataReader = marketDataReader;
    this.portfolioService = portfolioService;
  }

  async getOrderAvailability(userId: UserId): Promise<OrderAvailability> {
    const filledOrders = await this.orderRepository.getFilledByUserIdSortedByDate(userId);
    return this.portfolioService.calculatePositions(filledOrders);
  }

  async calculateForUser(userId: UserId): Promise<PortfolioResult> {
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

    return this.portfolioService.calculate(filledOrders, instrumentMap, priceMap);
  }
}
