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
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

export async function POST(request) {
  try {
    const { key } = await request.json();

    const params = {
      Image: {
        S3Object: {
          Bucket: process.env.S3_BUCKET_NAME,
          Name: key,
        },
      },
      MaxLabels: 10,
      MinConfidence: 75,
    };

    const { Labels } = await rekognitionClient.send(new DetectLabelsCommand(params));

    const imageUrl = `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${key}`;
    const tags = Labels.map((label) => label.Name);

    for (const tag of tags) {
      const putCmd = new PutCommand({
        TableName: process.env.DYNAMODB_TABLE_NAME,
        Item: {
          imageID: uuidv4(), // ✅ add a unique primary key
          imageUrl,
          tag,
        },
      });
      await ddbDocClient.send(putCmd);
    }

    return NextResponse.json({ tags });
  } catch (error) {
    console.error("Error processing image:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
