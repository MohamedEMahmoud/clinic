import express, { Request, Response } from "express";
import { Appointment } from "../../models/appointment.model";
import { User } from "../../models/user.model";
import { requireAuth, BadRequestError, StatusType, RoleType } from "@clinic-services/common";
import { AppointmentCreatedPublisher } from "../../events/publishers/appointment-created-publisher";
import { natsWrapper } from "../../nats-wrapper";
import mongoose from "mongoose";

const router = express.Router();

router.patch("/api/appointment/admin/approved", requireAuth, async (req: Request, res: Response) => {

    const admin = await User.findById(req.currentUser!.id);

    if (!admin || admin.role !== RoleType.Admin) {
        throw new BadRequestError("You don't have this permission");
    }

    const { isValid } = mongoose.Types.ObjectId;

    if (!req.query.patientId || !isValid(String(req.query.patientId))) {
        throw new BadRequestError("Patient ID is invalid");
    }

    const patient = await User.findById(req.query.patientId);

    if (!patient) {
        throw new BadRequestError("Patient Not Found");
    }

    if (!req.query.appointmentId || !isValid(String(req.query.appointmentId))) {
        throw new BadRequestError("Appointment ID is invalid");
    }

    const appointment = await Appointment.findById(req.query.appointmentId);

    if (!appointment) {
        throw new BadRequestError("Appointment Not Found");
    }

    appointment.dataStatus = {
        id: admin.id,
        status: StatusType.Approved
    };

    const appointmentData = await appointment.save();

    if (appointmentData) {
        await new AppointmentCreatedPublisher(natsWrapper.client).publish({
            id: appointmentData.id,
            patientId: appointmentData.patient,
            patientPhone: patient.phone,
            date: appointmentData.date,
            start_time: appointmentData.start_time,
        });
    }

    res.status(200).send({ status: 200, appointment, success: true });

});
export { router as admin_approved_appointment_router };