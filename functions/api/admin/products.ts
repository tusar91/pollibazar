import { onRequestGet as getProducts, onRequestPost as createProduct } from '../products/index';

export const onRequestGet = getProducts;
export const onRequestPost = createProduct;
