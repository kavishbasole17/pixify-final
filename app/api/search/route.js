import { NextResponse } from "next/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { ScanCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const ddbClient = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.trim().toLowerCase();

  if (!query) {
    return NextResponse.json([], { status: 200 });
  }

  try {
    const scanCommand = new ScanCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
    });
    const { Items } = await ddbDocClient.send(scanCommand);

    // ✅ Safely filter, skip undefined tags
    const filtered = Items.filter(
      (item) => item?.tag && item.tag.toLowerCase().includes(query)
    );

    // ✅ Group by imageUrl and return
    const grouped = {};
    filtered.forEach((item) => {
      if (!grouped[item.imageUrl]) grouped[item.imageUrl] = [];
      grouped[item.imageUrl].push(item.tag);
    });

    const results = Object.entries(grouped).map(([url, tags]) => ({
      url,
      tags,
    }));

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Search failed", details: error.message },
      { status: 500 }
    );
  }
}
