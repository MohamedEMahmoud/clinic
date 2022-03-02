import express, { Request, Response } from "express";
import { Appointment } from "../models/appointment.model";
import { User } from "../models/user.model";
import { requireAuth, BadRequestError, RoleType } from "@clinic-services/common";

const router = express.Router();

router.get("/api/appointment/view", requireAuth, async (req: Request, res: Response) => {

    const user = await User.findById(req.currentUser!.id);

    if (!user || user.role === RoleType.Patient) {
        throw new BadRequestError("You don't have this permission");
    }

    let appointments;

    if (user.role === RoleType.Admin) {
        if (!req.query.doctorId) {
            throw new BadRequestError("Doctor Id must be provided");
        }

        const doctor = await User.findById(req.query.doctorId);

        if (!doctor) {
            throw new BadRequestError("Doctor Not Found");
        }

        appointments = await Appointment.find({ doctor: doctor.id });
    } else {
        appointments = await Appointment.find({ doctor: user.id });
    }

    if (appointments.length === 0) {
        throw new BadRequestError("Appointments Not Found");
    }

    appointments = appointments.filter(appointment => new Date(appointment.date).getDate() === new Date().getDate() || new Date(appointment.date) > new Date());

    res.status(200).send({ status: 200, appointments, success: true });

});

export { router as view_all_upcoming_appointments_router };