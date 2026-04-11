import { Link } from 'react-router-dom';
import type { Item } from '../types/models';

export function ItemCard({ item }: { item: Item }) {
  return (
    <Link to={`/items/${item.id}`} className="card" style={{ display: 'block', color: 'inherit' }}>
      <div className="meta" style={{ marginBottom: 8 }}>
        <span className={`pill ${item.type}`}>{item.type}</span>
        <span className={`pill ${item.status}`}>{item.status}</span>
        {item.rewardAmount > 0 && <span className="pill pending">₹{item.rewardAmount}</span>}
      </div>
      <h2 style={{ margin: '4px 0' }}>{item.title}</h2>
      <p className="muted" style={{ margin: '4px 0', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
        {item.description}
      </p>
      <div className="meta" style={{ marginTop: 8 }}>
        <span>📍 {item.location}</span>
        <span>·</span>
        <span>{item.dateLostOrFound}</span>
      </div>
    </Link>
  );
}
