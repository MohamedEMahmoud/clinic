import express, { Request, Response } from "express";
import { User } from "../../models/user.model";
import { Appointment } from "../../models/appointment.model";
import { requireAuth, BadRequestError, upload, RoleType } from "@clinic-services/common";
import { AppointmentCreatedPublisher } from "../../events/publishers/appointment-created-publisher";
import { natsWrapper } from "../../nats-wrapper";
const router = express.Router();

router.post("/api/appointment/doctor/available", upload.none(), requireAuth, async (req: Request, res: Response) => {

    const doctor = await User.findById(req.currentUser!.id);

    if (!doctor || doctor.role !== RoleType.Doctor) {
        throw new BadRequestError("You don't have this permission");
    }

    if (!req.body.date) {
        throw new BadRequestError("date must be provided");
    }

    if (!req.body.start_time) {
        throw new BadRequestError("start time must be provided");
    }

    if (!req.body.end_time) {
        throw new BadRequestError("end time must be provided");
    }

    const appointment = Appointment.build({
        doctor: doctor.id,
        date: /\d/.test(req.body.date) ? new Date(req.body.date).toDateString().slice(0, 3) : req.body.date,
        start_time: req.body.start_time,
        end_time: req.body.end_time,
    });

    const appointmentData = await appointment.save();

    if (appointmentData) {

        await doctor.updateOne({ $push: { availableDates: appointment.id } }, { new: true });

        const doctorData = await doctor.save();

        if (doctorData) {
            await new AppointmentCreatedPublisher(natsWrapper.client).publish({
                id: appointmentData.id,
                doctorId: doctorData.id
            });
        }
    }

    res.status(201).send({ status: 201, appointment, success: true });

});

export { router as doctor_availableDates_router };