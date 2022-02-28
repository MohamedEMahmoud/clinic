import express, { Request, Response } from "express";
import { BadRequestError, requireAuth } from "@clinic-services/common";
import { User } from "../models/user.model";
import { UserDeletedPublisher } from "../events/publishers/user-deleted-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

router.delete("/api/auth/user",
    requireAuth,
    async (req: Request, res: Response) => {
        const user = await User.findByIdAndDelete(req.currentUser!.id);
        if (!user) {
            throw new BadRequestError("Invalid credentials");
        }
        req.session = null;
        await new UserDeletedPublisher(natsWrapper.client).publish({
            id: user.id,
        });
        res.status(204).send({});
    });

export { router as deleteProfileRouter };