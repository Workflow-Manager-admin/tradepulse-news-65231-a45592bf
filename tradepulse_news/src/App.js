import React, { useState, useEffect } from 'react';
import './App.css';
import { fetchNewsByCountry } from './newsApi';
import { fetchUsdToCurrencyRate } from './forexApi';

// Supported countries (expand as needed)
const COUNTRY_LIST = [
  { code: 'us', name: 'United States', currency: 'USD' },
  { code: 'in', name: 'India', currency: 'INR' },
  { code: 'gb', name: 'United Kingdom', currency: 'GBP' },
  { code: 'jp', name: 'Japan', currency: 'JPY' },
  { code: 'de', name: 'Germany', currency: 'EUR' },
  { code: 'au', name: 'Australia', currency: 'AUD' },
  { code: 'fr', name: 'France', currency: 'EUR' },
];
// Supported currencies for selection
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

const NEWS_CATEGORIES = [
  { key: '', label: 'All' },
  { key: 'economy', label: 'Economy' },
  { key: 'business', label: 'Business' },
  { key: 'crypto', label: 'Crypto' },
  { key: 'technology', label: 'Technology' },
  { key: 'markets', label: 'Markets' },
];

function App() {
  // State management
  const [country, setCountry] = useState('us');
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalResults, setTotalResults] = useState(0);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [exchangeRate, setExchangeRate] = useState(null);
  const [forexLoading, setForexLoading] = useState(false);
  const [forexError, setForexError] = useState('');
  const [category, setCategory] = useState('');
  const [categoryTouched, setCategoryTouched] = useState(false);

  // UX: indicate during async actions, if filter in progress
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Switch currency with country unless manual change
  useEffect(() => {
    if (!categoryTouched) {
      const found = COUNTRY_LIST.find(c => c.code === country);
      if (found) setSelectedCurrency(found.currency);
    }
    // eslint-disable-next-line
  }, [country]);

  // Fetch news on country or category change
  useEffect(() => {
    let ignore = false;
    async function getNews() {
      setLoading(true);
      setError('');
      setNews([]);
      setTotalResults(0);
      const response = await fetchNewsByCountry(country, category);
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
  }, [country, category]);

  // Fetch forex conversion on currency selection
  useEffect(() => {
    let ignore = false;
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
  /** Handles changing the selected country. */
  function handleCountryChange(event) {
    setCountry(event.target.value);
    setCategory(''); // reset category on country change
    setError('');
    setLoading(false);
  }

  // PUBLIC_INTERFACE
  /** Handles changing the selected currency. */
  function handleCurrencyChange(e) {
    setSelectedCurrency(e.target.value);
    setCategoryTouched(true);
  }

  // PUBLIC_INTERFACE
  /** Handles changing news category filter. */
  function handleCategoryChange(e) {
    setCategory(e.target.value);
    setFiltersOpen(false);
  }

  // UI/UX: helpers for feedback
  function Loader({ text }) {
    return (
      <div className="loader">
        <span className="spinner" /> {text}
      </div>
    );
  }
  function ErrorMessage({ error }) {
    return (
      <div className="error-message">
        <span role="img" aria-label="error" style={{marginRight:4}}>⚠️</span>{error}
      </div>
    );
  }

  return (
    <div className="app light-theme">
      <nav className="navbar" aria-label="Header Navigation">
        <div className="container nav-inner">
          <div className="logo">
            <span className="logo-symbol">*</span>
            <span className="logo-text">TradePulse</span>
            <span className="logo-dot">.</span>
            <span className="logo-sub brand-accent">News</span>
          </div>
          <div className="selectors-area">
            <label htmlFor="country-select" className="selector-label">Country</label>
            <select
              id="country-select"
              value={country}
              className="selector"
              onChange={handleCountryChange}
              data-testid="country-select"
              aria-label="Select Country"
            >
              {COUNTRY_LIST.map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
            <label htmlFor="currency-select" className="selector-label">Currency</label>
            <select
              id="currency-select"
              value={selectedCurrency}
              className="selector"
              onChange={handleCurrencyChange}
              data-testid="currency-select"
              aria-label="Select Currency"
            >
              {SUPPORTED_CURRENCIES.map((cu) => (
                <option key={cu.code} value={cu.code}>{cu.name}</option>
              ))}
            </select>
          </div>
        </div>
      </nav>
      <main>
        <div className="container main-sections">
          {/* Filters */}
          <section className="filters-section">
            <button
              className="btn-filter"
              aria-label="Toggle News Filters"
              onClick={() => setFiltersOpen((v) => !v)}
              aria-expanded={filtersOpen}
              data-testid="filter-toggle"
            >
              <span className="icon-filter" /> {filtersOpen ? "Hide Filters" : "Show Filters"}
            </button>
            {filtersOpen || (window.innerWidth > 700) ? (
              <div className="filters-list" data-testid="filter-list">
                <span className="filter-label">Category:</span>
                <select
                  className="selector filter-selector"
                  value={category}
                  onChange={handleCategoryChange}
                  data-testid="category-select"
                  aria-label="Select News Category"
                >
                  {NEWS_CATEGORIES.map(cat =>
                    <option key={cat.key} value={cat.key}>{cat.label}</option>
                  )}
                </select>
              </div>
            ) : null}
          </section>
          {/* Forex Section */}
          <section className="forex-section" aria-label="Forex Exchange Rate">
            <div className="forex-header">
              <span className="forex-title">USD to {selectedCurrency}</span>
            </div>
            <div className="forex-details">
              {forexLoading ? (
                <Loader text="Loading exchange rate..." />
              ) : forexError ? (
                <ErrorMessage error={forexError} />
              ) : (
                <div className="forex-rate-value">
                  1 USD = {exchangeRate ? exchangeRate.toLocaleString(undefined, { maximumFractionDigits: 4 }) : "--"} {selectedCurrency}
                </div>
              )}
              <div className="forex-provider">
                Powered by{' '}
                <a href="https://www.exchangerate-api.com/" target="_blank" rel="noopener noreferrer" className="brand-accent-link">
                  ExchangeRate-API
                </a>
              </div>
            </div>
          </section>
          {/* News Section */}
          <section className="news-section">
            <header className="news-header">
              <span className="subtitle">
                Latest Headlines, {COUNTRY_LIST.find(c => c.code === country)?.name}
                {category ? " - " + NEWS_CATEGORIES.find(cat => cat.key === category)?.label : ""}
              </span>
              <h1 className="title">TradePulse News</h1>
            </header>
            <div className="news-content">
              {loading ? (
                <Loader text="Loading news..." />
              ) : error ? (
                <ErrorMessage error={error} />
              ) : (
                <>
                <div className="news-summary">
                  Showing <b>{news.length}</b> of <b>{totalResults}</b> articles.
                </div>
                {news.length === 0 && (
                  <div className="description" style={{ color: 'var(--text-secondary)' }}>No news articles found.</div>
                )}
                <ul className="articles-list">
                  {news.map((article, idx) => (
                    <li className="news-article" key={article.link || idx}>
                      <div className="article-title">{article.title}</div>
                      {article.pubDate && (
                        <span className="article-date">
                          {new Date(article.pubDate).toLocaleString()}
                        </span>
                      )}
                      <div className="article-description">
                        {article.description?.length > 300
                          ? article.description.slice(0, 300).trim() + '...'
                          : article.description || <em>No summary</em>}
                      </div>
                      {article.link && (
                        <a href={article.link} target="_blank" rel="noopener noreferrer"
                          className="article-link">
                          Read Full Article
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
                </>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;