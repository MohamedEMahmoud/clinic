import express, { Request, Response } from "express";
import { Appointment } from "../../models/appointment.model";
import { User } from "../../models/user.model";
import { requireAuth, BadRequestError, upload, RoleType } from "@clinic-services/common";

const router = express.Router();

router.get("/api/appointment/patient/show", upload.none(), requireAuth, async (req: Request, res: Response) => {

    const patient = await User.findById(req.currentUser!.id);

    if (!patient || patient.role !== RoleType.Patient) {
        throw new BadRequestError("You don't have this permission");
    }

    const appointments = await Appointment.find({ patient: patient.id });

    if (appointments.length === 0) {
        throw new BadRequestError("Appointments Not Found");
    }

    res.status(200).send({ status: 200, appointments, success: true });

});
export { router as patient_show_appointment_router };