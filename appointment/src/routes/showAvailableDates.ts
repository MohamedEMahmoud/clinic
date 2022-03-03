import express, { Request, Response } from "express";
import { Appointment } from "../models/appointment.model";
import { User } from "../models/user.model";
import { requireAuth, BadRequestError, RoleType } from "@clinic-services/common";
import mongoose from "mongoose";

const router = express.Router();

router.get("/api/appointment/show-available", requireAuth, async (req: Request, res: Response) => {

    const user = await User.findById(req.currentUser!.id);

    if (!user) {
        throw new BadRequestError("You don't have this permission");
    }

    let appointments;

    if (user.role === RoleType.Admin || user.role === RoleType.Patient) {

        const { isValid } = mongoose.Types.ObjectId;

        if (!req.query.doctorId || !isValid(String(req.query.doctorId))) {
            throw new BadRequestError("Doctor ID is invalid");
        }

        const doctor = await User.findById(req.query.doctorId);

        if (!doctor) {
            throw new BadRequestError("Doctor Not Found");
        }

        appointments = await Appointment.find({ doctor: doctor.id });
    } else {
        appointments = await Appointment.find({ doctor: user.id });
    }

    appointments = appointments.filter(appointment => appointment.end_time);

    if (appointments.length === 0) {
        throw new BadRequestError("Appointments Not Found");
    }

    res.status(200).send({ status: 200, appointments, success: true });

});
export { router as show_all_available_dates_router };