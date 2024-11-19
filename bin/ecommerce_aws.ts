#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ProductsAppStack } from '../lib/productsApp-stack'
import { EcommerceApiStack } from '../lib/ecommerceApi-stack'

const app = new cdk.App();

const env: cdk.Environment = {
  account: '190119668163',
  region: 'us-east-1'
}

const tags = {
  cost: "Ecommerce",
  team: "Dev-time"
}

const productsAppStack = new ProductsAppStack(app, "ProductsApp", {
  tags,
  env
})

const ecommerceApiStack = new EcommerceApiStack(app, "EcommerceApi", {
  productsFetchHandler: productsAppStack.productsFetchHandler,
  tags,
  env
})

// deixando explicito que um stack depende da outra
ecommerceApiStack.addDependency(productsAppStack)