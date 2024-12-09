import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as dynamoDb from 'aws-cdk-lib/aws-dynamodb'

// Define a classe EventDdbStack, que representa uma pilha no AWS CDK
export class EventDdbStack extends cdk.Stack {
  // Declara uma propriedade somente leitura que armazenará a tabela do DynamoDB
  readonly table: dynamoDb.Table;

  // Define o construtor da classe, que configura a pilha e os recursos
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    // Chama o construtor da classe pai (cdk.Stack) para inicializar a pilha
    super(scope, id, props);

    // Cria uma tabela no DynamoDB com as configurações especificadas
    this.table = new dynamoDb.Table(this, "EventsDdb", {
      tableName: 'events', // Nome da tabela no DynamoDB
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Remove a tabela ao destruir a pilha
      partitionKey: { // Define a chave de partição da tabela
        name: 'pk', // Nome do atributo da chave de partição
        type: dynamoDb.AttributeType.STRING // Tipo do atributo (string)
      },
      sortKey: { // Define a chave de ordenação da tabela (opcional)
        name: 'sk', // Nome do atributo da chave de ordenação
        type: dynamoDb.AttributeType.STRING // Tipo do atributo (string)
      },
      timeToLiveAttribute: 'ttl', // Configura o atributo de tempo de vida (TTL) para expiração automática de itens
      billingMode: dynamoDb.BillingMode.PROVISIONED, // Define o modo de cobrança como provisionado
      readCapacity: 1, // Capacidade de leitura provisionada (1 unidade)
      writeCapacity: 1 // Capacidade de escrita provisionada (1 unidade)
    });
  }
}