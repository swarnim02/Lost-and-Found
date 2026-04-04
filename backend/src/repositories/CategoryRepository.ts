import { BaseRepository } from './BaseRepository';
import { Category } from '../models/Category';
import { CategoryRow } from '../types/domain';

class CategoryRepository extends BaseRepository<CategoryRow, Category> {
  constructor() { super('categories'); }
  protected mapRow(row: CategoryRow | undefined): Category | null {
    return row ? new Category(row) : null;
  }
}

export default new CategoryRepository();
