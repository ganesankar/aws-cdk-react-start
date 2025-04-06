import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import { CfnOutput } from "aws-cdk-lib";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import { S3BucketOrigin } from "aws-cdk-lib/aws-cloudfront-origins";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class AwsCdkReactStartStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    // Create an S3 bucket
    const bucket = new s3.Bucket(this, "MyWebBucket", {
      bucketName: "aws-cdk-react-start-web",
      websiteIndexDocument: "index.html",
      publicReadAccess: true,
      blockPublicAccess: cdk.aws_s3.BlockPublicAccess.BLOCK_ACLS,
    });

    // Create a CloudFront Distribution
    const distribution = new cloudfront.Distribution(this, "MyDistribution", {
      defaultBehavior: {
        origin: S3BucketOrigin.withBucketDefaults(bucket),
      },
    });

    // Deploy site content to S3
    new s3deploy.BucketDeployment(this, "DeploySite", {
      sources: [s3deploy.Source.asset("./dist")],
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
