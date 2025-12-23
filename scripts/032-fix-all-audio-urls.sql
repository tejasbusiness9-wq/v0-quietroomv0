-- Updated all audio URLs to use direct Vercel blob storage URLs instead of local paths
UPDATE system_sounds SET audio_url = '/images/birds.webm' WHERE name = 'Birds';

UPDATE system_sounds SET audio_url = '/images/underwater.webm' WHERE name = 'Underwater';

UPDATE system_sounds SET audio_url = '/images/thunder-20and-20rain.mp3' WHERE name = 'Thunder & Rain';

UPDATE system_sounds SET audio_url = '/images/fire-20sound.mp3' WHERE name = 'Fire';
