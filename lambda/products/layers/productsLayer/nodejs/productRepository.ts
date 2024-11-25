import { DocumentClient } from "aws-sdk/clients/dynamodb"
import { v4 as uuid } from "uuid"

export interface Product {
  id: string;
  productName: string;
  code: string;
  price: string;
  model: string;
}

export class ProductRepository{
  private ddbClient: DocumentClient
  private productDdb:string

  constructor(ddbClient:DocumentClient, productDdb: string){
    this.ddbClient = ddbClient
    this.productDdb = productDdb
  }
}