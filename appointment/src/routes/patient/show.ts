import express, { Request, Response } from "express";
import { Appointment } from "../../models/appointment.model";
import { User } from "../../models/user.model";
import { requireAuth, BadRequestError, upload, RoleType } from "@clinic-services/common";
import mongoose from "mongoose";
const router = express.Router();

router.get("/api/appointment/patient/show", upload.none(), requireAuth, async (req: Request, res: Response) => {

    const patient = await User.findById(req.currentUser!.id);

    if (!patient || patient.role !== RoleType.Patient) {
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

    res.status(200).send({ status: 200, appointment, success: true });

});
export { router as patient_show_appointment_router };