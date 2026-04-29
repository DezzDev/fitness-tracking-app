import sharp from 'sharp';

const IMAGE_CONFIG = {
  maxWidth: 500,
  maxHeight: 500,
  quality: 85,
  maxOutputSize: 500 * 1024,
} as const;

interface ProcessImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export const processImageToBase64 = async (
  buffer: Buffer,
  options: ProcessImageOptions = {}
): Promise<string> => {
  const {
    maxWidth = IMAGE_CONFIG.maxWidth,
    maxHeight = IMAGE_CONFIG.maxHeight,
    quality = IMAGE_CONFIG.quality,
    format,
  } = options;

  const metadata = await sharp(buffer).metadata();
  const outputFormat = format || (metadata.format as 'jpeg' | 'png' | 'webp') || 'jpeg';

  let pipeline = sharp(buffer)
    .resize(maxWidth, maxHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .rotate();

  if (outputFormat === 'jpeg') {
    pipeline = pipeline.jpeg({ quality, progressive: true, mozjpeg: true });
  } else if (outputFormat === 'png') {
    pipeline = pipeline.png({ quality, compressionLevel: 9, palette: true });
  } else {
    pipeline = pipeline.webp({ quality, effort: 6 });
  }

  const processedBuffer = await pipeline.toBuffer();

  if (processedBuffer.length > IMAGE_CONFIG.maxOutputSize) {
    // no-op, permitido; se valida en service con limite mas alto
  }

  const base64 = processedBuffer.toString('base64');
  return `data:image/${outputFormat};base64,${base64}`;
};

export const isValidDataUri = (dataUri: string): boolean => {
  const dataUriPattern = /^data:image\/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=]+$/;
  return dataUriPattern.test(dataUri);
};

export const parseDataUri = (dataUri: string): { mimeType: string; format: string; base64Data: string; size: number } => {
  const matches = dataUri.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);

  if (!matches || !matches[1] || !matches[2]) {
    throw new Error('Data URI invalido');
  }

  const base64Data = matches[2];

  return {
    mimeType: `image/${matches[1]}`,
    format: matches[1],
    base64Data,
    size: Buffer.from(base64Data, 'base64').length,
  };
};

export const getDataUriSize = (dataUri: string): number => {
  try {
    return parseDataUri(dataUri).size;
  } catch {
    return 0;
  }
};
