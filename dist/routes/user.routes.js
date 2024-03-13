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
const router = (0, express_1.Router)();
router.get('/users', (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield user_model_1.default.find({}, { password: 0 });
        res.status(200).json(users);
    }
    catch (err) {
        const error = (0, error_1.getErrorObject)(err);
        res.status(error.status).json(error);
    }
}));
router.get('/users/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    try {
        const user = yield user_model_1.default.findById(id, { password: 0 });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    }
    catch (err) {
        const error = (0, error_1.getErrorObject)(err);
        res.status(error.status).json(error);
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
        res.status(201).json({ message: `Created '${newUser.username}' with success` });
    }
    catch (err) {
        const error = (0, error_1.getErrorObject)(err);
        res.status(error.status).json(error);
    }
}));
router.put('/users/:id', users_validation_1.sanitizationUserBody, users_validation_1.userValidationSchema, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { isError, message } = (0, users_validation_1.checkIsValidUserBody)(req);
    if (isError)
        return res.status(422).json({ message });
    const id = req.params.id;
    const { name, username, email, password } = req.body;
    try {
        const hashedPassword = yield (0, securityData_1.hashPassword)(password);
        const user = yield user_model_1.default.findByIdAndUpdate(id, { name, username, email, hashedPassword }, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: `Updated '${user.username}' with success` });
    }
    catch (err) {
        const error = (0, error_1.getErrorObject)(err);
        res.status(error.status).json(error);
    }
}));
router.delete('/users/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    try {
        const user = yield user_model_1.default.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: `Delete user '${user.username}' with success` });
    }
    catch (err) {
        const error = (0, error_1.getErrorObject)(err);
        res.status(error.status).json(error);
    }
}));
exports.default = router;
