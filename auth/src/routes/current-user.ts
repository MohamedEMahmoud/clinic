import express, { Request, Response } from "express";
import { currentUser } from "@clinic-services/common";

const router = express.Router();

router.get("/api/auth/currentuser", currentUser, (req: Request, res: Response) => {
    res.status(req.currentUser ? 200 : 400).send({ currentUser: req.currentUser || null });
});

export { router as currentUserRouter };