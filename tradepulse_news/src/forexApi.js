//
// forexApi.js
//
// Utility functions for fetching forex rates from exchangerate-api.com
//

const EXCHANGE_API_KEY = "7db3ad8b056db8243b7f1e06";
const EXCHANGE_BASE_URL = "https://v6.exchangerate-api.com/v6";

/**
 * PUBLIC_INTERFACE
 * Fetches the USD to target currency exchange rate from exchangerate-api.com
 * @param {string} targetCurrency - 3-letter ISO code of the target currency (e.g., 'EUR', 'INR')
 * @returns {Promise<{ rate: number, error: string|null }>} Exchange rate result
 */
export async function fetchUsdToCurrencyRate(targetCurrency) {
  try {
    const url = `${EXCHANGE_BASE_URL}/${EXCHANGE_API_KEY}/latest/USD`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Could not fetch rates");
    const data = await response.json();
    // API returns { conversion_rates: { ... } }
    if (
      !data ||
      !data.conversion_rates ||
      typeof data.conversion_rates[targetCurrency] !== 'number'
    ) {
      throw new Error("Invalid currency code or rate unavailable");
    }
    return { rate: data.conversion_rates[targetCurrency], error: null };
  } catch (err) {
    return { rate: null, error: err.message || "API Error" };
  }
}
