import { BadRequestException } from '@nestjs/common';
import { fileTypeFromBuffer } from 'file-type';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function validateImageFile(
  file: Express.Multer.File,
): Promise<void> {
  if (!file) {
    throw new BadRequestException('No file provided');
  }

  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    throw new BadRequestException(`Unsupported image type: ${file.mimetype}`);
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new BadRequestException(
      'The file is too large. Max size supported: 10MB',
    );
  }

  // magic number validation
  const detected = await fileTypeFromBuffer(file.buffer);

  if (!detected || !ALLOWED_MIME_TYPES.includes(detected.mime)) {
    throw new BadRequestException(
      `The file content does not match expected image type`,
    );
  }
}
