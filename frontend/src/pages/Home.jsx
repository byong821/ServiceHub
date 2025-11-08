import { useState, useEffect } from 'react';
import ServiceList from './ServiceList';
import ServiceForm from './ServiceForm';
import './Home.css';

export default function Home() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [category, setCategory] = useState('');
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');

  // Proper debounce with useEffect and full deps
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 250);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <main className="home">
      {/* Hero */}
      <section className="hero">
        <div className="container hero__inner">
          <div>
            <div className="kicker">Student Services Marketplace</div>
            <h1 className="h1" style={{ marginTop: 6, marginBottom: 4 }}>
              Find help fast. Earn faster.
            </h1>
            <p className="text-muted" style={{ maxWidth: 720 }}>
              Book tutoring, moving help, tech support, photography and more —
              from verified students on your campus.
            </p>
          </div>

          {/* Search / Filters */}
          <div className="searchBar" role="search">
            <input
              className="input"
              placeholder="Search services, e.g. “calculus tutoring”, “iPhone screen”"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search services"
            />
            <select
              className="select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Category"
            >
              <option value="">All categories</option>
              <option value="tech">Tech</option>
              <option value="tutoring">Tutoring</option>
              <option value="moving">Moving</option>
              <option value="photo">Photography</option>
            </select>
            <input
              className="input"
              type="number"
              min="0"
              inputMode="numeric"
              placeholder="Min $"
              value={min}
              onChange={(e) => setMin(e.target.value)}
              aria-label="Minimum hourly rate"
            />
            <input
              className="input"
              type="number"
              min="0"
              inputMode="numeric"
              placeholder="Max $"
              value={max}
              onChange={(e) => setMax(e.target.value)}
              aria-label="Maximum hourly rate"
            />
          </div>
        </div>
      </section>

      {/* Main grid */}
      <section className="section">
        <div className="container home__grid">
          <div className="home__left">
            <div className="home__sectionHeader">
              <h2 className="h2">Explore</h2>
              <span className="text-muted">
                Browse listings that match your filters.
              </span>
            </div>

            <ServiceList
              query={debouncedQuery}
              category={category}
              min={min}
              max={max}
            />
          </div>

          <aside className="home__right">
            <div className="home__sectionHeader">
              <h2 className="h2">Create a listing</h2>
              <span className="text-muted">
                Offer your skills and start earning.
              </span>
            </div>

            <div className="card" style={{ padding: 16 }}>
              <ServiceForm
                onCreated={() => {
                  // Optionally: refresh the list by lifting state up or toggling a key
                }}
              />
            </div>

            <a
              className="home__emergency button button--primary"
              href="/emergency"
            >
              ⚡ View last-minute requests
            </a>
          </aside>
        </div>
      </section>
    </main>
  );
}
