-- Add room & lamp environment (cozy indoor scene)
INSERT INTO system_environments (
  name,
  description,
  background_url,
  file_type,
  category
) VALUES (
  'Cozy Room',
  'A warm, dimly lit room with a glowing lamp',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/room%20%26%20lamp-b2ipygTmauIEMS1bXLkPfyGZ8KwDms.mp4',
  'mp4',
  'indoor'
);

-- Add thunder and rain ambient sound
INSERT INTO system_sounds (
  name,
  description,
  icon_name,
  audio_url,
  file_type,
  category
) VALUES (
  'Thunder & Rain',
  'Relaxing thunderstorm with gentle rainfall',
  'cloud-rain',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/thunder%20and%20rain-yV7zixrxiHELm8OFLsYvzZMfqo7iUR.mp3',
  'mp3',
  'weather'
);
