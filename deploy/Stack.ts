import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as dotenv from 'dotenv';

dotenv.config();

export class Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const server = new nodejs.NodejsFunction(this, 'server', {
        functionName: 'nodejs-rsschool-cart-api',
        entry: 'dist/main.js',
        timeout: cdk.Duration.seconds(30),
        memorySize: 1024,
        runtime: lambda.Runtime.NODEJS_22_X,
        environment: {
            DB_HOST: process.env.DB_HOST as string,
            DB_PORT: process.env.DB_PORT as string,
            DB_USERNAME: process.env.DB_USER as string,
            DB_PASSWORD: process.env.DB_PASSWORD as string,
            DB_NAME: process.env.DB_NAME as string
        },
        bundling: {
            externalModules: [
                '@nestjs/microservices',
                '@nestjs/websockets',
                'class-transformer',
                'class-validator'
            ], 
        }
    })

    const {url} = server.addFunctionUrl({
        authType: lambda.FunctionUrlAuthType.NONE,
        cors: {
            allowedOrigins: ['*'],
            allowedMethods: [
                lambda.HttpMethod.GET,
                lambda.HttpMethod.DELETE,
                lambda.HttpMethod.PUT,
            ],
            allowedHeaders: ['*'],
        }
    });

    new cdk.CfnOutput(this, 'Url', {value: url});
  }
}
