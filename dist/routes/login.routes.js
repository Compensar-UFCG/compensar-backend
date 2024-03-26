"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_model_1 = __importDefault(require("../models/user.model"));
const securityData_1 = require("../utils/securityData");
const error_1 = require("../utils/error");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = (0, express_1.Router)();
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password } = req.body;
    try {
        const user = yield user_model_1.default.findOne({ $or: [{ email }, { username }] });
        if (!user) {
            return res.status(401).json({ message: 'Credenciais inválidas' });
        }
        const isMatch = yield (0, securityData_1.compareHash)(password, user.password);
        if (isMatch) {
            const token = jsonwebtoken_1.default.sign({ id: user.id }, process.env.PRIVATE_KEY || "", { expiresIn: '24h' });
            return res.status(200).json({ token });
        }
        else
            return res.status(401).json({ message: 'Credenciais inválidas' });
    }
    catch (err) {
        const error = (0, error_1.getErrorObject)(err);
        return res.status(error.status).json(error);
    }
}));
exports.default = router;
