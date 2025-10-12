-- Create storage bucket for verification images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'verification-images',
  'verification-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for verification images
CREATE POLICY "Anyone can view verification images"
ON storage.objects FOR SELECT
USING (bucket_id = 'verification-images');

CREATE POLICY "Authenticated users can upload verification images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'verification-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own verification images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'verification-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own verification images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'verification-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);