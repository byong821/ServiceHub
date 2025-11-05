import { useState } from 'react';
import ServiceList from './ServiceList';
import ServiceForm from './ServiceForm';
import './Home.css';

export default function Home() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');

  return (
    <main className="home">
      <section className="home__filters" aria-label="Filters">
        <input
          placeholder="Search…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search services"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Category"
        >
          <option value="">All</option>
          <option value="tech">Tech</option>
          <option value="tutoring">Tutoring</option>
          <option value="moving">Moving</option>
          <option value="photo">Photography</option>
        </select>
        <input
          type="number"
          placeholder="Min $"
          value={min}
          onChange={(e) => setMin(e.target.value)}
          aria-label="Min rate"
        />
        <input
          type="number"
          placeholder="Max $"
          value={max}
          onChange={(e) => setMax(e.target.value)}
          aria-label="Max rate"
        />
      </section>

      <section className="home__grid">
        <div className="home__left">
          <h2>Explore</h2>
          <ServiceList query={query} category={category} min={min} max={max} />
        </div>
        <div className="home__right">
          <h2>Create</h2>
          <ServiceForm
            onCreated={() => {
              /* you can refresh list by lifting state if desired */
            }}
          />
        </div>
      </section>
    </main>
  );
}
