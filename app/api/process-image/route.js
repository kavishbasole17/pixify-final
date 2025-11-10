import { NextResponse } from "next/server";
import { RekognitionClient, DetectLabelsCommand } from "@aws-sdk/client-rekognition";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";

const rekognitionClient = new RekognitionClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const ddbClient = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
const docClient = DynamoDBDocumentClient.from(ddbClient);

export async function POST(req) {
  try {
    const { key } = await req.json();
    if (!key) throw new Error("Missing key");

    const params = {
      Image: { S3Object: { Bucket: process.env.S3_BUCKET_NAME, Name: key } },
      MaxLabels: 10,
      MinConfidence: 75,
    };

    const { Labels } = await rekognitionClient.send(new DetectLabelsCommand(params));
    const tags = Labels.map((label) => label.Name);
    const imageUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    for (const tag of tags) {
      await docClient.send(
        new PutCommand({
          TableName: process.env.DYNAMODB_TABLE_NAME,
          Item: { imageID: uuidv4(), imageUrl, tag },
        })
      );
    }

    return NextResponse.json({ tags });
  } catch (err) {
    console.error("Error processing image:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
