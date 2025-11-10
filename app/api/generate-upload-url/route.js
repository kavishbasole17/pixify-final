import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function POST(request) {
  try {
    const { fileName, fileType } = await request.json();
    // Use .replace(/\s+/g, "_") to prevent spaces in file names, which can cause issues with S3 keys and URLs
    const sanitizedFileName = fileName.replace(/\s+/g, "_");
    const key = `uploads/${Date.now()}-${sanitizedFileName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      ContentType: fileType,
    });

    // Generate a pre-signed URL valid for one hour
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

    return NextResponse.json({ uploadUrl, key });
  } catch (error) {
    console.error("Error generating upload URL:", error);
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 });
  }
}

// Handler for CORS preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}