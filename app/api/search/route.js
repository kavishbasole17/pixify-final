import { NextResponse } from "next/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const ddb = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
const docClient = DynamoDBDocumentClient.from(ddb);

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query")?.trim().toLowerCase();
    if (!query) return NextResponse.json([]);

    const { Items } = await docClient.send(new ScanCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
    }));

    const imageMap = new Map();
    for (const item of Items || []) {
      if (!item.imageUrl || !item.tag) continue;
      const tags = imageMap.get(item.imageUrl) || [];
      tags.push(item.tag.toLowerCase());
      imageMap.set(item.imageUrl, tags);
    }

    const filtered = [];
    for (const [url, tags] of imageMap.entries()) {
      if (tags.some((t) => t.includes(query))) filtered.push({ url, tags });
    }

    return NextResponse.json(filtered);
  } catch (err) {
    console.error("Search error:", err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
