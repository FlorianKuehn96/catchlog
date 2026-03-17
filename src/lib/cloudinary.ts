import { v2 as cloudinary } from 'cloudinary';

interface CloudinaryResult {
  secure_url: string;
  public_id: string;
}

// Validate config
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.warn('Cloudinary environment variables not fully configured. Image uploads will fail.');
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

export async function uploadImage(file: File, maxRetries = 2): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Invalid file type: ${file.type}. Allowed: ${allowedTypes.join(', ')}`);
  }
  
  // Validate file size (10MB)
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('File too large. Maximum size is 10MB');
  }
  
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await new Promise<CloudinaryResult>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'catchlog',
            transformation: [
              { width: 1200, crop: 'limit' },
              { quality: 'auto:good' },
            ],
            resource_type: 'image',
          },
          (error, result) => {
            if (error) {
              reject(new Error(`Cloudinary upload failed: ${error.message}`));
            } else if (!result) {
              reject(new Error('Cloudinary returned no result'));
            } else {
              resolve(result as CloudinaryResult);
            }
          }
        );
        
        uploadStream.on('error', (err) => {
          reject(new Error(`Upload stream error: ${err.message}`));
        });
        
        uploadStream.end(buffer);
      });
      
      return result.secure_url;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`Upload attempt ${attempt + 1} failed:`, lastError.message);
      
      if (attempt < maxRetries) {
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }
  
  throw new Error(`Upload failed after ${maxRetries + 1} attempts: ${lastError?.message}`);
}

export async function deleteImage(publicId: string, maxRetries = 2): Promise<void> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      await new Promise<void>((resolve, reject) => {
        cloudinary.uploader.destroy(publicId, (error, result) => {
          if (error) {
            reject(new Error(`Cloudinary delete failed: ${error.message}`));
          } else if (result?.result !== 'ok' && result?.result !== 'not found') {
            reject(new Error(`Cloudinary delete returned: ${result?.result}`));
          } else {
            resolve();
          }
        });
      });
      return;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`Delete attempt ${attempt + 1} failed:`, lastError.message);
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }
  
  // Don't throw on delete failures - just log
  console.error(`Failed to delete image after ${maxRetries + 1} attempts:`, lastError);
}

export function getPublicIdFromUrl(url: string): string | null {
  try {
    // Extract public_id from Cloudinary URL
    // Format: https://res.cloudinary.com/{cloud}/image/upload/v{version}/{folder}/{public_id}.{ext}
    const match = url.match(/\/v\d+\/(.+?)\.[^.]+$/);
    if (match) {
      return match[1]; // includes folder path
    }
    
    // Fallback for other formats
    const fallbackMatch = url.match(/\/catchlog\/([^/]+)\./);
    return fallbackMatch ? `catchlog/${fallbackMatch[1]}` : null;
  } catch {
    return null;
  }
}

// Health check function
export async function checkCloudinaryHealth(): Promise<boolean> {
  try {
    const result = await cloudinary.api.ping();
    return result.status === 'ok';
  } catch {
    return false;
  }
}
