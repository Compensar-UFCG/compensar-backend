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
const users_validation_1 = require("../utils/users.validation");
const error_1 = require("../utils/error");
const securityData_1 = require("../utils/securityData");
const authenticator_1 = __importDefault(require("../middlewares/authenticator"));
const router = (0, express_1.Router)();
router.get('/users', authenticator_1.default, (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield user_model_1.default.find({}, { password: 0 });
        return res.status(200).json(users);
    }
    catch (err) {
        const error = (0, error_1.getErrorObject)(err);
        return res.status(error.status).json(error);
    }
}));
router.get('/users/:id', authenticator_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const id = req.params.id;
    if (id !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id))
        return res.status(403).json({ message: 'You do not have permission to access this information.' });
    try {
        const user = yield user_model_1.default.findById(id, { password: 0 });
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        else
            return res.status(200).json(user);
    }
    catch (err) {
        const error = (0, error_1.getErrorObject)(err);
        return res.status(error.status).json(error);
    }
}));
router.post('/users', users_validation_1.sanitizationUserBody, users_validation_1.userValidationSchema, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { isError, message } = (0, users_validation_1.checkIsValidUserBody)(req);
    if (isError)
        return res.status(422).json({ message });
    const { name, username, email, password } = req.body;
    try {
        const hashedPassword = yield (0, securityData_1.hashPassword)(password);
        const user = new user_model_1.default({
            name,
            username,
            email,
            password: hashedPassword,
        });
        const newUser = yield user.save();
        return res.status(201).json({ message: `Created '${newUser.username}' with success` });
    }
    catch (err) {
        if (err.message.includes('duplicate key'))
            return res.status(409).json({ message: `Exist user with: ${err.keyValue.email || err.keyValue.username}` });
        else {
            const error = (0, error_1.getErrorObject)(err);
            return res.status(error.status).json(error);
        }
    }
}));
router.put('/users/:id', authenticator_1.default, users_validation_1.sanitizationUserBody, users_validation_1.userValidationSchema, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const id = req.params.id;
    if (id !== ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id)) {
        return res.status(403).json({ message: 'You do not have permission to modify this information.' });
    }
    const { isError, message } = (0, users_validation_1.checkIsValidUserBody)(req);
    if (isError)
        return res.status(422).json({ message });
    const { name, username, email, password } = req.body;
    try {
        const hashedPassword = yield (0, securityData_1.hashPassword)(password);
        const user = yield user_model_1.default.findByIdAndUpdate(id, { name, username, email, hashedPassword }, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        else
            return res.json({ message: `Updated '${user.username}' with success` });
    }
    catch (err) {
        if (err.message.includes('duplicate key'))
            return res.status(409).json({ message: `Exist user with: ${err.keyValue.email || err.keyValue.username}` });
        else {
            const error = (0, error_1.getErrorObject)(err);
            return res.status(error.status).json(error);
        }
    }
}));
router.delete('/users/:id', authenticator_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const id = req.params.id;
    if (id !== ((_c = req.user) === null || _c === void 0 ? void 0 : _c.id)) {
        return res.status(403).json({ message: 'You do not have permission to delete this information.' });
    }
    try {
        const user = yield user_model_1.default.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        else
            return res.status(200).json({ message: `Delete user '${user.username}' with success` });
    }
    catch (err) {
        const error = (0, error_1.getErrorObject)(err);
        return res.status(error.status).json(error);
    }
}));
exports.default = router;
