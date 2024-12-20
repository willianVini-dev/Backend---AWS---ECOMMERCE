#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ProductsAppStack } from '../lib/productsApp-stack'
import { EcommerceApiStack } from '../lib/ecommerceApi-stack'
import { ProductsAppLayerStack } from '../lib/productsAppLayers-stack';
import { EventsDdbStack } from '../lib/eventsDdb-stack';

const app = new cdk.App();

const env: cdk.Environment = {
  account: '190119668163',
  region: 'us-east-1'
}

const tags = {
  cost: "Ecommerce",
  team: "Dev-time"
}


const productsAppLayersStack = new ProductsAppLayerStack(app, "ProductsAppLayers", {
  tags,
  env
})


const eventsDdbStack = new EventsDdbStack(app, 'EventsStack', {
  tags,
  env
})

const productsAppStack = new ProductsAppStack(app, "ProductsApp", {
  eventsDdb: eventsDdbStack.table,
  tags,
  env
})

// deixando explicito que um stack depende da outra
productsAppStack.addDependency(productsAppLayersStack)
productsAppStack.addDependency(eventsDdbStack)

const ecommerceApiStack = new EcommerceApiStack(app, "EcommerceApi", {
  productsFetchHandler: productsAppStack.productsFetchHandler,
  productsAdminhandler: productsAppStack.productsAdminhandler,
  tags,
  env
})

// deixando explicito que um stack depende da outra
ecommerceApiStack.addDependency(productsAppStack)