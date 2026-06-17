import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthHeaders = () => {
  const accessToken = localStorage.getItem("userToken");
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
};

export const createCheckoutSession = async () => {
  const response = await axios.post(
    `${API_BASE_URL}/payments/create-checkout-session/`,
    {},
    { headers: getAuthHeaders() }
  );

  if (!response.data?.success || !response.data?.data?.url) {
    throw new Error(response.data?.message || "Unable to start checkout");
  }

  return response.data.data.url;
};

export const getPaymentStatus = async (sessionId) => {
  const endpoint = sessionId
    ? `${API_BASE_URL}/payments/status/?session_id=${encodeURIComponent(sessionId)}`
    : `${API_BASE_URL}/payments/status/`;

  const response = await axios.get(endpoint, {
    headers: getAuthHeaders(),
  });

  if (!response.data?.success) {
    throw new Error(response.data?.message || "Unable to fetch payment status");
  }

  return response.data.data;
};
