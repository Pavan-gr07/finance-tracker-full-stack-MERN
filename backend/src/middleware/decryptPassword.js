const crypto = require('crypto');
const config = require('../config/config')

const ENC_KEY = Buffer.from(config.keys.passEncKey, "hex"); // 256-bit key
const IV = Buffer.from(config.keys.iv, "hex"); // 128-bit IV

// Decryption function
exports.decrypt = async (encrypted) => {
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENC_KEY, IV);
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  };