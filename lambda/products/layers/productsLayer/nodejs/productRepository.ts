import { DocumentClient } from "aws-sdk/clients/dynamodb"
import { v4 as uuid } from "uuid"

export interface Product {
  id: string;
  productName: string;
  code: string;
  price: string;
  model: string;
}

export class ProductRepository {
  private ddbClient: DocumentClient
  private productDdb: string

  constructor(ddbClient: DocumentClient, productDdb: string) {
    this.ddbClient = ddbClient
    this.productDdb = productDdb
  }

  // metodo scan é muito custoso $, evita-lo
  // realizando a busca em todos os produtos da tabela
  async getAllproducts(): Promise<Product[]> {
    const data = await this.ddbClient.scan({
      TableName: this.productDdb // deixando dinamico o nome da tabela
    }).promise()

    return data.Items as Product[]
  }

  // realizando a busca pelo id do produto
  async getProductById(productID: string): Promise<Product> {
    const data = await this.ddbClient.get({
      TableName: this.productDdb,
      Key: {
        id: productID
      }
    }).promise()
    if (data.Item) return data.Item as Product
    else throw new Error('Product not found')
  }

  // criando um produto
  async create(product: Product): Promise<Product> {
    product.id = uuid()
    await this.ddbClient.put({
      TableName: this.productDdb,
      Item: product
    }).promise()

    return product
  }

  // deletando um produto
  async deleteProduct(productId: Product): Promise<Product> {
    const data = await this.ddbClient.delete({
      TableName: this.productDdb,
      Key: {
        id: productId
      },
      ReturnValues: 'ALL_OLD' // retorna o registro que existia na tabela
    }).promise()
    if (data.Attributes) return data.Attributes as Product
    else throw new Error("Product not found")
  }

  async updateProduct(productId: string, product: Product): Promise<Product> {
    const data = await this.ddbClient.update({
      TableName: this.productDdb,
      Key: {
        id: productId
      },
      ConditionExpression: 'attribute_exists(id)', // só era executar a operação de update se o registro existir 
      ReturnValues: 'UPDATED_NEW', // retorna o que foi alterado
      UpdateExpression: "set productName = :name, code = :code, price = :price , model = :model",
      ExpressionAttributeValues: {
        ":name": product.productName,
        ":code": product.code,
        ":price": product.price,
        ":model": product.model
      }
    }).promise()
    data.Attributes!.id = productId
    return data.Attributes as Product
  }
} 