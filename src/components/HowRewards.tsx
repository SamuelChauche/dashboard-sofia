import { rewards } from '../data';
import './styles/HowRewards.css';

function HowRewards() {
  return (
    <section className="rewards">
      <div className="rewards__inner">
        <div className="rewards__header">
          <h2 className="rewards__title">How Rewards Work</h2>
          <a href="#" className="rewards__cta">Install Sofia</a>
        </div>

        <div className="rewards__grid">
          {rewards.map((reward, i) => (
            <div className="rewards__card" key={i}>
              {reward.icon.endsWith('.png') ? (
                <img className="rewards__icon-img" src={reward.icon} alt={reward.title} />
              ) : (
                <span className="rewards__icon">{reward.icon}</span>
              )}
              <h3 className="rewards__card-title">{reward.title}</h3>
              <span className={`rewards__amount rewards__amount--${reward.theme}`}>
                {reward.reward}
              </span>
              <p className="rewards__desc">{reward.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowRewards;
