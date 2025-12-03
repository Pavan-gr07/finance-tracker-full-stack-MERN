const crypto = require('crypto');
const config = require('../config/config')

const ENC_KEY = Buffer.from(config.keys.passEncKey, "hex"); // 256-bit key
const IV = Buffer.from(config.keys.iv, "hex"); // 128-bit IV

// Encryption function
exports.encrypt = async (val) => {
    const cipher = crypto.createCipheriv('aes-256-cbc', ENC_KEY, IV);
    let encrypted = cipher.update(val, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
  };