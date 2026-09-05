const ImageKit = require('imagekit');

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || 'public_uzSklsoDFlGNoIPGFtTdcYJU32Y=',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || 'private_Zgjm0jSmxe2S76y3kkULZ5nzEvo=',
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/avdarinn'
});

const DEFAULT_FOLDER = process.env.IMAGEKIT_FOLDER || 'digitalverse';

module.exports = {
  imagekit,
  DEFAULT_FOLDER
};
