import * as lambda from "aws-cdk-lib/aws-lambda"
import * as cdk from "aws-cdk-lib"
import { Construct } from "constructs"
import * as ssm from "aws-cdk-lib/aws-ssm"

export class ProductsAppLayerStack extends cdk.Stack {

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const productsLayers = new lambda.LayerVersion(this, "ProductsLayer", {
      code: lambda.Code.fromAsset('lambda/products/layers/productsLayer'),  // onde a lambda vai estar
      compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],                     // versão do node
      layerVersionName: "ProductsLayer",                                    // nome do layer na AWS
      removalPolicy: cdk.RemovalPolicy.RETAIN                               // não excluir o layer se a stack for excluida 

    })
    new ssm.StringParameter(this, "ProductsLayerVersionArn", {              // parametro para a definição do layer
      parameterName: "ProductsLayerVersionArn",
      stringValue: productsLayers.layerVersionArn
    })

    const productsEventsLayers = new lambda.LayerVersion(this, "ProductsEventsLayer", {
      code: lambda.Code.fromAsset('lambda/products/layers/productsEventsLayer'),  // onde a lambda vai estar
      compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],                           // versão do node
      layerVersionName: "ProductsEventsLayer",                                    // nome do layer na AWS
      removalPolicy: cdk.RemovalPolicy.RETAIN                                     // não excluir o layer se a stack for excluida 

    })
    new ssm.StringParameter(this, "ProductsEventsLayerVersionArn", {              // parametro para a definição do layer
      parameterName: "ProductsEventsLayerVersionArn",
      stringValue: productsEventsLayers.layerVersionArn
    })
  }
}