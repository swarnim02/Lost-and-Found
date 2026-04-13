import { BaseRepository } from './BaseRepository';
import { CategoryModel, CategoryDoc } from '../config/schema';
import { Category } from '../models/Category';
import { CategoryRow } from '../types/domain';

class CategoryRepository extends BaseRepository<CategoryDoc, CategoryRow, Category> {
  constructor() { super(CategoryModel); }
  protected mapRow(row: CategoryRow | null | undefined): Category | null {
    return row ? new Category(row) : null;
  }
}

export default new CategoryRepository();
