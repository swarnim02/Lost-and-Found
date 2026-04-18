import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { itemApi } from '../api/endpoints';
import type { Item } from '../types/models';
import { ItemCard } from '../components/ItemCard';
import { Icon } from '../components/Icon';
import { useAuth } from '../context/AuthContext';

export function LandingPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    itemApi.search({ status: 'open' } as never)
      .then((list) => { setItems(list); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const featured = items.slice(0, 6);
  const lostCount = items.filter((i) => i.type === 'lost').length;
  const foundCount = items.filter((i) => i.type === 'found').length;
  const rewardCount = items.filter((i) => i.rewardAmount > 0).length;

  return (
    <>
      <section className="landing-hero">
        <span className="eyebrow">
          <span className="dot" />
          Live registry · Verified by community
        </span>
        <h1>
          Lost something? <em>Found</em> something?<br />
          Make the small reunion happen.
        </h1>
        <p className="lead">
          A campus-wide bulletin where lost belongings find their owners.
          Post in seconds, verify claims with personal details, and coordinate rewards transparently.
        </p>
        <div className="cta-row">
          {user ? (
            <>
              <Link to="/report-lost" className="btn large">
                <Icon name="plus" size={14} /> Report a lost item
              </Link>
              <Link to="/browse" className="btn outline large">Browse all listings</Link>
            </>
          ) : (
            <>
              <Link to="/register" className="btn large">Get started — it's free</Link>
              <Link to="/browse" className="btn outline large">Browse listings</Link>
            </>
          )}
        </div>
        <div className="signals">
          <span className="signal"><Icon name="shield" size={14} /> Owner-verified claims</span>
          <span className="signal"><Icon name="check" size={14} /> No spam, no ads</span>
          <span className="signal"><Icon name="user" size={14} /> Free for everyone on campus</span>
        </div>
      </section>

      <section className="section">
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <span className="section-eyebrow">How it works</span>
          <h2 className="section-title">Three steps, often less than five minutes.</h2>
        </div>
        <div className="steps">
          <div className="step">
            <div className="step-icon"><Icon name="plus" size={16} /></div>
            <div className="num">01</div>
            <h3>Post the listing</h3>
            <p>Snap a photo or describe what was lost or found. Add the location and date — it takes under a minute.</p>
          </div>
          <div className="step">
            <div className="step-icon"><Icon name="search" size={16} /></div>
            <div className="num">02</div>
            <h3>Match &amp; verify</h3>
            <p>People who recognize the item submit a claim with private identifying details only the real owner would know.</p>
          </div>
          <div className="step">
            <div className="step-icon"><Icon name="check" size={16} /></div>
            <div className="num">03</div>
            <h3>Hand it back</h3>
            <p>Accept the right claim, agree on a meet-up, and (optionally) settle a declared reward — all from one page.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="stats-band">
          <div>
            <div className="stat-num">{loading ? '—' : items.length}</div>
            <div className="stat-label">Active listings</div>
          </div>
          <div>
            <div className="stat-num">{loading ? '—' : lostCount}</div>
            <div className="stat-label">Lost items</div>
          </div>
          <div>
            <div className="stat-num">{loading ? '—' : foundCount}</div>
            <div className="stat-label">Found items</div>
          </div>
          <div>
            <div className="stat-num">{loading ? '—' : rewardCount}</div>
            <div className="stat-label">With rewards</div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="page-head">
          <div>
            <span className="section-eyebrow">Latest listings</span>
            <h2 className="section-title">Recently posted</h2>
            <p className="section-lead">A glimpse of what's currently open. Use search filters on the browse page to narrow by category, location, or keyword.</p>
          </div>
          <Link to="/browse" className="btn secondary">See all listings</Link>
        </div>

        {loading ? (
          <div className="grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="item-card">
                <div className="thumb skeleton" style={{ background: 'var(--bg-tint)' }} />
                <div className="body">
                  <div className="skeleton" style={{ height: 18, width: '70%', marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 12, width: '90%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : featured.length === 0 ? (
          <div className="empty">
            <div className="icon"><Icon name="basket" size={26} /></div>
            <h3>No listings yet</h3>
            <p>Be the first to post — the registry only works if people use it.</p>
          </div>
        ) : (
          <div className="grid">{featured.map((item) => <ItemCard key={item.id} item={item} />)}</div>
        )}
      </section>

      <section className="section">
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <span className="section-eyebrow">Built for trust</span>
          <h2 className="section-title">Why this works.</h2>
        </div>
        <div className="feature-row">
          <div className="feature">
            <h3>Claim verification</h3>
            <p>Claimers describe private identifying details — owners decide who actually knows the item.</p>
          </div>
          <div className="feature">
            <h3>Reward coordination</h3>
            <p>Declare an optional reward up front and mark it as paid once the item changes hands.</p>
          </div>
          <div className="feature">
            <h3>Admin oversight</h3>
            <p>Suspicious users can be suspended; abusive listings removed. Moderation keeps the registry clean.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="cta-banner">
          <div>
            <h2>Ready to post your first listing?</h2>
            <p>It takes a minute. Most claims arrive within hours.</p>
          </div>
          <div className="row-center">
            {user ? (
              <>
                <Link to="/report-lost" className="btn">Report a lost item</Link>
                <Link to="/report-found" className="btn outline">Post a found item</Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn">Create free account</Link>
                <Link to="/browse" className="btn outline">Browse first</Link>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
