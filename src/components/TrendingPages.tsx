import { useState } from 'react';
import { trending } from '../data';
import './styles/TrendingPages.css';

const FILTER_OPTIONS = ['Sort Rate', 'Explorers'];

function TrendingPages() {
  const [filter, setFilter] = useState('Sort Rate');

  return (
    <section className="trending">
      <div className="trending__inner">
        <div className="trending__header">
          <h2 className="trending__title">Trending Pages</h2>
          <div className="trending__filters">
            {FILTER_OPTIONS.map((option) => (
              <button
                key={option}
                className={`trending__filter${filter === option ? ' trending__filter--active' : ''}`}
                onClick={() => setFilter(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="trending__grid">
          {trending.map((item, i) => (
            <div className="trending__card" key={i} data-intent={item.intent.toLowerCase()}>
              <div className="trending__card-top">
                <span className="trending__card-title">{item.title}</span>
                <span className="trending__card-badge">{item.badge}</span>
              </div>
              <div className="trending__card-bottom">
                <span className={`trending__intent trending__intent--${item.intent.toLowerCase()}`}>
                  {item.intentLabel}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TrendingPages;
