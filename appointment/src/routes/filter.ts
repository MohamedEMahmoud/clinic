import express, { query, Request, Response } from "express";
import { Appointment } from "../models/appointment.model";
import { User } from "../models/user.model";
import { requireAuth, BadRequestError, RoleType } from "@clinic-services/common";
import mongoose from "mongoose";
import _ from "lodash";

const router = express.Router();

router.get("/api/appointment/filter", requireAuth, async (req: Request, res: Response) => {

    const user = await User.findById(req.currentUser!.id);

    if (!user || user.role === RoleType.Patient) {
        throw new BadRequestError("You don't have this permission");
    }

    const query: { [key: string]: any; } = {
        date: /\d/.test(req.body.date) ? new Date(req.body.date).toDateString() : req.body.date,
        patient: req.query.patientId,
        "dataStatus.status": req.query.status ? String(req.query.status).toLowerCase() : undefined,
    };

    _.each(query, (value, key) => {
        if (_.isUndefined(value)) {
            delete query[key];
        }
    });

    let appointments;

    if (user.role === RoleType.Admin) {

        const { isValid } = mongoose.Types.ObjectId;

        if (!req.query.doctorId || !isValid(String(req.query.doctorId))) {
            throw new BadRequestError("Doctor ID is invalid");
        }

        const doctor = await User.findById(req.query.doctorId);

        if (!doctor) {
            throw new BadRequestError("Doctor Not Found");
        }

        appointments = await Appointment.find({ doctor: doctor.id, ...query });

    } else {
        appointments = await Appointment.find({ doctor: user.id, ...query });
    }

    appointments = appointments.filter(appointment => !appointment.end_time);

    if (appointments.length === 0) {
        throw new BadRequestError("Appointments Not Found");
    }

    res.status(200).send({ status: 200, appointments, success: true });

});
export { router as filter_appointment_router };