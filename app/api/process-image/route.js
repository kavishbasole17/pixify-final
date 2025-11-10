import { NextResponse } from "next/server";
import { RekognitionClient, DetectLabelsCommand } from "@aws-sdk/client-rekognition";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";

// Initialize AWS Clients
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

// Use the Document Client for easier item operations (PutCommand)
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

export async function POST(request) {
  try {
    const { key } = await request.json();
    if (!key) throw new Error("Missing S3 key in request body.");

    // 1. Call AWS Rekognition to detect labels
    const rekognitionParams = {
      Image: { 
        S3Object: { 
          Bucket: process.env.S3_BUCKET_NAME, 
          Name: key 
        } 
      },
      MaxLabels: 10,
      MinConfidence: 75,
    };

    const { Labels } = await rekognitionClient.send(new DetectLabelsCommand(rekognitionParams));
    
    // Extract tags and construct the final S3 public URL
    const tags = Labels.map((label) => label.Name);
    // Correctly construct the image URL including the region (important for access)
    const imageUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    // 2. Save each tag as a separate record in DynamoDB
    for (const tag of tags) {
      // DynamoDB table is designed for sparse index (GSI) on 'tag' for searching
      await ddbDocClient.send(
        new PutCommand({
          TableName: process.env.DYNAMODB_TABLE_NAME,
          Item: { 
            imageID: uuidv4(), // Unique primary key for the record
            imageUrl, 
            tag 
          },
        })
      );
    }

    // Return the detected tags to the frontend
    return NextResponse.json({ tags }, { status: 200 });
  } catch (error) {
    console.error("Error processing image:", error);
    // Return the error message to the client for better debugging
    return NextResponse.json({ error: error.message || "Unknown error during image processing" }, { status: 500 });
  }
}