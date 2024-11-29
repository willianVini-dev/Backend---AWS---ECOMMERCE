import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { Product, ProductRepository } from "/opt/nodejs/productsLayer";
import { DynamoDB } from "aws-sdk";

// Definindo a tabela do DynamoDB via variável de ambiente (setada dentro da stack)
const productsDdb = process.env.PRODUCTS_DDB!;

// Instância do cliente DynamoDB DocumentClient para interações com o banco de dados
const ddbClient = new DynamoDB.DocumentClient();

// Criando a instância do repositório de produtos, passando o cliente DynamoDB e a tabela
const productRepository = new ProductRepository(ddbClient, productsDdb);

// Função Lambda Handler, que processa as requisições da API Gateway
export async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {

  // Obtendo o ID da execução da função Lambda para rastreamento
  const lambdaRequestId = context.awsRequestId;

  // Obtendo o ID da requisição feita pelo API Gateway para rastreamento
  const apiRequestId = event.requestContext.requestId;

  // Verificando o recurso (endpoint) solicitado pela API Gateway
  if (event.resource === '/products') {

    // Parse do corpo da requisição para o tipo Product, contendo as informações do novo produto
    const product = JSON.parse(event.body!) as Product;

    // Chamada para criar o produto no repositório (DynamoDB)
    const productCreated = await productRepository.create(product);

    // Retornando o código 201 de "Created" com o produto recém-criado
    return {
      statusCode: 201,
      body: JSON.stringify(productCreated)
    };

  } else if (event.resource === '/products/{id}') {

    // Capturando o 'id' do produto a partir dos parâmetros de caminho da URL
    const productId = event.pathParameters!.id as string;

    // Verificando o método HTTP para determinar a ação (PUT ou DELETE)
    if (event.httpMethod === 'PUT') {
      console.log("PUT /products ", productId);  // Logando a requisição PUT no CloudWatch

      try {
        // Parse do corpo da requisição para o tipo Product, com as informações do produto a ser atualizado
        const product = JSON.parse(event.body!) as Product;

        // Chamada para atualizar o produto no repositório
        const productUpdate = await productRepository.updateProduct(productId, product);

        // Retornando o código 200 de "OK" com o produto atualizado
        return {
          statusCode: 200,
          body: JSON.stringify(productUpdate)
        };
      } catch (ConditionalCheckFailedException) {
        return {
          statusCode: 404,
          body: 'Product not found'
        }
      }

    } else if (event.httpMethod === 'DELETE') {
      console.log("DELETE /products ", productId);  // Logando a requisição DELETE no CloudWatch

      try {
        // Tentando excluir o produto no repositório
        const product = await productRepository.deleteProduct(productId);

        // Retornando o código 200 de "OK" com a confirmação da exclusão do produto
        return {
          statusCode: 200,
          body: JSON.stringify(product)
        };
      } catch (error) {
        // Caso haja erro (produto não encontrado ou outro motivo), retornamos um erro 404
        return {
          statusCode: 404,
          body: (error as Error).message
        };
      }

    }
  }

  // Caso nenhum dos endpoints correspondentes seja encontrado, retornamos um erro 400 de "Bad Request"
  return {
    statusCode: 400,
    body: 'Bad request'
  };
}