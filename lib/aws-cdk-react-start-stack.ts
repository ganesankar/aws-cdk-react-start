import * as cdk from "aws-cdk-lib";
import { BlockPublicAccess, Bucket } from 'aws-cdk-lib/aws-s3'
import { CfnOutput, RemovalPolicy } from 'aws-cdk-lib'
import { Distribution, ViewerProtocolPolicy } from 'aws-cdk-lib/aws-cloudfront'
import { S3BucketOrigin } from "aws-cdk-lib/aws-cloudfront-origins";
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment'
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class AwsCdkReactStartStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    // Create an S3 bucket
    const bucket = new Bucket(this, "MyWebBucket", {
      bucketName: "aws-cdk-react-start-web",
      websiteIndexDocument: "index.html",
      publicReadAccess: true,
      blockPublicAccess: BlockPublicAccess.BLOCK_ACLS,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // Create a CloudFront Distribution
    const distribution = new Distribution(this, 'MyDistribution', {
      defaultBehavior: {
        origin: S3BucketOrigin.withBucketDefaults(bucket),
          viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      defaultRootObject: 'index.html',
      errorResponses: [
          {
              httpStatus: 404,
              responseHttpStatus: 200,
              responsePagePath: '/index.html',
          },
      ],
  })

    // Deploy site content to S3
    new BucketDeployment(this, "DeploySite", {
      sources: [Source.asset("./dist")],
      destinationBucket: bucket,
      distribution,
      distributionPaths: ["/*"],
    });

    new CfnOutput(this, "CloudFrontURL", {
      value: distribution.domainName,
      description: "The distribution URL",
      exportName: "CloudfrontURL",
    });

    new CfnOutput(this, "BucketName", {
      value: bucket.bucketName,
      description: "The name of the S3 bucket",
      exportName: "BucketName",
    });
  }
}
