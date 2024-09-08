import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as Blob;
  const name = formData.get('name') as string;
  const symbol = formData.get('symbol') as string;
  const description = formData.get('description') as string;

  if (!file || !name || !symbol || !description) {
    return NextResponse.json(
      { message: 'Missing required fields' },
      { status: 400 }
    );
  }

  try {
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'tokens', resource_type: 'image' },  
        (error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        }
      );

      const reader = file.stream().getReader();
      const pump = () =>
        reader.read().then(({ done, value }) => {
          if (done) {
            uploadStream.end();
          } else {
            uploadStream.write(value);
            pump();
          }
        });

      pump();
    }) as { secure_url: string };

    const metadataJson = {
      name,
      symbol,
      image: uploadResult.secure_url,  
      description,
    };

    const metadataUploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder: 'tokens',
          resource_type: 'raw', 
          public_id: `metadata_${Date.now()}.json`  
        },
        (error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        }
      );

      uploadStream.end(JSON.stringify(metadataJson));
    }) as { secure_url: string };;

    return NextResponse.json({
      message: 'Metadata uploaded successfully',
      metadataUrl: metadataUploadResult.secure_url,
    });
  } catch (error) {
    return NextResponse.json(
      { message: 'Error uploading file' },
      { status: 500 }
    );
  }
}
