-- Fix the Art Store video URL to match the actual filename
UPDATE rewards_items 
SET media_url = '/images/art_store.mp4' 
WHERE name = 'Art Store';
