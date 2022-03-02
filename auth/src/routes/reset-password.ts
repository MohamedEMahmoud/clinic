import { upload, BadRequestError } from "@clinic-services/common";
import express, { Request, Response } from "express";
import { User } from "../models/user.model";
import { Password } from "../services/Password";
import { UserUpdatedPublisher } from "../events/publishers/user-updated-publisher";
import { natsWrapper } from "../nats-wrapper";
const router = express.Router();

router.patch("/api/auth/reset", upload.none(), async (req: Request, res: Response) => {

    const user = await User.findOne({ email: req.query.email });
    if (!user) {
        throw new BadRequestError("User Not Found");
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
    } else {
        throw new BadRequestError("Password Is Required");
    }

    const userData = await user.save();
    if (userData) {
        await new UserUpdatedPublisher(natsWrapper.client).publish({
            id: user.id,
            version: user.version
        });
    }

    res.status(200).send({ status: 200, user, message: "success reset password", success: true, });



});

export { router as resetPasswordRouter };