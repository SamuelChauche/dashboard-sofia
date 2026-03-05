import { useState, useEffect } from 'react';
import { SEASON_END } from '../config';
import './styles/Hero.css';

function Hero() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  function getTimeLeft() {
    const now = new Date();
    const diff = SEASON_END.getTime() - now.getTime();

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0 };
    }

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <section className="hero">
      <div className="hero__bg" />
      <div className="hero__content">
        <p className="hero__label">Season 1 ends in</p>
        <div className="hero__countdown">
          <span className="hero__countdown-value">{timeLeft.days}d</span>
          <span className="hero__countdown-sep" />
          <span className="hero__countdown-value">{pad(timeLeft.hours)}h</span>
          <span className="hero__countdown-sep" />
          <span className="hero__countdown-value">{pad(timeLeft.minutes)}m</span>
        </div>
        <p className="hero__subtitle">The top spots are being claimed right now.</p>
        <a href="#" className="hero__cta">Install Sofia</a>
      </div>
    </section>
  );
}

export default Hero;
