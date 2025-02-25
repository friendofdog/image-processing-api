import sharp from 'sharp';
import { processImage } from './imageProcessing'; // Update with the correct path
import { IMAGE_SIZE } from '../constants/image';


jest.mock('sharp', () => jest.fn(() => ({
  resize: jest.fn().mockReturnThis(),
  toBuffer: jest.fn().mockResolvedValue(Buffer.from('mocked_image'))
})));

describe('processImage', () => {
  const mockFileContent = Buffer.from('test_image');
  
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should process image with the requested resolution', async () => {
    const result = await processImage(mockFileContent, IMAGE_SIZE.ORIGINAL);

    expect(sharp).toHaveBeenCalledWith(mockFileContent);
    expect(result).toEqual(Buffer.from('mocked_image'));
  });
});
