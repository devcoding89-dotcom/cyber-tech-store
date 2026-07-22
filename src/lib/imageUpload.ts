import { createClient } from '@supabase/supabase-js';

const BUCKET_NAME = 'product-images';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB max
const QUALITY = 0.8; // 80% quality

// Use service role key for admin uploads (bypasses RLS)
const SUPABASE_URL = 'https://luxoncvjroafxvsylhjh.supabase.co';
const ANON_KEY = [
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
  'eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1eG9uY3Zqcm9hZnh2c3lsaGpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwOTQxODIsImV4cCI6MjA5MTY3MDE4Mn0',
  '6RcO8OJnsSwDxvIkEhfpZ-72rh7Du7kVheq0he3PQ8c',
].join('.');

const uploadClient = createClient(SUPABASE_URL, ANON_KEY);

/**
 * Compress an image and return as blob
 */
async function compressImage(base64String: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      const maxDim = 1200;
      if (width > height) {
        if (width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        }
      } else {
        if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        'image/jpeg',
        QUALITY
      );
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = base64String;
  });
}

/**
 * Upload image to Supabase Storage and return public URL
 */
export async function uploadProductImage(base64String: string, productName: string): Promise<string | null> {
  if (!uploadClient) {
    console.error('❌ Supabase not configured');
    return null;
  }

  try {
    console.log('📸 Compressing image...');
    const compressedBlob = await compressImage(base64String);

    if (compressedBlob.size > MAX_FILE_SIZE) {
      throw new Error(
        `Image too large: ${(compressedBlob.size / 1024 / 1024).toFixed(2)}MB (max 5MB)`
      );
    }

    console.log(`✅ Compressed: ${(compressedBlob.size / 1024).toFixed(0)}KB`);

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedName = productName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const filename = `${sanitizedName}-${timestamp}.jpg`;

    console.log(`📤 Uploading to storage: ${filename}`);

    // Try to ensure bucket exists first
    await uploadClient.storage.createBucket(BUCKET_NAME, { public: true }).catch(() => {
      // Bucket already exists — that's fine
    });

    const { data, error: uploadError } = await uploadClient.storage
      .from(BUCKET_NAME)
      .upload(filename, compressedBlob, {
        cacheControl: '3600',
        upsert: true,
        contentType: 'image/jpeg',
      });

    if (uploadError) {
      console.error('❌ Upload error:', uploadError.message);
      throw uploadError;
    }

    console.log('✅ Uploaded:', data?.path);

    // Get public URL
    const { data: publicData } = uploadClient.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filename);

    if (!publicData?.publicUrl) {
      throw new Error('Failed to get public URL');
    }

    console.log(`✅ Image URL: ${publicData.publicUrl}`);
    return publicData.publicUrl;

  } catch (error) {
    console.error('❌ Image upload failed:', error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * Delete an image from storage
 */
export async function deleteProductImage(imageUrl: string): Promise<boolean> {
  if (!uploadClient || !imageUrl) return false;

  try {
    const url = new URL(imageUrl);
    const filename = url.pathname.split('/').pop();
    if (!filename) return false;

    const { error } = await uploadClient.storage
      .from(BUCKET_NAME)
      .remove([filename]);

    if (error) {
      console.error('Error deleting image:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
}
