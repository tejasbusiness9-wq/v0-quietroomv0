-- Fix all media URLs to use direct blob storage URLs instead of local paths
-- This ensures media works in both preview and deployed environments

-- Update system environments to use blob URLs
UPDATE system_environments 
SET background_url = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/room%20%26%20lamp-b2ipygTmauIEMS1bXLkPfyGZ8KwDms.mp4'
WHERE name = 'Cozy Room';

-- Update rewards items to use blob URLs
UPDATE rewards_items 
SET media_url = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ramen%20shopp-Mc4vAmWy6dsTjiDkpn1pyMcXCBX9iB.mp4'
WHERE name = 'Ramen Shop';

UPDATE rewards_items 
SET media_url = '/images/art-store.mp4'
WHERE name = 'Art Store';

UPDATE rewards_items 
SET media_url = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fire%20sound-EFz9HdERrwtJKynZLk9nTcFYOWW3sC.mp3'
WHERE name = 'Fire Sound';
