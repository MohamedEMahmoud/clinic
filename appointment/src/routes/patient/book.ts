import express, { Request, Response } from "express";
import { User } from "../../models/user.model";
import { Appointment } from "../../models/appointment.model";
import { requireAuth, BadRequestError, upload, StatusType, RoleType } from "@clinic-services/common";
import mongoose from "mongoose";
const router = express.Router();

router.post("/api/appointment/patient/book", upload.none(), requireAuth, async (req: Request, res: Response) => {

    const patient = await User.findById(req.currentUser!.id);

    if (!patient || patient.role !== RoleType.Patient) {
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

    if (!req.body.description) {
        throw new BadRequestError("description must be provided");
    }

    const appointment = Appointment.build({
        doctor: doctor.id,
        patient: patient.id,
        description: req.body.description,
        dataStatus: {
            id: patient.id,
            status: StatusType.Reserved
        }
    });

    await appointment.save();

    res.status(201).send({ status: 201, appointment, success: true });

});
export { router as patient_book_appointment_router };