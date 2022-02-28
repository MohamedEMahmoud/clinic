import express, { Request, Response } from "express";
import { Appointment } from "../../models/appointment.model";
import { requireAuth, BadRequestError, upload } from "@clinic-services/common";

const router = express.Router();

router.get("/api/appointment/show", upload.none(), requireAuth, async (req: Request, res: Response) => {

    const appointments = await Appointment.find({ patient: req.currentUser!.id });

    if (appointments.length === 0) {
        throw new BadRequestError("Appointments Not Found");
    }

    res.status(200).send({ status: 200, appointments, success: true });

});
export { router as show_appointment_router };