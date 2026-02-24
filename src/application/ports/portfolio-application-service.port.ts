import { UserId } from "../../domain/value-objects/user-id.vo";
import { OrderAvailability, PortfolioResult } from "../../domain/services/portfolio-from-filled-orders.service";

export interface IPortfolioApplicationService {
  getOrderAvailability(userId: UserId): Promise<OrderAvailability>;
  calculateForUser(userId: UserId): Promise<PortfolioResult>;
}
