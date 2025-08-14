export const API_URL = "https://1dtcuwdbvf.execute-api.eu-central-1.amazonaws.com/live";

export const CURRENCY_PAIRS = [
  "EURUSD",
  "GBPUSD",
  "USDJPY",
  "USDCHF",
  "AUDUSD",
  "USDCAD",
  "NZDUSD",
  "EURGBP",
  "EURJPY",
  "GBPJPY",
  "CHFJPY",
  "EURCHF",
  "AUDJPY",
  "GBPCHF",
  "NZDJPY",
  "CADJPY",
  "AUDCHF",
  "EURAUD",
  "GBPAUD",
  "EURCAD",
  "GBPCAD",
  "AUDCAD",
  "XAUEUR",
  "XAUUSD",
  "XTIUSD",
  "US500",
] as const;

export const TRADE_OUTCOMES = [
  "OPEN",
  "WIN", 
  "LOSS",
  "BREAK_EVEN"
] as const;

export const TRADE_DIRECTIONS = [
  "BUY",
  "SELL"
] as const;