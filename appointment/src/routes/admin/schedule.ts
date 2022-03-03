import express, { Request, Response } from "express";
import { Appointment } from "../../models/appointment.model";
import { User } from "../../models/user.model";
import { requireAuth, BadRequestError, upload, RoleType } from "@clinic-services/common";
import mongoose from "mongoose";

const router = express.Router();

router.get("/api/appointment/admin/schedule", upload.none(), requireAuth, async (req: Request, res: Response) => {

    const admin = await User.findById(req.currentUser!.id);

    if (!admin || admin.role !== RoleType.Admin) {
        throw new BadRequestError("You don't have this permission");
    }

    const { isValid } = mongoose.Types.ObjectId;

    if (!req.query.doctorId || !isValid(String(req.query.doctorId))) {
        throw new BadRequestError("Doctor ID is invalid");
    }

    const doctor = await User.findById(req.query.doctorId);

    if (!doctor) {
        throw new BadRequestError("Doctor Not Found");
    }

    let appointments = await Appointment.find({ doctor: doctor.id });

    appointments = appointments.filter(appointment => !appointment.date);

    if (appointments.length === 0) {
        throw new BadRequestError("Appointments Not Found");
    }

    res.status(200).send({ status: 200, appointments, success: true });

});
export { router as admin_schedule_appointment_router };