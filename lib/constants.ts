export const API_URL = "https://1dtcuwdbvf.execute-api.eu-central-1.amazonaws.com/live";

export const CURRENCY_PAIRS = [
  "EUR/USD",
  "GBP/USD",
  "USD/JPY",
  "USD/CHF",
  "AUD/USD",
  "USD/CAD",
  "NZD/USD",
  "EUR/GBP",
  "EUR/JPY",
  "GBP/JPY",
  "CHF/JPY",
  "EUR/CHF",
  "AUD/JPY",
  "GBP/CHF",
  "NZD/JPY",
  "CAD/JPY",
  "AUD/CHF",
  "EUR/AUD",
  "GBP/AUD",
  "EUR/CAD",
  "GBP/CAD",
  "AUD/CAD",
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