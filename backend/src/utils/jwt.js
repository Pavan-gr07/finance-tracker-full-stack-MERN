const jwt = require('jsonwebtoken');


const sign = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' });
};


const verify = (token) => jwt.verify(token, process.env.JWT_SECRET || 'devsecret');


module.exports = { sign, verify };