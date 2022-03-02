import express, { Request, Response } from "express";
import { Appointment } from "../../models/appointment.model";
import { User } from "../../models/user.model";
import { requireAuth, BadRequestError, upload, RoleType } from "@clinic-services/common";

const router = express.Router();

router.get("/api/appointment/admin/schedule", upload.none(), requireAuth, async (req: Request, res: Response) => {

    const admin = await User.findById(req.currentUser!.id);

    if (!admin || admin.role !== RoleType.Admin) {
        throw new BadRequestError("You don't have this permission");
    }

    if (!req.query.doctorId) {
        throw new BadRequestError("Doctor Id is required");
    }

    const doctor = await User.findById(req.query.doctorId);

    if (!doctor) {
        throw new BadRequestError("Doctor Not Found");
    }

    let appointments = await Appointment.find({ doctor: doctor.id });

    if (appointments.length === 0) {
        throw new BadRequestError("Appointments Not Found");
    }

    appointments = appointments.filter(appointment => !appointment.date);


    res.status(200).send({ status: 200, appointments, success: true });

});
export { router as admin_schedule_appointment_router };