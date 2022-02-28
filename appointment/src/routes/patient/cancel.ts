import express, { Request, Response } from "express";
import { Appointment } from "../../models/appointment.model";
import { requireAuth, BadRequestError, upload, StatusType } from "@clinic-services/common";

const router = express.Router();

router.patch("/api/appointment/cancel", upload.none(), requireAuth, async (req: Request, res: Response) => {

    if (!req.query.appointmentId) {
        throw new BadRequestError("Appointment ID is required");
    }

    const appointment = await Appointment.findById(req.query.appointmentId);

    if (!appointment) {
        throw new BadRequestError("Appointment Not Found");
    }

    appointment.dataStatus = {
        id: req.currentUser!.id,
        status: StatusType.Cancelled
    };

    await appointment.save();

    res.status(200).send({ status: 200, appointment, success: true });

});
export { router as cancel_appointment_router };