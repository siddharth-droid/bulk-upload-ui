import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname: string) => {
        // Generate a client token for the browser to upload the file
        // Allow various file types for AI processing
        return {
          allowedContentTypes: [
            'application/pdf',
            'text/plain',
            'text/csv',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'audio/mpeg',
            'audio/wav',
            'video/mp4',
            'video/avi',
            'video/mov'
          ],
          maximumSizeInBytes: 50 * 1024 * 1024, // 50MB limit
          allowOverwrite: true, // Allow overwriting existing files
        };
      },
      onUploadCompleted: async ({ blob }) => {
        // Log successful upload
        console.log('File uploaded to Vercel Blob:', blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('Blob upload error:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}