import sharp from 'sharp';
import { IMAGE_SIZE } from '@constants/image';
import { ImageSize } from '@interfaces/image';


const { ORIGINAL, THUMBMNAIL } = IMAGE_SIZE;

const RESOLUTIONS = {
  [ORIGINAL]: [null, null],
  [THUMBMNAIL]: [100, 100]
}

export const processImage = async (
  fileContent: Buffer,
  size: ImageSize
) => {
  const [width, height] = RESOLUTIONS[size];

  const resizedImage = await sharp(fileContent)
    .resize(width, height, {
      fit: 'inside'
    })
    .toBuffer();

  return resizedImage;
};
