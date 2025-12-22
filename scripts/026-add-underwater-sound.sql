-- Add underwater ambient sound to system_sounds
INSERT INTO system_sounds (
  name,
  description,
  icon_name,
  audio_url,
  file_type,
  category
) VALUES (
  'Underwater',
  'Calming underwater ambience with gentle bubbles',
  'waves',
  '/images/underwater.webm',
  'webm',
  'nature'
);
