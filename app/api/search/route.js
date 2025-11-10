// app/api/search/route.js (Resolved Conflict)
import { NextResponse } from "next/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Centralized AWS configuration
const awsConfig = {
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
};

// Initialize DynamoDB and S3 Clients
const ddbClient = new DynamoDBClient(awsConfig);
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);
const s3Client = new S3Client(awsConfig);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    // Frontend uses the parameter 'query'
    const searchQuery = searchParams.get("query")?.trim().toLowerCase(); 
    
    if (!searchQuery) {
      // If the query is empty, return an empty set.
      return NextResponse.json([], { status: 200 });
    }

    // 1. Scan DynamoDB to retrieve all image metadata
    const scanCommand = new ScanCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
    });
    const { Items } = await ddbDocClient.send(scanCommand);

    if (!Items || Items.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // 2. Aggregate all tags by image URL and normalize tags for searching
    const aggregatedImages = new Map();
    const originalTagsMap = new Map();

    for (const item of Items) {
      if (!item.imageUrl || !item.tag) continue;
      
      const normalizedTags = aggregatedImages.get(item.imageUrl) || [];
      const originalTags = originalTagsMap.get(item.imageUrl) || [];

      // Add tag for searching (normalized)
      if (!normalizedTags.includes(item.tag.toLowerCase())) {
        normalizedTags.push(item.tag.toLowerCase());
      }
      // Add tag for display (original casing)
      if (!originalTags.includes(item.tag)) {
        originalTags.push(item.tag);
      }
      
      aggregatedImages.set(item.imageUrl, normalizedTags);
      originalTagsMap.set(item.imageUrl, originalTags);
    }

    // 3. Filter images that match the search query
    const matchingImages = [];
    for (const [imageUrl, tags] of aggregatedImages.entries()) {
      // Check if ANY normalized tag includes the search query
      if (tags.some((t) => t.includes(searchQuery))) {
        matchingImages.push({ 
          imageUrl, 
          tags: originalTagsMap.get(imageUrl) 
        });
      }
    }
    
    // 4. Generate signed URLs and format the results
    const finalResults = [];
    for (const { imageUrl, tags } of matchingImages) {
      // Extract the S3 Key from the full image URL
      const key = imageUrl.split(".amazonaws.com/")[1]; 

      const command = new GetObjectCommand({ 
        Bucket: process.env.S3_BUCKET_NAME, 
        Key: key 
      });

      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      
      finalResults.push({ 
        id: key, 
        url: signedUrl, 
        tags: tags,
        // Mock name and description for frontend display
        name: key.split('/').pop().split('.').slice(0, -1).join('.') || 'Untitled Image',
        description: tags.join(', ') || 'AI-generated tags', 
      });
    }

    return NextResponse.json(finalResults, { status: 200 });

  } catch (error) {
    // Crucial for debugging: log the full error stack to the server terminal
    console.error("Search error:", error);
    // Return a generic error to the client
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}