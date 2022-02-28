import express, { Request, Response } from "express";
import { Appointment } from "../../models/appointment.model";
import { requireAuth, BadRequestError, upload, StatusType } from "@clinic-services/common";

const router = express.Router();

router.patch("/api/appointment/reschedule", upload.none(), requireAuth, async (req: Request, res: Response) => {

    if (!req.query.appointmentId) {
        throw new BadRequestError("Appointment ID is required");
    }

    const appointment = await Appointment.findById(req.query.appointmentId);

    if (!appointment) {
        throw new BadRequestError("Appointment Not Found");
    }

    appointment.date = new Date(req.body.date).toDateString();

    appointment.description = req.body.description;

    appointment.start_time = req.body.start_time;

    appointment.dataStatus = {
        id: req.currentUser!.id,
        status: StatusType.Waiting
    };

    await appointment.save();

    res.status(200).send({ status: 200, appointment, success: true });

});
export { router as reschedule_appointment_router };