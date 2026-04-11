import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { itemApi } from '../api/endpoints';
import type { Category } from '../types/models';

export function ReportItemPage({ kind }: { kind: 'lost' | 'found' }) {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    categoryId: '',
    location: '',
    dateLostOrFound: new Date().toISOString().slice(0, 10),
    imageUrl: '',
    rewardAmount: ''
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { itemApi.categories().then(setCategories).catch(() => {}); }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        categoryId: form.categoryId ? Number(form.categoryId) : null,
        location: form.location,
        dateLostOrFound: form.dateLostOrFound,
        imageUrl: form.imageUrl || null,
        rewardAmount: kind === 'lost' && form.rewardAmount ? Number(form.rewardAmount) : 0
      };
      const item = kind === 'lost' ? await itemApi.createLost(payload) : await itemApi.createFound(payload);
      navigate(`/items/${item.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <h1>{kind === 'lost' ? 'Report a Lost Item' : 'Post a Found Item'}</h1>
      <form className="card" onSubmit={onSubmit}>
        {error && <div className="alert error">{error}</div>}
        <label>Title</label>
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <div style={{ height: 12 }} />
        <label>Description</label>
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
        <div className="row" style={{ marginTop: 12 }}>
          <div>
            <label>Category</label>
            <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
              <option value="">—</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label>Location</label>
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
          </div>
          <div>
            <label>Date {kind === 'lost' ? 'lost' : 'found'}</label>
            <input type="date" value={form.dateLostOrFound} onChange={(e) => setForm({ ...form, dateLostOrFound: e.target.value })} required />
          </div>
        </div>
        <label>Image URL (optional)</label>
        <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://…" />
        {kind === 'lost' && (
          <>
            <div style={{ height: 12 }} />
            <label>Reward amount (optional, ₹)</label>
            <input type="number" min={0} value={form.rewardAmount} onChange={(e) => setForm({ ...form, rewardAmount: e.target.value })} />
          </>
        )}
        <div style={{ height: 16 }} />
        <button className="btn" disabled={busy}>{busy ? 'Saving…' : 'Submit'}</button>
      </form>
    </>
  );
}
