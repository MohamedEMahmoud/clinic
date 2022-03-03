import express, { Request, Response } from "express";
import { User } from "../../models/user.model";
import { Appointment } from "../../models/appointment.model";
import { requireAuth, BadRequestError, upload, RoleType } from "@clinic-services/common";
import _ from "lodash";
import mongoose from "mongoose";

const router = express.Router();

router.patch("/api/appointment/admin/update-available", upload.none(), requireAuth, async (req: Request, res: Response) => {

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

    if (new Date(`${req.body.date} ${req.body.start_time}`) < new Date()) {
        throw new BadRequestError("Invalid date");
    }

    _.extend(appointment, req.body);

    if (req.body.date) {
        appointment.date = /\d/.test(req.body.date) ? new Date(appointment.date).toDateString().slice(0, 3) : req.body.date;
    }

    await appointment.save();

    res.status(201).send({ status: 201, appointment, success: true });

});

export { router as admin_update_available_dates_router };