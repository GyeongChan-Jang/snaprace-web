import { S3Client } from "@aws-sdk/client-s3";

import { env } from "@/env";
import { dynamoClient } from "@/lib/dynamodb";

// AWS SDK v3 uses extensive generics, which eslint flags as unsafe despite strong typings.
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
export const s3: S3Client = new S3Client({
  region: env.AWS_REGION,
});

export const ddb = dynamoClient;

export const TIMING_TABLE = env.TIMING_TABLE;
export const BUCKET = env.BUCKET;
