import { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '..';

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
    const specialCharactersValidator = /[ `!@#$%^&*()+\=\[\]{};':"\\|,.<>\/?~]/;
    const emailValidation = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const fields = ["gender", "username", "password", "email", "phone", "role", "day", "month", "year"];
    fields.map(field => {
        if (field in req.body) {
            if (field === 'username') {
                if (req.body.username.length < 8) {
                    throw new BadRequestError('Username must be more than 8 characters.');
                }

                if (specialCharactersValidator.test(req.body.username)) {
                    throw new BadRequestError('Username should not contain special characters.');
                }

                if (/\s/gi.test(req.body.username)) {
                    throw new BadRequestError('Invalid username');
                }
            }

            if (field === 'email') {
                if (!emailValidation.test(req.body.email)) {
                    throw new BadRequestError('Invalid email');
                }
            }

            if (field === 'password') {
                if (req.body.password.includes('password') || req.body.password.includes('asdf') || req.body.password.length < 8) {
                    throw new BadRequestError('Password is too week.');
                }

                if (!specialCharactersValidator.test(req.body.password)) {
                    throw new BadRequestError('Password must contain a special character.');
                }
            }
        }

        else {
            throw new BadRequestError(`${field} is required.`);
        }
    });

    next();
};