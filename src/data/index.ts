import type { CashbackModel, Category, Product } from '../lib/types';
import categoriesJson from './categories.json';
import defaultModelJson from './defaultModel.json';
import productsJson from './products.json';

export const products = productsJson as Product[];
export const categories = categoriesJson as Category[];
export const defaultModel = defaultModelJson as CashbackModel;

export const productById = new Map(products.map((p) => [p.id, p]));
