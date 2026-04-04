import type { Database as DatabaseType } from 'better-sqlite3';
import db from '../config/database';

/**
 * BaseRepository — abstract parent for all table-specific repositories.
 *
 * Responsibility: generic CRUD so concrete repositories only write
 * table-specific queries. Subclasses override `mapRow` to return domain
 * objects instead of raw rows.
 */
export abstract class BaseRepository<TRow extends { id: number }, TModel> {
  protected readonly db: DatabaseType;
  protected readonly table: string;

  constructor(table: string) {
    this.table = table;
    this.db = db.getConnection();
  }

  protected abstract mapRow(row: TRow | undefined): TModel | null;

  findById(id: number): TModel | null {
    const row = this.db.prepare(`SELECT * FROM ${this.table} WHERE id = ?`).get(id) as TRow | undefined;
    return this.mapRow(row);
  }

  findAll(orderBy = 'id DESC'): TModel[] {
    const rows = this.db.prepare(`SELECT * FROM ${this.table} ORDER BY ${orderBy}`).all() as TRow[];
    return rows.map((r) => this.mapRow(r)).filter((m): m is TModel => m !== null);
  }

  deleteById(id: number): boolean {
    return this.db.prepare(`DELETE FROM ${this.table} WHERE id = ?`).run(id).changes > 0;
  }

  count(whereClause = '', params: (string | number)[] = []): number {
    const sql = `SELECT COUNT(*) AS c FROM ${this.table}${whereClause ? ' WHERE ' + whereClause : ''}`;
    const row = this.db.prepare(sql).get(...params) as { c: number };
    return row.c;
  }
}
