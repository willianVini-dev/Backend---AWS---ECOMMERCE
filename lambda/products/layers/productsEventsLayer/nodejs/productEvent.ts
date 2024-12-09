export enum ProdutEventType {
  CREATED = 'PRODUCT_CREATED',
  UPDATED = 'PRODUCT_UPDATED',
  DELETED = 'PRODUCT_DELETED',
}

export interface ProductEvent {
  requestId: string;
  eventType: ProdutEventType;
  productId: string;
  productPrice: number;
  email: string;
}