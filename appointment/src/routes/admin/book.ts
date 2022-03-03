import express, { Request, Response } from "express";
import { User } from "../../models/user.model";
import { Appointment } from "../../models/appointment.model";
import { requireAuth, BadRequestError, upload, StatusType, RoleType } from "@clinic-services/common";
import mongoose from "mongoose";

const router = express.Router();

router.post("/api/appointment/admin/book", upload.none(), requireAuth, async (req: Request, res: Response) => {

    const admin = await User.findById(req.currentUser!.id);

    if (!admin || admin.role !== RoleType.Admin) {
        throw new BadRequestError("You don't have this permission");
    }

    const { isValid } = mongoose.Types.ObjectId;

    if (!req.query.doctorId || !isValid(String(req.query.doctorId))) {
        throw new BadRequestError("Doctor ID is invalid");
    }

    const doctor = await User.findById(req.query.doctorId);

    if (!doctor || doctor.role !== RoleType.Doctor) {
        throw new BadRequestError("Doctor Not Found");
    }

    if (!req.query.patientId || !isValid(String(req.query.patientId))) {
        throw new BadRequestError("Patient ID is invalid");
    }

    const patient = await User.findById(req.query.patientId);

    if (!patient || patient.role !== RoleType.Patient) {
        throw new BadRequestError("Patient Not Found");
    }

    if (!req.body.description) {
        throw new BadRequestError("description must be provided");
    }

    if (!req.body.date) {
        throw new BadRequestError("date must be provided");
    }

    if (!req.body.start_time) {
        throw new BadRequestError("start time must be provided");
    }

    if (new Date(`${req.body.date} ${req.body.start_time}`) < new Date()) {
        throw new BadRequestError("Invalid date");
    }

    const appointment = Appointment.build({
        doctor: doctor.id,
        patient: patient.id,
        date: new Date(req.body.date).toDateString(),
        start_time: req.body.start_time,
        description: req.body.description,
        dataStatus: {
            id: admin.id,
            status: StatusType.Reserved
        }
    });

    await appointment.save();

    res.status(201).send({ status: 201, appointment, success: true });

});

export { router as admin_book_appointment_router };