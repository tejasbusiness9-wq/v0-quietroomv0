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
  '/images/room-lamp.mp4',
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
  '/images/thunder-rain.mp3',
  'mp3',
  'weather'
);
