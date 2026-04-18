import { FormEvent, useEffect, useState } from 'react';
import { itemApi } from '../api/endpoints';
import type { Category, Item } from '../types/models';
import { ItemCard } from '../components/ItemCard';
import { Icon } from '../components/Icon';

export function BrowsePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ keyword: '', type: '', status: 'open', categoryId: '', location: '' });

  useEffect(() => {
    itemApi.categories().then(setCategories).catch(() => {});
    runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runSearch(e?: FormEvent) {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const query: Record<string, string | number> = {};
      if (filters.keyword) query.keyword = filters.keyword;
      if (filters.type) query.type = filters.type;
      if (filters.status) query.status = filters.status;
      if (filters.categoryId) query.categoryId = filters.categoryId;
      if (filters.location) query.location = filters.location;
      const res = await itemApi.search(query as never);
      setItems(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setFilters({ keyword: '', type: '', status: 'open', categoryId: '', location: '' });
    setTimeout(() => runSearch(), 0);
  }

  const activeFilters = [filters.keyword, filters.type, filters.categoryId, filters.location].filter(Boolean).length;

  return (
    <>
      <div className="browse-head">
        <span className="section-eyebrow">Registry</span>
        <h1>Browse listings</h1>
        <div className="sub">
          Search lost and found items across campus. Use filters to narrow by type, category, or location.
        </div>
      </div>

      <form className="card" onSubmit={runSearch}>
        <div className="row">
          <div>
            <label>Keyword</label>
            <input value={filters.keyword} onChange={(e) => setFilters({ ...filters, keyword: e.target.value })} placeholder="title or description" />
          </div>
          <div>
            <label>Type</label>
            <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
              <option value="">Any</option>
              <option value="lost">Lost</option>
              <option value="found">Found</option>
            </select>
          </div>
          <div>
            <label>Status</label>
            <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
              <option value="">Any</option>
              <option value="open">Open</option>
              <option value="claimed">Claimed</option>
              <option value="returned">Returned</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div>
            <label>Category</label>
            <select value={filters.categoryId} onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}>
              <option value="">Any</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label>Location</label>
            <input value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })} placeholder="e.g. library" />
          </div>
        </div>
        <div className="row-center">
          <button className="btn" type="submit" disabled={loading}>
            {loading ? <><span className="spinner" /> Searching…</> : <><Icon name="search" size={14} /> Apply filters</>}
          </button>
          <button className="btn ghost" type="button" onClick={reset}>Reset</button>
          <span className="muted" style={{ marginLeft: 'auto' }}>
            {loading ? 'Searching…' : `${items.length} ${items.length === 1 ? 'result' : 'results'}`}
            {activeFilters > 0 && <> · {activeFilters} active filter{activeFilters === 1 ? '' : 's'}</>}
          </span>
        </div>
      </form>

      {error && <div className="alert error">{error}</div>}

      {loading ? (
        <div className="grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="item-card">
              <div className="thumb skeleton" style={{ background: 'var(--bg-tint)' }} />
              <div className="body">
                <div className="skeleton" style={{ height: 18, width: '70%', marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 12, marginBottom: 6 }} />
                <div className="skeleton" style={{ height: 12, width: '60%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="empty">
          <div className="icon"><Icon name="basket" size={26} /></div>
          <h3>No matching items</h3>
          <p>Try broadening your filters or checking back soon — new items are posted daily.</p>
        </div>
      ) : (
        <div className="grid">{items.map((item) => <ItemCard key={item.id} item={item} />)}</div>
      )}
    </>
  );
}
