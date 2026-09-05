const { imagekit, DEFAULT_FOLDER } = require('../config/imagekit');
const fs = require('fs');

/**
 * Upload a file buffer or base64 to ImageKit
 * @param {Buffer|string} file - Buffer, local file path, or base64 string
 * @param {string} fileName - Desired file name on ImageKit
 * @param {string} [folder=digitalverse] - Destination folder
 * @param {Array<string>} [tags=[]] - Optional tags for search/categorization
 */
async function uploadToImageKit(file, fileName, folder = DEFAULT_FOLDER, tags = ['digitalverse']) {
  try {
    let filePayload = file;
    // If a string path is passed, read the file or use stream
    if (typeof file === 'string' && fs.existsSync(file)) {
      filePayload = fs.readFileSync(file);
    }

    const response = await imagekit.upload({
      file: filePayload,
      fileName: fileName,
      folder: folder.startsWith('/') ? folder : `/${folder}`,
      useUniqueFileName: true,
      tags: tags
    });

    return {
      success: true,
      url: response.url,
      thumbnailUrl: response.thumbnailUrl,
      fileId: response.fileId,
      name: response.name,
      filePath: response.filePath,
      size: response.size,
      height: response.height,
      width: response.width
    };
  } catch (error) {
    console.error('ImageKit upload error:', error);
    return {
      success: false,
      error: error.message || 'ImageKit upload failed'
    };
  }
}

/**
 * Delete a file from ImageKit by fileId
 */
async function deleteFromImageKit(fileId) {
  try {
    await imagekit.deleteFile(fileId);
    return { success: true };
  } catch (error) {
    console.error('ImageKit delete error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Generate client-side authentication parameters for frontend direct uploads
 */
function getAuthenticationParameters() {
  return imagekit.getAuthenticationParameters();
}

module.exports = {
  uploadToImageKit,
  deleteFromImageKit,
  getAuthenticationParameters,
  DEFAULT_FOLDER
};
