import express, { Request, Response } from "express";
import { User } from "../../models/user.model";
import { Appointment } from "../../models/appointment.model";
import { requireAuth, BadRequestError, upload, StatusType } from "@clinic-services/common";

const router = express.Router();

router.post("/api/appointment/book", upload.none(), requireAuth, async (req: Request, res: Response) => {

    if (!req.query.doctorId) {
        throw new BadRequestError("Doctor ID is required");
    }

    const doctor = await User.findById(req.query.doctorId);

    if (!doctor) {
        throw new BadRequestError("Doctor Not Found");
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

    const appointment = Appointment.build({
        doctor: doctor.id,
        patient: req.currentUser!.id,
        date: new Date(req.body.date).toDateString(),
        start_time: req.body.start_time,
        description: req.body.description,
        dataStatus: {
            id: req.currentUser!.id,
            status: StatusType.Waiting
        }
    });

    await appointment.save();

    res.status(201).send({ status: 201, appointment, success: true });

});
export { router as book_appointment_router };