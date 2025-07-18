import { API_URL } from "@/lib/constants";

export const createAccount = async (accountData: {
  name: string;
  currency: string;
  initial_balance: number;
}) => {
  const response = await fetch(`${API_URL}/account`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(accountData),
  });

  if (!response.ok) {
    throw new Error("Failed to create account");
  }

  return response.json();
};

export const getAccounts = async () => {
  const response = await fetch(`${API_URL}/account`);

  if (!response.ok) {
    throw new Error("Failed to fetch accounts");
  }

  return response.json();
};

export const getAccount = async (accountId: string) => {
  const response = await fetch(`${API_URL}/account/${accountId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch account");
  }

  return response.json();
};

export const getTrades = async () => {
  const response = await fetch(`${API_URL}/trade`);

  if (!response.ok) {
    throw new Error("Failed to fetch trades");
  }

  return response.json();
};

export const getTradesByAccount = async (accountId: string) => {
  const allTrades = await getTrades();
  return allTrades.filter((trade: any) => trade.account_id === accountId);
};

export const getTrade = async (tradeId: string) => {
  const response = await fetch(`${API_URL}/trade?id=${tradeId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch trade");
  }

  return response.json();
};

export const createTrade = async (tradeData: {
  account_id: string;
  currency_pair: string;
  direction: string;
  rationale: string;
  outcome: string;
  profit_loss?: number;
  retrospective?: string;
  created_at: string;
}) => {
  const response = await fetch(`${API_URL}/trade`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(tradeData),
  });

  if (!response.ok) {
    throw new Error("Failed to create trade");
  }

  return response.json();
};

export const updateTrade = async (tradeId: string, tradeData: any) => {
  const response = await fetch(`${API_URL}/trade?id=${tradeId}`, {
      method: "PATCH",
      headers: {
          "Content-Type": "application/json",
      },
      body: JSON.stringify(tradeData),
  });

  if (!response.ok) {
      throw new Error("Failed to update trade");
  }

  return response.json();
};