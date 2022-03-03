import express, { Request, Response } from "express";
import { Appointment } from "../../models/appointment.model";
import { User } from "../../models/user.model";
import { requireAuth, BadRequestError, StatusType, RoleType } from "@clinic-services/common";
import mongoose from "mongoose";

const router = express.Router();

router.patch("/api/appointment/doctor/cancelled", requireAuth, async (req: Request, res: Response) => {

    const doctor = await User.findById(req.currentUser!.id);

    if (!doctor || doctor.role !== RoleType.Doctor) {
        throw new BadRequestError("You don't have this permission");
    }
    const { isValid } = mongoose.Types.ObjectId;

    const appointment = await Appointment.findById(req.query.appointmentId);

    if (!appointment) {
        throw new BadRequestError("Appointment Not Found");
    }

    appointment.dataStatus = {
        id: doctor.id,
        status: StatusType.Cancelled
    };

    await appointment.save();

    res.status(200).send({ status: 200, appointment, success: true });

});
export { router as doctor_cancelled_appointment_router };