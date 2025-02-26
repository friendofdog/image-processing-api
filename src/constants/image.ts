export const IMAGE_SIZE = Object.freeze({
  ORIGINAL: 'original',
  THUMBMNAIL: 'thumbnail'
});

export const ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg'
];

export const IMAGE_MAX_SIZE_KB = parseInt(
  process.env.IMAGE_MAX_SIZE || '5120', 10
); // 5 MB, unless set by env var
