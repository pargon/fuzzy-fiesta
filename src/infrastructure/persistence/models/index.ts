import { InstrumentModel } from "./instruments.model";
import { MarketDataModel } from "./marketdata.model";
import { OrderModel } from "./orders.model";
import { UserModel } from "./users.model";

export { InstrumentModel, MarketDataModel, OrderModel, UserModel };

export const PERSISTENCE_MODELS = [
  InstrumentModel,
  MarketDataModel,
  OrderModel,
  UserModel,
] as const;
