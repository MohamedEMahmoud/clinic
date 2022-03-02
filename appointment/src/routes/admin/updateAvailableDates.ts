import express, { Request, Response } from "express";
import { User } from "../../models/user.model";
import { Appointment } from "../../models/appointment.model";
import { requireAuth, BadRequestError, upload, RoleType } from "@clinic-services/common";
import _ from "lodash";

const router = express.Router();

router.patch("/api/appointment/admin/available", upload.none(), requireAuth, async (req: Request, res: Response) => {

    const admin = await User.findById(req.currentUser!.id);

    if (!admin || admin.role !== RoleType.Admin) {
        throw new BadRequestError("You don't have this permission");
    }

    const doctor = await User.findById(req.query.doctorId);
    if (!doctor || doctor.role !== RoleType.Doctor) {
        throw new BadRequestError("Doctor Not Found");
    }

    if (!req.query.appointmentId) {
        throw new BadRequestError("Appointment Id must be provided");
    }

    const appointment = await Appointment.findOne({
        id: req.query.appointmentId,
        doctor: doctor.id,
    });

    if (!appointment) {
        throw new BadRequestError("Appointment Not Found");
    }

    if (req.body.date) {
        appointment.date = new Date(req.body.date).toDateString();
    }

    _.extend(appointment, req.body);

    await appointment.save();

    res.status(201).send({ status: 201, appointment, success: true });

});

export { router as admin_update_availableDates_router };