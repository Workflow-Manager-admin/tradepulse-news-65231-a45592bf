import React, { useState, useEffect } from 'react';
import './App.css';
import { fetchNewsByCountry } from './newsApi';
import { fetchUsdToCurrencyRate } from './forexApi';

// Supported countries, expand as needed (code: ISO 2-letter, name: display name, currency: ISO 3-letter)
const COUNTRY_LIST = [
  { code: 'us', name: 'United States', currency: 'USD' },
  { code: 'in', name: 'India', currency: 'INR' },
  { code: 'gb', name: 'United Kingdom', currency: 'GBP' },
  { code: 'jp', name: 'Japan', currency: 'JPY' },
  { code: 'de', name: 'Germany', currency: 'EUR' },
  { code: 'au', name: 'Australia', currency: 'AUD' },
  { code: 'fr', name: 'France', currency: 'EUR' },
];

// Supported currency selection for demo: choose based on country or manually
const SUPPORTED_CURRENCIES = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'EUR', name: 'Euro' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'CHF', name: 'Swiss Franc' },
];

// Lists a basic subset for demo simplicity
function App() {
  const [country, setCountry] = useState('us');
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalResults, setTotalResults] = useState(0);

  // Forex states
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [exchangeRate, setExchangeRate] = useState(null);
  const [forexLoading, setForexLoading] = useState(false);
  const [forexError, setForexError] = useState('');

  // Automatically switch currency when country changes, unless already manually changed
  useEffect(() => {
    const found = COUNTRY_LIST.find(c => c.code === country);
    if (found) setSelectedCurrency(found.currency);
    // eslint-disable-next-line
  }, [country]);

  // Fetch news whenever country changes
  useEffect(() => {
    let ignore = false;
    async function getNews() {
      setLoading(true);
      setError('');
      setNews([]);
      setTotalResults(0);
      const response = await fetchNewsByCountry(country);
      if (!ignore) {
        if (response.error) setError(response.error);
        else {
          setNews(response.results);
          setTotalResults(response.totalResults);
        }
        setLoading(false);
      }
    }
    getNews();
    return () => { ignore = true; };
  }, [country]);

  // Fetch forex rate whenever selectedCurrency changes
  useEffect(() => {
    let ignore = false;
    // Don't fetch if USD (rate will always be 1.0)
    async function getForex() {
      setForexLoading(true);
      setForexError('');
      setExchangeRate(null);
      if (selectedCurrency === 'USD') {
        setExchangeRate(1.0);
        setForexLoading(false);
        return;
      }
      const { rate, error } = await fetchUsdToCurrencyRate(selectedCurrency);
      if (!ignore) {
        if (error) setForexError(error);
        else setExchangeRate(rate);
        setForexLoading(false);
      }
    }
    getForex();
    return () => { ignore = true; };
  }, [selectedCurrency]);

  // PUBLIC_INTERFACE
  /**
   * Handles changing the selected country.
   * @param {Event} event 
   */
  function handleCountryChange(event) {
    setCountry(event.target.value);
  }

  // PUBLIC_INTERFACE
  /**
   * Handles changing the selected target currency.
   * @param {Event} e 
   */
  function handleCurrencyChange(e) {
    setSelectedCurrency(e.target.value);
  }

  return (
    <div className="app">
      <nav className="navbar">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <div className="logo">
              <span className="logo-symbol">*</span> KAVIA AI
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <select
                value={country}
                className="btn"
                style={{ background: 'var(--base-light)', color: '#222', fontWeight: 500, marginRight: '1rem' }}
                onChange={handleCountryChange}
                data-testid="country-select"
              >
                {COUNTRY_LIST.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
              <select
                value={selectedCurrency}
                className="btn"
                style={{ background: 'var(--base-light)', color: '#222', fontWeight: 500 }}
                onChange={handleCurrencyChange}
                data-testid="currency-select"
              >
                {SUPPORTED_CURRENCIES.map((cu) => (
                  <option key={cu.code} value={cu.code}>
                    {cu.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <div className="container">
          {/* Forex Rate Section */}
          <div style={{
            marginTop: 80,
            marginBottom: 32,
            padding: '18px 12px',
            border: '1px solid var(--border-color)',
            borderRadius: 5,
            maxWidth: 430,
            background: 'rgba(255,255,255,0.06)',
          }}>
            <div style={{ fontWeight: 500, marginBottom: 4, color: 'var(--base-light)' }}>
              USD to {selectedCurrency} Exchange Rate
            </div>
            {forexLoading && (
              <div style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Loading rate...</div>
            )}
            {forexError && (
              <div style={{ color: '#ff6565', fontWeight: 500 }}>
                Error: {forexError}
              </div>
            )}
            {!forexLoading && !forexError && exchangeRate !== null && (
              <div style={{ fontSize: '2.3rem', fontWeight: 600, color: '#fff', marginBottom: 6 }}>
                1 USD = {exchangeRate.toLocaleString(undefined, { maximumFractionDigits: 4 })} {selectedCurrency}
              </div>
            )}
            <div style={{ fontSize: '0.96rem', color: 'var(--text-secondary)' }}>
              Powered by <a href="https://www.exchangerate-api.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--base-light)' }}>ExchangeRate-API</a>
            </div>
          </div>

          <div className="hero" style={{ alignItems: 'stretch' }}>
            <div className="subtitle">TradePulse News - Country: <span style={{ color: 'var(--base-light)' }}>{COUNTRY_LIST.find(c => c.code===country)?.name || country}</span></div>
            <h1 className="title">Latest Headlines</h1>

            {loading && <div className="description">Loading news...</div>}
            {error && (
              <div className="description" style={{ color: '#ff6565', fontWeight: 500 }}>
                Error: {error}
              </div>
            )}
            {!loading && !error && (
              <React.Fragment>
                {news && news.length > 0 ? (
                  <>
                    <div className="description" style={{ marginBottom: '16px' }}>
                      Showing {news.length} of {totalResults} articles.
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {news.map((article, idx) => (
                        <li key={article.link || idx} style={{
                          border: '1px solid var(--border-color)',
                          borderRadius: 4,
                          padding: 18,
                          marginBottom: 16,
                          background: 'rgba(255,255,255,0.03)'
                        }}>
                          <div style={{ fontWeight: 600, fontSize: '1.13rem', marginBottom: 6 }}>
                            {article.title}
                          </div>
                          {article.pubDate && (
                            <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                              {new Date(article.pubDate).toLocaleString()}
                            </span>
                          )}
                          <div style={{ margin: '8px 0' }}>
                            {article.description?.length > 300
                              ? article.description.slice(0, 300).trim() + '...'
                              : article.description || <em>No summary</em>}
                          </div>
                          {article.link && (
                            <a href={article.link} target="_blank" rel="noopener noreferrer"
                               style={{ color: 'var(--base-light)', textDecoration: 'underline' }}>
                              Read Full Article
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <div className="description" style={{ color: 'var(--text-secondary)' }}>No news articles found.</div>
                )}
              </React.Fragment>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;