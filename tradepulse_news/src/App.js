import React, { useState, useEffect } from 'react';
import './App.css';
import { fetchNewsByCountry } from './newsApi';

// Supported countries, expand as needed (code: ISO 2-letter, name: display name)
const COUNTRY_LIST = [
  { code: 'us', name: 'United States' },
  { code: 'in', name: 'India' },
  { code: 'gb', name: 'United Kingdom' },
  { code: 'jp', name: 'Japan' },
  { code: 'de', name: 'Germany' },
  { code: 'au', name: 'Australia' },
  { code: 'fr', name: 'France' },
];

// Lists a basic subset for demo simplicity
function App() {
  const [country, setCountry] = useState('us');
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalResults, setTotalResults] = useState(0);

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

  // PUBLIC_INTERFACE
  /**
   * Handles changing the selected country.
   * @param {Event} event 
   */
  function handleCountryChange(event) {
    setCountry(event.target.value);
  }

  return (
    <div className="app">
      <nav className="navbar">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <div className="logo">
              <span className="logo-symbol">*</span> KAVIA AI
            </div>
            <div>
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
            </div>
          </div>
        </div>
      </nav>

      <main>
        <div className="container">
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