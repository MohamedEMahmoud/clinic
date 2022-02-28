import express, { Request, Response } from "express";
import { requireAuth, BadRequestError, RoleType } from "@clinic-services/common";
import { User } from "../../models/user.model";

const router = express.Router();

router.get("/api/appointment/doctors", requireAuth, async (req: Request, res: Response) => {

    const doctors = await User.find({ role: RoleType.Doctor });

    if (doctors.length === 0) {
        throw new BadRequestError("Doctors Not Found");
    }

    res.status(200).send({ status: 200, doctors, success: true });

});
export { router as show_appointment_router };