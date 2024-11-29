import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { ProductRepository } from "/opt/nodejs/productsLayer";
import { DynamoDB } from "aws-sdk"


export async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {

  const lambdaRequestId = context.awsRequestId // guarda o id da execução da função lambda 
  const apiRequestId = event.requestContext    // guarda o id da requisição feito pelo api gateway

  console.log(`Api gateway -> ${apiRequestId}  | Lambda -> ${lambdaRequestId}`)
  // todos os consoles de lambdas vão aparecer no CloudWatch


  const productsDdb = process.env.PRODUCTS_DDB! // variavel de ambiente preenchida dentro da stack
  const ddbClient = new DynamoDB.DocumentClient()
  const productRepository = new ProductRepository(ddbClient, productsDdb) // passando a instania do dynamodb cada vez que é invocada a lambda

  const method = event.httpMethod

  if (event.resource === '/products') {
    if (method === 'GET') {

      console.log('Get - all products')
      const products = await productRepository.getAllproducts()
      return {
        statusCode: 200,
        body: JSON.stringify(products)
      }
    }
  } else if (event.resource === '/products/{id}') {

    console.log(' GET /products/{id}')
    console.log('ID ->', event.pathParameters!.id as string)

    const productId = event.pathParameters!.id as string
    try {

      const product = await productRepository.getProductById(productId)
      return {
        statusCode: 200,
        body: JSON.stringify(product)
      }

    } catch (error) {

      console.error((<Error>error).message)
      return {
        statusCode: 404,
        body: (<Error>error).message
      }

    }
  }

  return {
    statusCode: 400,
    body: JSON.stringify({
      message: "GET products - FAIL"
    })
  }
}