"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticateToken = (req, res, next) => {
    var _a, _b;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    if (!token)
        return res.status(401).json({ message: 'Authentication token not provided.' });
    jsonwebtoken_1.default.verify(token, ((_b = process === null || process === void 0 ? void 0 : process.env) === null || _b === void 0 ? void 0 : _b.PRIVATE_KEY) || "", (err, user) => {
        if (err) {
            return res.status(498).json({ message: 'Invalid token.' });
        }
        else {
            req.user = user;
            next();
        }
    });
};
exports.default = authenticateToken;
