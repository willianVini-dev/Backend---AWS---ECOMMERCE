import * as lambda from "aws-cdk-lib/aws-lambda"
import * as lambdaNodeJs from "aws-cdk-lib/aws-lambda-nodejs"
import * as cdk from "aws-cdk-lib"
import { Construct } from "constructs"
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as ssm from "aws-cdk-lib/aws-ssm"

export class ProductsAppStack extends cdk.Stack {

  // create function lambda
  readonly productsFetchHandler: lambdaNodeJs.NodejsFunction
  readonly productsAdminhandler: lambdaNodeJs.NodejsFunction
  readonly productsDdb: dynamodb.Table

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // criação da tabela de produtos no dynamodb
    this.productsDdb = new dynamodb.Table(this, "ProductsDdb", {
      tableName: "products",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING
      },
      billingMode: dynamodb.BillingMode.PROVISIONED,
      readCapacity: 1,
      writeCapacity: 1
    })


    //products layer 
    //recuperando o valor do layer 
    const productsLayerArn = ssm.StringParameter.valueForStringParameter(this, "ProductslayerVersionArn")
    // mesmo recurso criado no productsApplayers, passando via parametro
    const productsLayer = lambda.LayerVersion.fromLayerVersionArn(this, "ProductsLayerVersionArn",productsLayerArn)


    this.productsFetchHandler = new lambdaNodeJs.NodejsFunction(this,
      "ProductsFetchFunction",
      {
        functionName: "ProductsFetchFunction",             // nome da function que vai aparecer na AWS
        entry: "lambda/products/productsFetchFunction.ts", // arquivo que essa function vai executar
        handler: "handler",                                // metodo que vai ser executado
        memorySize: 512,                                   // memoria maxima alocada para essa função 
        timeout: cdk.Duration.seconds(5),                  // tempo maximo de execução
        bundling: {
          minify: true,                                    // minificando o arquivo bruto para fazer o deploy
          sourceMap: false                                 // desabilita o debug
        },
        runtime: lambda.Runtime.NODEJS_20_X,               // a partir da versão 20 do node essa config é obrigatoria
        environment: {
          PRODUCTS_DDB: this.productsDdb.tableName
        },
        layers: [productsLayer]                            // instruindo a function que poderá ter um layer
      }
    )

    this.productsDdb.grantReadData(this.productsFetchHandler) // da permissão de leitura para a tabela

    this.productsAdminhandler = new lambdaNodeJs.NodejsFunction(this,
      "ProductsAdminFunction",
      {
        functionName: "ProductsAdminFunction",             // nome da function que vai aparecer na AWS
        entry: "lambda/products/productsAdminFunction.ts", // arquivo que essa function vai executar
        handler: "handler",                                // metodo que vai ser executado
        memorySize: 512,                                   // memoria maxima alocada para essa função 
        timeout: cdk.Duration.seconds(5),                  // tempo maximo de execução
        bundling: {
          minify: true,                                    // minificando o arquivo bruto para fazer o deploy
          sourceMap: false                                 // desabilita o debug
        },
        runtime: lambda.Runtime.NODEJS_20_X,               // a partir da versão 20 do node essa config é obrigatoria
        environment: {
          PRODUCTS_DDB: this.productsDdb.tableName
        },
        layers:[productsLayer]                             // instruindo a function que poderá ter um layer
      }
    )

    this.productsDdb.grantWriteData(this.productsAdminhandler) // da permissão de escrita para a tabela


  }
}