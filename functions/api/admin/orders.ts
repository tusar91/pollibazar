import { onRequestGet as getOrders, onRequestOptions as getOptions } from '../orders/index';

export const onRequestOptions = getOptions;
export const onRequestGet = getOrders;
