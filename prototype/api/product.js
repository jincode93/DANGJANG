import { product } from '../lib/shop.js';
export const config = { maxDuration: 20 };
export function GET(request) { return product(request); }
