import { useTrending } from '../hooks/useTrending';
import type { IntentCategory } from '../types';
import './styles/TrendingPages.css';

const CATEGORY_LABELS: Record<IntentCategory, string> = {
  trusted: 'Trusted',
  distrusted: 'Distrusted',
  work: 'Work',
  learning: 'Learning',
  fun: 'Fun',
  inspiration: 'Inspiration',
};

function SkeletonCards() {
  return Array.from({ length: 6 }).map((_, i) => (
    <div className="trending__card trending__card--skeleton" key={i}>
      <div className="trending__skeleton trending__skeleton--favicon" />
      <div className="trending__skeleton trending__skeleton--text" />
      <div className="trending__skeleton trending__skeleton--text-sm" />
    </div>
  ));
}

function TrendingPages() {
  const { items, loading, error } = useTrending();

  return (
    <section className="trending">
      <div className="trending__inner">
        <div className="trending__header">
          <h2 className="trending__title">Trending Pages</h2>
        </div>

        {error && <p className="trending__error">{error}</p>}

        <div className="trending__grid">
          {loading && <SkeletonCards />}
          {!loading && items.map((item) => (
            <a
              key={item.category}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="trending__card"
              data-intent={item.category}
            >
              <div className="trending__card-top">
                <img
                  src={item.favicon}
                  alt=""
                  className="trending__favicon"
                  width={24}
                  height={24}
                />
                <span className={`trending__badge trending__badge--${item.category}`}>
                  {CATEGORY_LABELS[item.category]}
                </span>
              </div>
              <span className="trending__domain">{item.domain}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TrendingPages;
