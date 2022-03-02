import express, { Request, Response } from "express";
import { Appointment } from "../../models/appointment.model";
import { User } from "../../models/user.model";
import { requireAuth, BadRequestError, RoleType } from "@clinic-services/common";
const router = express.Router();

router.delete("/api/appointment/admin/delete", requireAuth, async (req: Request, res: Response) => {

    const admin = await User.findById(req.currentUser!.id);

    if (!admin || admin.role !== RoleType.Admin) {
        throw new BadRequestError("You don't have this permission");
    }

    const doctor = await User.findById(req.query.doctorId);

    if (!doctor || doctor.role !== RoleType.Doctor) {
        throw new BadRequestError("Doctor Not Found");
    }

    if (!req.query.appointmentId) {
        throw new BadRequestError("Appointment ID is required");
    }

    const appointment = await Appointment.findOne({
        id: req.query.appointmentId,
        doctor: doctor.id,
    });

    if (!appointment) {
        throw new BadRequestError("Appointment Not Found");
    }

    if (!appointment.patient) {
        throw new BadRequestError("You can't Delete Available Date Document");
    }

    await appointment.deleteOne();

    res.status(204).send({});

});
export { router as admin_delete_appointment_router };