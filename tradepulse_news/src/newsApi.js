//
// newsApi.js
//
// Utility functions for fetching news from newsdata.io
//
const API_KEY = "pub_a25a24927f0242838ee4292e78ada861";
const BASE_URL = "https://newsdata.io/api/1/news";

// PUBLIC_INTERFACE
/**
 * Fetches news articles for a given country code (ISO 3166-1 alpha-2).
 * Optionally filter by category.
 * @param {string} countryCode - ISO 2-letter country code (e.g., 'us', 'in', 'gb')
 * @param {string} [category] - Optional news category (economy, business, crypto, etc)
 * @returns {Promise<{results: array, totalResults: number, error: string|null}>} News results object
 */
export async function fetchNewsByCountry(countryCode, category) {
  let url = `${BASE_URL}?apikey=${API_KEY}&country=${countryCode}`;
  if (category) url += `&category=${encodeURIComponent(category)}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch news");
    const data = await response.json();
    return {
      results: data.results || [],
      totalResults: data.totalResults || 0,
      error: null,
    };
  } catch (err) {
    return {
      results: [],
      totalResults: 0,
      error: err.message || "Error",
    };
  }
}
