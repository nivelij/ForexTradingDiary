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