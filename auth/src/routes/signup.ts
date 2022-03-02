import express, { Request, Response } from "express";
import { validateRequest, BadRequestError, validateImage, upload, GenderType, PictureType } from "@clinic-services/common";
import { User } from "../models/user.model";
import jwt from "jsonwebtoken";
import { v2 as Cloudinary } from "cloudinary";
import address from "address";
import { randomBytes } from "crypto";
import nodemailer, { TransportOptions } from "nodemailer";
import { OAuth2Client } from "google-auth-library";
import { UserCreatedPublisher } from "../events/publishers/user-created-publisher";
import { natsWrapper } from "../nats-wrapper";
const router = express.Router();

router.post("/api/auth/signup",
    upload.fields([
        { name: "picture", maxCount: 1 },
    ]),
    validateImage,
    validateRequest,
    async (req: Request, res: Response) => {
        const files = req.files as { [fieldname: string]: Express.Multer.File[]; };

        const email = await User.findOne({ email: req.body.email });
        if (email) {
            throw new BadRequestError("Email is already exist");
        }

        const username = await User.findOne({ username: req.body.username });
        if (username) {
            throw new BadRequestError("username is already exist");
        }

        const user = User.build({ ...req.body });

        const userJwt = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_KEY!);
        req.session = {
            jwt: userJwt
        };

        if (req.body.day || req.body.month || req.body.year) {
            if (!req.body.day || !req.body.month || !req.body.year) {
                throw new BadRequestError("Invalid birthday");
            }

            const age = {
                day: req.body.day,
                month: req.body.month,
                year: req.body.year,
            };

            if (age.day && age.month && age.year) {
                const { day, month, year } = age;
                const calculate_age = (dob: Date) => {
                    let diff_ms = Date.now() - dob.getTime();
                    let age_dt = new Date(diff_ms);

                    return Math.abs(age_dt.getUTCFullYear() - 1970);
                };
                user.age = calculate_age(new Date(year, month, day));
            }
            if (typeof user.age !== "number") {
                throw new BadRequestError("please enter birthday");
            }
        }

        if (files.picture) {
            await new Promise((resolve, reject) => {
                Cloudinary.uploader.upload_stream({
                    public_id: `profile-picture/clinic-services-${user.username}`,
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
        } else {
            if (user.gender === GenderType.Male) {
                user.picture = PictureType.Male;
            } else {
                user.picture = PictureType.Female;
            }
        }

        address.mac((err, addr) => {
            if (err) {
                throw new BadRequestError("Can not reach to MAC Address");
            }
            else {
                return user.macAddress.push({ MAC: addr });
            }
        });
        const client = new OAuth2Client(
            process.env.CLIENT_ID,
            process.env.CLIENT_SECRET,
            process.env.REDIRECT_URI
        );

        client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

        let accessToken;
        try {
            accessToken = await client.getAccessToken();
        } catch (err) { }

        const activeKey = randomBytes(8).toString("hex").toLowerCase();

        let transport = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: process.env.MAIL_SERVER_PORT,
            secure: true,
            auth: nodemailerAccessTokenIsExpired(accessToken),
            tls: {
                rejectUnauthorized: true,
            },
        } as TransportOptions);

        const message = {
            from: '"clinic-Microservices Support" <no-reply@clinic-microservices>',
            to: user.email,
            subject: "clinic-Microservices Support",
            html: `
                        <div style="text-align: center;  font-family: sans-serif">
                            <img src="https://res.cloudinary.com/micro-services/image/upload/v1646043642/clinic.jpg" alt="clinic-Microservices" style="width: 250px">
                            <div style="text-align: center; margin: auto; padding: 20px; background: #FFFFFF; color: #041438">
                                <h1 style="direction: ltr">Just one more step...</h1>
                                <h2>${user.username}</h2>
                                <p style="font-size: 16px">
                                 activate your clinic-Microservices account 
                                </p>
                                <p style="color: #FFFFFF; text-decoration: none; background: #041438; padding: 15px 0; display: block; width: 170px; margin: auto; text-transform: Capitalize; font-size: 18px; font-weight: bold">${activeKey}</p>
                            </div>
                            <div style="margin: 20px; background: transparent; color: #041438">
                                <p style="font-size: 14px; direction: ltr">If you think something is wrong please
                                    <a  style="color: #041438; text-transform: uppercase;" href="" target="_blank">contact us</a>
                                </p>
                                <p style="margin: 20px 0; direction: ltr">&copy; 2022 - <a style="color: #041438; direction: ltr" href="mailto:techno@beta.ai">clinic-Microservices Technical Team</a>, All rights reserved</p>
                          </div>
                    `,
        };

        transport.verify((err) => {
            if (err) {
                console.error(err);
            } else {
                console.log("server is ready to send email");
            }
        });

        transport.sendMail(message, async (err) => {
            if (err) {
                console.log(err);
                throw new BadRequestError("Account was created but the activation email not sent");
            } else {
                user.activeKey = activeKey;
                const userData = await user.save();
                if (userData) {
                    await new UserCreatedPublisher(natsWrapper.client).publish({
                        id: userData.id,
                        email: userData.email,
                        username: userData.username,
                        age: userData.age,
                        role: userData.role,
                        specialization: userData.specialization,
                        phone: userData.phone,
                        picture: userData.picture,
                        version: userData.version
                    });
                }

                res.status(201).send({ status: 201, user, success: true });
            }
        });
    });

const nodemailerAccessTokenIsExpired = (accessToken: any) => {
    if (!accessToken) {
        return {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        };
    }
    else {
        return {
            type: "OAuth2",
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            refreshToken: process.env.REFRESH_TOKEN,
            accessToken: accessToken,
        };
    }
};


export { router as signupRouter };


