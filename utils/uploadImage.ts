/**
 * Supabase Storage upload/delete utilities.
 * All images are compressed before upload.
 */

import { supabase } from '../services/supabase';
import { compressImage } from './compressImage';

const BUCKET = 'images';

/**
 * Uploads an image to Supabase Storage with auto-compression.
 * @param file - The image file to upload
 * @param folder - Storage folder ('logos', 'menus', 'profiles')
 * @returns The public URL of the uploaded image
 */
export async function uploadImage(
  file: File,
  folder: 'logos' | 'menus' | 'profiles'
): Promise<string> {
  // Compress the image first
  const compressed = await compressImage(file, {
    maxWidth: folder === 'logos' ? 400 : 1200,
    maxHeight: folder === 'logos' ? 400 : 1200,
    quality: folder === 'logos' ? 0.8 : 0.7,
  });

  // Generate unique filename
  const timestamp = Date.now();
  const safeName = file.name
    .replace(/[^a-zA-Z0-9.]/g, '_')
    .replace(/\.[^.]+$/, '.jpg');
  const path = `${folder}/${timestamp}_${safeName}`;

  // Upload to Supabase Storage
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, compressed, {
      contentType: 'image/jpeg',
      upsert: false,
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  // Get the public URL
  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(path);

  return urlData.publicUrl;
}

/**
 * Deletes an image from Supabase Storage by its public URL.
 * @param url - The public URL of the image to delete
 */
export async function deleteImage(url: string): Promise<void> {
  try {
    // Extract the path from the public URL
    // URL format: https://<project>.supabase.co/storage/v1/object/public/images/<path>
    const match = url.match(/\/storage\/v1\/object\/public\/images\/(.+)$/);
    if (!match) return; // Not a Supabase Storage URL, skip

    const path = decodeURIComponent(match[1]);
    await supabase.storage.from(BUCKET).remove([path]);
  } catch (e) {
    console.warn('Failed to delete image:', e);
  }
}
