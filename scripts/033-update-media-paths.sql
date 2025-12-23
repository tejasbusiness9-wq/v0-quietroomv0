-- Update all media paths to use new organized folder structure

-- Update environment backgrounds
UPDATE system_environments 
SET background_url = '/environments/mountain.gif' 
WHERE name = 'Mountain';

UPDATE system_environments 
SET background_url = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/room%20%26%20lamp-b2ipygTmauIEMS1bXLkPfyGZ8KwDms.mp4' 
WHERE name = 'Cozy Room';

UPDATE system_environments 
SET background_url = '/environments/coffee-shop.jpg' 
WHERE name = 'Coffee Shop';

-- Update sound paths
UPDATE system_sounds 
SET audio_url = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/birds-EVISQ2MjtEZAGDaJOktf6ewRiAqmY2.webm' 
WHERE name = 'Birds';

UPDATE system_sounds 
SET audio_url = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/underwater-oU9HvPWFQlyfjaf1co6dKav4EJ2kEw.webm' 
WHERE name = 'Underwater';

UPDATE system_sounds 
SET audio_url = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/thunder%20and%20rain-yV7zixrxiHELm8OFLsYvzZMfqo7iUR.mp3' 
WHERE name = 'Thunder & Rain';

UPDATE system_sounds 
SET audio_url = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fire%20sound-EFz9HdERrwtJKynZLk9nTcFYOWW3sC.mp3' 
WHERE name = 'Fire';

-- Update reward item media paths
UPDATE rewards_items 
SET media_url = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ramen%20shopp-Mc4vAmWy6dsTjiDkpn1pyMcXCBX9iB.mp4' 
WHERE name = 'Ramen Shop';

UPDATE rewards_items 
SET media_url = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/art_store-yPyVp4b8XN0NAYULvT7D2Mw3pdmypW.mp4' 
WHERE name = 'Art Store';

UPDATE rewards_items 
SET media_url = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fire%20sound-EFz9HdERrwtJKynZLk9nTcFYOWW3sC.mp3' 
WHERE name = 'Fire Sound';

-- Verify the updates
SELECT 'Environments' as category, name, background_url as path FROM system_environments
UNION ALL
SELECT 'Sounds' as category, name, audio_url as path FROM system_sounds
UNION ALL
SELECT 'Rewards' as category, name, media_url as path FROM rewards_items WHERE media_type IN ('video', 'audio')
ORDER BY category, name;
