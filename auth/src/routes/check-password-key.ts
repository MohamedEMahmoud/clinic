import { upload, BadRequestError } from "@clinic-services/common";
import express, { Request, Response } from "express";
import { User } from "../models/user.model";

const router = express.Router();

router.post("/api/auth/check-key", upload.none(), async (req: Request, res: Response) => {

    const user = await User.findOne({ email: req.query.email });

    if (!user) {
        throw new BadRequestError("User Not Found");
    }

    if (req.body.passwordKey) {
        if (new Date() > new Date(user.resetPasswordExpires)) {
            throw new BadRequestError("Password Key Is Expired");
        }
        if (user.resetPasswordKey !== req.body.passwordKey) {
            throw new BadRequestError("Password Key Is Invalid");
        }
        res.status(200).send({ status: 200, user, success: true, });
    } else {
        throw new BadRequestError("Password Key Is Required");
    }

});

export { router as checkPasswordKeyRouter };