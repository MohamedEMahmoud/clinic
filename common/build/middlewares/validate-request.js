"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const __1 = require("..");
const validateRequest = (req, res, next) => {
    const specialCharactersValidator = /[ `!@#$%^&*()+\=\[\]{};':"\\|,.<>\/?~]/;
    const emailValidation = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const fields = ["gender", "username", "password", "email", "phone", "role", "day", "month", "year"];
    fields.map(field => {
        if (field in req.body) {
            if (field === 'username') {
                if (req.body.username.length < 8) {
                    throw new __1.BadRequestError('Username must be more than 8 characters.');
                }
                if (specialCharactersValidator.test(req.body.username)) {
                    throw new __1.BadRequestError('Username should not contain special characters.');
                }
                if (/\s/gi.test(req.body.username)) {
                    throw new __1.BadRequestError('Invalid username');
                }
            }
            if (field === 'email') {
                if (!emailValidation.test(req.body.email)) {
                    throw new __1.BadRequestError('Invalid email');
                }
            }
            if (field === 'password') {
                if (req.body.password.includes('password') || req.body.password.includes('asdf') || req.body.password.length < 8) {
                    throw new __1.BadRequestError('Password is too week.');
                }
                if (!specialCharactersValidator.test(req.body.password)) {
                    throw new __1.BadRequestError('Password must contain a special character.');
                }
            }
        }
        else {
            throw new __1.BadRequestError(`${field} is required.`);
        }
    });
    next();
};
exports.validateRequest = validateRequest;
