// app/api/gallery/route.js
import { NextResponse } from "next/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { ScanCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { S3Client, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// ✅ AWS Configuration
const awsConfig = {
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
};

const s3Client = new S3Client(awsConfig);
const ddbClient = new DynamoDBClient(awsConfig);
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

export async function GET() {
  try {
    // 1️⃣ List all images from S3 (so all uploads show, even untagged ones)
    const listCommand = new ListObjectsV2Command({
      Bucket: process.env.S3_BUCKET_NAME,
      Prefix: "uploads/",
    });
    const listResponse = await s3Client.send(listCommand);
    const s3Objects = listResponse.Contents || [];

    // 2️⃣ Fetch all tags from DynamoDB
    const scanCommand = new ScanCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
    });
    const { Items = [] } = await ddbDocClient.send(scanCommand);

    // 3️⃣ Group tags by image URL
    const tagMap = new Map();
    Items.forEach((item) => {
      if (!tagMap.has(item.imageUrl)) {
        tagMap.set(item.imageUrl, []);
      }
      tagMap.get(item.imageUrl).push(item.tag);
    });

    // 4️⃣ Build response with signed URLs
    const results = [];
    for (const obj of s3Objects) {
      if (obj.Key.endsWith("/")) continue; // Skip folder placeholder

      const getObjectCommand = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: obj.Key,
      });

      // Generate temporary access URL
      const signedUrl = await getSignedUrl(s3Client, getObjectCommand, {
        expiresIn: 3600, // 1 hour
      });

      const rawUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${obj.Key}`;
      const tags = tagMap.get(rawUrl) || [];

      results.push({
        url: signedUrl,
        tags,
        key: obj.Key,
        lastModified: obj.LastModified,
      });
    }

    // 5️⃣ Sort images by upload date (newest first)
    results.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching gallery images:", error);
    return NextResponse.json(
      { error: "Error fetching gallery images", details: error.message },
      { status: 500 }
    );
  }
}
