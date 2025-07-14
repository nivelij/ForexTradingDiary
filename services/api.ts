import { API_URL } from "@/lib/constants";

export const createAccount = async (accountData: {
  name: string;
  currency: string;
  balance: number;
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