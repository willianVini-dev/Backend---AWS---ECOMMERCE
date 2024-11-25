import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";


export async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {

  const lambdaRequestId = context.awsRequestId        // guarda o id da execução da função lambda 
  const apiRequestId = event.requestContext.requestId // guarda o id da requisição feito pelo api gateway

  console.log(`Api gateway -> ${apiRequestId}  | Lambda -> ${lambdaRequestId}`)
  // todos os consoles de lambdas vão aparecer no CloudWatch

  if (event.resource === '/products') {
    console.log("POST /products")
    return {
      statusCode: 201,
      body: "POST"
    }
  } else if (event.resource === '/products/{id}') {
    const productId = event.pathParameters!.id as string
    if (event.httpMethod === 'PUT') {
      console.log("PUT /products ", productId)
      return {
        statusCode: 200,
        body: `PUT ${productId}`
      }
    } else if (event.httpMethod === 'DELETE') {
      console.log("DELETE /products ", productId)
      return {
        statusCode: 200,
        body: `DELETE ${productId}`
      }
    }
  }

  return {
    statusCode: 400,
    body: 'Bad request'
  }
}