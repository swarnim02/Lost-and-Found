import { FormEvent, useEffect, useState } from 'react';
import { itemApi } from '../api/endpoints';
import type { Category, Item } from '../types/models';
import { ItemCard } from '../components/ItemCard';

export function HomePage() {
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
      if (filters.categoryId) query.categoryId = Number(filters.categoryId);
      if (filters.location) query.location = filters.location;
      const res = await itemApi.search(query as never);
      setItems(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1>Browse Items</h1>
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
        <button className="btn" type="submit">Search</button>
      </form>

      {error && <div className="alert error">{error}</div>}
      {loading ? <p>Loading…</p> : (
        items.length === 0 ? <p className="muted">No items match your filters.</p>
        : <div className="grid">{items.map((item) => <ItemCard key={item.id} item={item} />)}</div>
      )}
    </>
  );
}
