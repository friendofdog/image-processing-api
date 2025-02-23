import multer from 'multer';


const ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg'
];

const storage = multer.memoryStorage();

const fileFilter = (_: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid filetype: ${file.mimetype}`));
  }
};

const upload = multer({
  storage,
  fileFilter
});

export default upload;
