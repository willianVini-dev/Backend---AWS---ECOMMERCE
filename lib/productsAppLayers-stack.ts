import * as lambda from "aws-cdk-lib/aws-lambda"
import * as cdk from "aws-cdk-lib"
import { Construct } from "constructs"
import * as ssm from "aws-cdk-lib/aws-ssm"

export class ProductsAppLayerStack extends cdk.Stack {
  readonly productsLayers: lambda.LayerVersion

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    this.productsLayers = new lambda.LayerVersion(this, "ProductsLayer", {
      code: lambda.Code.fromAsset('lambda/products/layers/productsLayer'),  // onde a lambda vai estar
      compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],                     // versão do node
      layerVersionName: "ProductsLayer",                                    // nome do layer na AWS
      removalPolicy: cdk.RemovalPolicy.RETAIN                               // não excluir o layer se a stack for excluida 

    })
    new ssm.StringParameter(this, "ProductslayerVersionArn", {              // parametro para a definição do layer
      parameterName: "ProductsLayerVersionArn",
      stringValue: this.productsLayers.layerVersionArn
    })
  }
}