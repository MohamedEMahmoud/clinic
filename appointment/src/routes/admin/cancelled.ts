import express, { Request, Response } from "express";
import { Appointment } from "../../models/appointment.model";
import { User } from "../../models/user.model";
import { requireAuth, BadRequestError, StatusType, RoleType } from "@clinic-services/common";
import mongoose from "mongoose";

const router = express.Router();

router.patch("/api/appointment/admin/cancelled", requireAuth, async (req: Request, res: Response) => {

    const admin = await User.findById(req.currentUser!.id);

    if (!admin || admin.role !== RoleType.Admin) {
        throw new BadRequestError("You don't have this permission");
    }
    
    const { isValid } = mongoose.Types.ObjectId;

    if (!req.query.appointmentId || !isValid(String(req.query.appointmentId))) {
        throw new BadRequestError("Appointment ID is invalid");
    }

    const appointment = await Appointment.findById(req.query.appointmentId);

    if (!appointment) {
        throw new BadRequestError("Appointment Not Found");
    }

    appointment.dataStatus = {
        id: admin.id,
        status: StatusType.Cancelled
    };

    await appointment.save();

    res.status(200).send({ status: 200, appointment, success: true });

});
export { router as admin_cancelled_appointment_router };