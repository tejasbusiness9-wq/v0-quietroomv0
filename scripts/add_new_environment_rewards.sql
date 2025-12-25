-- Add new environment rewards to the rewards_items table with specified prices

-- Remove fire sounds from rewards_items
DELETE FROM rewards_items WHERE name LIKE '%fire%' OR name LIKE '%Fire%' OR description LIKE '%fire%' OR description LIKE '%Fire%';

-- Add new environment rewards with the specified costs
INSERT INTO rewards_items (id, name, description, category, type, price, media_url, media_type, icon_name, created_at)
VALUES
  (
    gen_random_uuid(),
    'Frieren Meditation',
    'Enter a peaceful anime-inspired environment perfect for deep focus',
    'system',
    'environment',
    300,
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/frieren-300-d7QdrTZiSrg8neDrOEqf8rA1fYymAA.mp4',
    'video',
    'Video',
    now()
  ),
  (
    gen_random_uuid(),
    'Girl Winter Reading',
    'Cozy winter study environment with warm lighting and peaceful atmosphere',
    'system',
    'environment',
    250,
    '/images/girl-winter-250.jpg',
    'image',
    'Video',
    now()
  ),
  (
    gen_random_uuid(),
    'Cat Balcony Sunset',
    'Serene balcony view at sunset with a peaceful cat companion',
    'system',
    'environment',
    150,
    '/images/cat-balcony-150.jpg',
    'image',
    'Video',
    now()
  ),
  (
    gen_random_uuid(),
    'Autumn Tea Time',
    'Warm autumn setting with tea, pumpkins, and maple leaves by the window',
    'system',
    'environment',
    100,
    '/images/tea-time-100.jpg',
    'image',
    'Video',
    now()
  ),
  (
    gen_random_uuid(),
    'Rainy City Night',
    'Atmospheric rainy night cityscape with calming ambiance',
    'system',
    'environment',
    50,
    '/images/blue-night-50.jpg',
    'image',
    'Video',
    now()
  ),
  (
    gen_random_uuid(),
    'Starry Mountain Lake',
    'Tranquil night scene with mountains reflected under starry skies',
    'system',
    'environment',
    50,
    '/images/night-mountain-50.jpg',
    'image',
    'Video',
    now()
  ),
  (
    gen_random_uuid(),
    'Goku Sunset Meditation',
    'Meditate like Goku at sunset - channel your inner warrior',
    'system',
    'environment',
    300,
    '/images/goku-300.gif',
    'image',
    'Video',
    now()
  )
ON CONFLICT (id) DO NOTHING;
