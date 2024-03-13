"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getErrorObject = exports.allErrorMessage = void 0;
const allErrorMessage = (errorMessages) => {
    return errorMessages.map(error => error.msg).join();
};
exports.allErrorMessage = allErrorMessage;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getErrorObject = (err) => {
    return {
        status: err.status || err.statusCode || 500,
        message: err.message || "Interner Server Error"
    };
};
exports.getErrorObject = getErrorObject;
