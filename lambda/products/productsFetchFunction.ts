import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { ProductRepository } from "/opt/nodejs/productsLayer";
import { DynamoDB } from "aws-sdk";

// Variável de ambiente que contém o nome da tabela do DynamoDB
// Esta variável é definida na configuração da stack (como CloudFormation ou Serverless Framework)
const productsDdb = process.env.PRODUCTS_DDB!;

// Criando uma instância do DynamoDB DocumentClient para interagir com o DynamoDB
const ddbClient = new DynamoDB.DocumentClient();

// Criando a instância do repositório de produtos, passando o cliente DynamoDB e o nome da tabela
const productRepository = new ProductRepository(ddbClient, productsDdb);

// Função Lambda handler que processa as requisições da API Gateway e retorna as respostas adequadas
export async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {

  // Obtendo o ID único da execução da função Lambda para fins de rastreamento e monitoramento
  const lambdaRequestId = context.awsRequestId;

  // Obtendo o ID da requisição feita pelo API Gateway (útil para rastreamento de requisições)
  const apiRequestId = event.requestContext;

  // Logando os IDs da requisição do API Gateway e da execução da Lambda para rastrear no CloudWatch
  console.log(`Api gateway -> ${apiRequestId}  | Lambda -> ${lambdaRequestId}`);

  // Obtendo o método HTTP da requisição (GET, POST, etc.)
  const method = event.httpMethod;

  // Verificando o recurso (endpoint) da API solicitado
  if (event.resource === '/products') {

    // Caso o método HTTP seja GET, buscamos todos os produtos do repositório
    if (method === 'GET') {
      console.log('GET - all products'); // Logando a ação no CloudWatch

      // Chamando o repositório para obter todos os produtos
      const products = await productRepository.getAllproducts();

      // Retornando os produtos com código de sucesso 200
      return {
        statusCode: 200,
        body: JSON.stringify(products) // Convertendo o resultado para formato JSON
      };
    }
  } else if (event.resource === '/products/{id}') {

    // Caso o recurso seja '/products/{id}', estamos lidando com uma requisição GET para um produto específico
    console.log('GET /products/{id}'); // Logando a ação no CloudWatch
    console.log('ID ->', event.pathParameters!.id as string); // Logando o ID do produto solicitado

    // Extraindo o ID do produto da URL
    const productId = event.pathParameters!.id as string;

    try {
      // Chamando o repositório para buscar o produto pelo ID
      const product = await productRepository.getProductById(productId);

      // Retornando o produto com código de sucesso 200
      return {
        statusCode: 200,
        body: JSON.stringify(product) // Convertendo o produto para formato JSON
      };

    } catch (error) {

      // Caso o produto não seja encontrado ou ocorra um erro, logamos a mensagem de erro
      console.error((<Error>error).message);

      // Retornando código 404 (Not Found) com a mensagem de erro
      return {
        statusCode: 404,
        body: (<Error>error).message // Passando a mensagem de erro para a resposta
      };
    }
  }

  // Caso o recurso não corresponda aos endpoints definidos, retornamos erro 400 (Bad Request)
  return {
    statusCode: 400,
    body: JSON.stringify({
      message: "GET products - FAIL" // Mensagem de erro genérica indicando que a requisição falhou
    })
  };
}