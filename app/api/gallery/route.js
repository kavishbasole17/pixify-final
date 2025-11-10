import { NextResponse } from "next/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { ScanCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const awsConfig = {
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
};

const ddbClient = new DynamoDBClient(awsConfig);
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);
const s3Client = new S3Client(awsConfig);

export async function GET() {
  try {
    const scanCommand = new ScanCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
    });
    const { Items } = await ddbDocClient.send(scanCommand);

    if (!Items || Items.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    const imageMap = new Map();
    for (const item of Items) {
      const imageUrl = item.imageUrl;
      const tag = item.tag;
      if (!imageUrl || typeof imageUrl !== "string" || !imageUrl.includes(".com/")) continue;
      if (!imageMap.has(imageUrl)) imageMap.set(imageUrl, []);
      if (tag) imageMap.get(imageUrl).push(tag);
    }

    const results = [];
    for (const [imageUrl, tags] of imageMap.entries()) {
      const key = imageUrl.split(".com/")[1];
      const command = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
      });
      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      results.push({ url: signedUrl, tags });
    }

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error("Error fetching gallery images:", error);
    return NextResponse.json({ error: "Error fetching images" }, { status: 500 });
  }
}
