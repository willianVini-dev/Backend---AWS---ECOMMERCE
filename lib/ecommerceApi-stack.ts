
import * as lambdaNodeJs from "aws-cdk-lib/aws-lambda-nodejs"
import * as cdk from "aws-cdk-lib"
import { Construct } from "constructs"
import * as apigateway from "aws-cdk-lib/aws-apigateway"
import * as cwlogs from "aws-cdk-lib/aws-logs"

interface EcommerceApiStackProps extends cdk.StackProps {
  productsFetchHandler: lambdaNodeJs.NodejsFunction,
  productsAdminhandler: lambdaNodeJs.NodejsFunction
}

export class EcommerceApiStack extends cdk.Stack {

  constructor(scope: Construct, id: string, props: EcommerceApiStackProps) {
    super(scope, id, props)

    const logGroup = new cwlogs.LogGroup(this, "EcommerceApiLogs") // criando os logs dentro do CloudWatch
    const api = new apigateway.RestApi(this, "EcommerceApi",
      {
        restApiName: "EcommerceApi",
        cloudWatchRole: true,
        deployOptions: {
          accessLogDestination: new apigateway.LogGroupLogDestination(logGroup),// onde deve gerar os logs
          accessLogFormat: apigateway.AccessLogFormat.jsonWithStandardFields({  // definindo o formato do log (json)
            httpMethod: true,
            ip: true,
            protocol: true,
            requestTime: true,
            resourcePath: true,
            responseLength: true,
            status: true,
            caller: true,
            user: true
          })
        }
      }
    )

    // realizando a integração com a função
    const productsFetchIntegration = new apigateway.LambdaIntegration(props.productsFetchHandler)
    //GET "/products"
    const productsResourse = api.root.addResource("products")
    productsResourse.addMethod('GET', productsFetchIntegration)

    //GET "/products/{id}"
    const productIdResource = productsResourse.addResource('{id}')
    productIdResource.addMethod('GET', productsFetchIntegration)

    const productsAdminIntegration = new apigateway.LambdaIntegration(props.productsAdminhandler)
    //POST "/products"
    productsResourse.addMethod("POST",productsAdminIntegration)
    //PUT "/products/{id}"
    productIdResource.addMethod("PUT",productsAdminIntegration)
    //DELETE "/products/{id}"
    productIdResource.addMethod("DELETE",productsAdminIntegration)

  }

}