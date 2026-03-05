import { useState, useEffect, useRef } from 'react';
import type { StatsRibbonProps } from '../types';
import './styles/StatsRibbon.css';

function parseValue(str: string) {
  const cleaned = str.replace(/,/g, '');
  if (cleaned.endsWith('k')) {
    return { num: parseFloat(cleaned), suffix: 'k', decimals: cleaned.includes('.') ? cleaned.split('.')[1].replace('k', '').length : 0 };
  }
  return { num: parseInt(cleaned, 10), suffix: '', decimals: 0 };
}

function formatValue(current: number, suffix: string, decimals: number) {
  if (suffix === 'k') {
    return current.toFixed(decimals) + 'k';
  }
  return Math.round(current).toLocaleString();
}

function easeOutExpo(t: number) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function AnimatedValue({ value }: { value: string }) {
  const [display, setDisplay] = useState('0');
  const ref = useRef<HTMLSpanElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true;
          const { num, suffix, decimals } = parseValue(value);
          const duration = 2000;
          const start = performance.now();

          function tick(now: number) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeOutExpo(progress);
            const current = eased * num;
            setDisplay(formatValue(current, suffix, decimals));
            if (progress < 1) {
              requestAnimationFrame(tick);
            }
          }

          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return <span ref={ref} className="stats-ribbon__value">{display}</span>;
}

function StatsRibbon({ stats = [] }: StatsRibbonProps) {
  return (
    <section className="stats-ribbon">
      <div className="stats-ribbon__inner">
        {stats.map((stat, i) => (
          <div className="stats-ribbon__card" key={i}>
            <span className="stats-ribbon__index">{i + 1}</span>
            <AnimatedValue value={stat.value} />
            <span className="stats-ribbon__label">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default StatsRibbon;
