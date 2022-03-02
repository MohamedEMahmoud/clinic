import express, { Request, Response } from "express";
import { Appointment } from "../../models/appointment.model";
import { User } from "../../models/user.model";
import { requireAuth, BadRequestError, StatusType, RoleType } from "@clinic-services/common";
import { AppointmentCreatedPublisher } from "../../events/publishers/appointment-created-publisher";
import { natsWrapper } from "../../nats-wrapper";

const router = express.Router();

router.patch("/api/appointment/admin/approved", requireAuth, async (req: Request, res: Response) => {

    const admin = await User.findById(req.currentUser!.id);

    if (!admin || admin.role !== RoleType.Admin) {
        throw new BadRequestError("You don't have this permission");
    }

    const doctor = await User.findById(req.query.doctorId);

    if (!doctor) {
        throw new BadRequestError("Doctor Not Found");
    }

    const patient = await User.findById(req.query.patientId);

    if (!patient) {
        throw new BadRequestError("Patient Not Found");
    }

    if (!req.query.appointmentId) {
        throw new BadRequestError("Appointment ID is required");
    }

    const appointment = await Appointment.findOne({
        id: req.query.appointmentId,
        doctor: doctor.id,
        patient: patient.id,
    });

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
            doctorId: appointmentData.doctor,
            patientId: appointmentData.patient,
            patientPhone: patient.phone,
            date: appointmentData.date,
            start_time: appointmentData.start_time,
        });
    }

    res.status(200).send({ status: 200, appointment, success: true });

});
export { router as admin_approved_appointment_router };