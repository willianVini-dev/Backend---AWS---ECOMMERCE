import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";


export async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {

  const lambdaRequestId = context.awsRequestId // guarda o id da execução da função lambda 
  const apiRequestId = event.requestContext    // guarda o id da requisição feito pelo api gateway

  console.log(`Api gateway -> ${apiRequestId}  | Lambda -> ${lambdaRequestId}`)
  // todos os consoles de lambdas vão aparecer no CloudWatch

  const method = event.httpMethod

  if (event.resource === '/products') {
    if (method === 'GET') {

      console.log('get')
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "GET products - OK"
        })
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