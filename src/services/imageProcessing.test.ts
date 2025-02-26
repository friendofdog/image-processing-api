import sharp from 'sharp';
import { processImage } from './imageProcessing';
import { IMAGE_SIZE } from '../constants/image';


const { ORIGINAL, THUMBMNAIL } = IMAGE_SIZE;
const mockedImage = 'mocked_image';

const mockResize = jest.fn();
const mockToBuffer = jest.fn();

jest.mock('sharp', () => jest.fn(() => ({
  resize: mockResize.mockReturnThis(),
  toBuffer: mockToBuffer.mockResolvedValue(Buffer.from(mockedImage))
})));

describe('processImage', () => {
  const mockFileContent = Buffer.from('test_image');
  
  afterEach(() => {
    jest.clearAllMocks();
  });

  it(`when called to resize an image to ${THUMBMNAIL}
      resizes the image to 100x100
      and returns the image`, async () => {
    const result = await processImage(mockFileContent, THUMBMNAIL);

    expect(sharp).toHaveBeenCalledWith(mockFileContent);
    expect(mockResize).toHaveBeenCalledWith(100, 100, { fit: 'inside' });
    expect(mockToBuffer).toHaveBeenCalled();

    expect(result).toEqual(Buffer.from(mockedImage));
  });

  it(`when called to resize an image to ${ORIGINAL}
      does not resize image (resizes to nullxnull)
      and returns the image`, async () => {
    const result = await processImage(mockFileContent, ORIGINAL);

    expect(sharp).toHaveBeenCalledWith(mockFileContent);
    expect(mockResize).toHaveBeenCalledWith(null, null, { fit: 'inside' });
    expect(mockToBuffer).toHaveBeenCalled();

    expect(result).toEqual(Buffer.from(mockedImage));
  });
});
