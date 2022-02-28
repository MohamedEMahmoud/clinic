import express, { Request, Response } from "express";
import { User } from "../models/user.model";
import { BadRequestError, upload, requireAuth } from "@clinic-services/common";
import { UserUpdatedPublisher } from "../events/publishers/user-updated-publisher";
import { natsWrapper } from "../nats-wrapper";
const router = express.Router();

router.patch('/api/auth/active', upload.none(), requireAuth, async (req: Request, res: Response) => {

    const user = await User.findOne({ email: req.currentUser!.email });
    if (!user) {
        throw new BadRequestError("Invalid credentials");
    }

    if (!req.body.activeKey) {
        throw new BadRequestError("Active Key Is Required");
    }

    if (user.activeKey !== req.body.activeKey) {
        throw new BadRequestError("Active Key Is Invalid");

    }

    user.active = true;
    const userData = await user.save();
    if (userData) {
        await new UserUpdatedPublisher(natsWrapper.client).publish({
            id: userData.id,
            version: userData.version
        });
    }

    res.status(200).send({ status: 200, user, success: true });

});

export { router as activeRouter };