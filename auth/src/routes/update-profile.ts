import express, { Request, Response } from "express";
import { requireAuth, BadRequestError, upload, validateImage } from "@clinic-services/common";
import { User } from "../models/user.model";
import { v2 as Cloudinary } from "cloudinary";
import { Password } from "../services/Password";
import _ from "lodash";
import { natsWrapper } from "../nats-wrapper";
import { UserUpdatedPublisher } from "../events/publishers/user-updated-publisher";
import jwt from "jsonwebtoken";
const router = express.Router();

router.patch("/api/auth/user",
    upload.fields([{ name: "picture", maxCount: 1 }]),
    requireAuth,
    validateImage,
    async (req: Request, res: Response) => {
        const files = req.files as { [fieldname: string]: Express.Multer.File[]; };

        const user = await User.findById(req.currentUser!.id);

        if (!user) {
            throw new BadRequestError("Invalid credentials");
        }

        if (req.body.username) {
            const existingUserName = await User.findOne({ username: req.body.username });

            if (existingUserName) {
                throw new BadRequestError("username already exists");
            }

            user.username = req.body.username;
        }

        if (req.body.email) {
            const existingEmail = await User.findOne({ email: req.body.email });

            if (existingEmail) {
                throw new BadRequestError("Email already exists");
            }

            user.email = req.body.email;

            req.session = null;
            const userJwt = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_KEY!);

            req.session = {
                jwt: userJwt
            };
        }

        if (req.body.password) {
            const passwordSpecialCharsValidation = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;

            if (req.body.password.length < 8) {
                throw new BadRequestError("Password must be more 8 characters");
            }

            let isTheSamePassword = await Password.compare(
                user.password,
                req.body.password,
            );

            if (isTheSamePassword) {
                throw new BadRequestError("Can not change password with the previous one");
            }
            if (!passwordSpecialCharsValidation.test(req.body.password)) {
                throw new BadRequestError("Password must contain a special character");
            }

            if (req.body.password.toLowerCase().includes("password") || req.body.password.toLowerCase().includes("qwerty") || req.body.password.toLowerCase().includes("asdf")) {
                throw new BadRequestError("For security reasons! The Password can contain neither 'password' nor 'qwerty' nor 'asdf'.");
            }

            user.password = req.body.password;
        }

        if (files.picture) {
            await new Promise((resolve, reject) => {
                Cloudinary.uploader.upload_stream({
                    public_id: `profile-picture/social-${user.username}`,
                    use_filename: true,
                    tags: `${user.username}-tag`,
                    width: 500,
                    height: 500,
                    crop: "scale",
                    placeholder: true,
                    resource_type: 'auto'
                }, (err, result) => {
                    if (err) {
                        console.log(err);
                        reject(err);
                    } else {
                        user.picture = result?.secure_url!;
                        resolve(user.picture);
                    }
                }).end(files.picture[0].buffer);
            });
        }

        _.extend(user, req.body);

        const savedData = await user.save();

        // if (savedData) {

        //     const bodyData: { [key: string]: string; } = {};
            
        //     _.each(req.body, (value, key: string) => {
        //         const fields = ["email", "picture", "availableDates"];
        //         fields.forEach(el => {
        //             if (key === el) {
        //                 bodyData[key] = value;
        //             }
        //         });
        //     });

        //     await new UserUpdatedPublisher(natsWrapper.client).publish({
        //         id: savedData.id,
        //         ...bodyData,
        //         version: savedData.version
        //     });
        // }

        res.status(200).send({ status: 200, user, success: true });
    });

export { router as updateProfileRouter };