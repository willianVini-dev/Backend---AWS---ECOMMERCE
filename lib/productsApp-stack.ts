import * as lambda from "aws-cdk-lib/aws-lambda"
import * as lambdaNodeJs from "aws-cdk-lib/aws-lambda-nodejs"
import * as cdk from "aws-cdk-lib"
import { Construct } from "constructs"

export class ProductsAppStack extends cdk.Stack {

  // create function lambda
  readonly productsFetchHandler: lambdaNodeJs.NodejsFunction

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    this.productsFetchHandler = new lambdaNodeJs.NodejsFunction(this, 
      "ProductsFetchFunction",
      {
        functionName: "ProductsFetchFunction",             // nome da function que vai aparecer na AWS
        entry: "lambda/products/productsFetchFunction.ts", // arquivo que essa function vai executar
        handler: "handler",                                // metodo que vai ser executado
        memorySize: 512,                                   // memoria maxima alocada para essa função 
        timeout: cdk.Duration.seconds(5),                  // tempo maximo de execução
        bundling:{
          minify: true,                                    // minificando o arquivo bruto para fazer o deploy
          sourceMap: false                                 // desabilita o debug
        },
        runtime: lambda.Runtime.NODEJS_20_X                // a partir da versão 20 do node essa config é obrigatoria
      }
    )

  }
}