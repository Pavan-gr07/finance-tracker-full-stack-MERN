const jwt = require("jsonwebtoken");

// module.exports = (req, res, next) => {
//     const token = req.cookies.finance_token;

//     if (!token) return res.status(401).json({ error: "Unauthorized" });



//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         req.userId = decoded.id;
//         // attach userId automatically
//         next();
//     } catch (err) {
//         return res.status(401).json({ error: "Invalid Token" });
//     }
// };

module.exports = (req, res, next) => {
    // 1. Check for the Authorization header
    const authHeader = req.headers.authorization;

    // 2. Validate format: Must exist and start with "Bearer "
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    // 3. Extract the token (remove 'Bearer ' from the string)
    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Unauthorized: Token missing" });
    }

    try {
        // 4. Verify Token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id; // attach userId automatically
        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid Token" });
    }
};