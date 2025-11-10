import { NextResponse } from "next/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const ddbClient = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function GET() {
  try {
    const { Items } = await ddbDocClient.send(new ScanCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
    }));

    const imageMap = new Map();
    Items.forEach((item) => {
      if (!imageMap.has(item.imageUrl)) imageMap.set(item.imageUrl, []);
      imageMap.get(item.imageUrl).push(item.tag);
    });

    const results = [];
    for (const [imageUrl, tags] of imageMap.entries()) {
      const key = imageUrl.split(".amazonaws.com/")[1];
      const command = new GetObjectCommand({ Bucket: process.env.S3_BUCKET_NAME, Key: key });
      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      results.push({ url: signedUrl, tags });
    }

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error("Error fetching gallery:", error);
    return NextResponse.json({ error: "Error fetching gallery" }, { status: 500 });
  }
}
