import express, { Request, Response } from "express";
import { Appointment } from "../../models/appointment.model";
import { User } from "../../models/user.model";
import { requireAuth, BadRequestError, RoleType } from "@clinic-services/common";
import mongoose from "mongoose";

const router = express.Router();

router.delete("/api/appointment/admin/delete", requireAuth, async (req: Request, res: Response) => {

    const admin = await User.findById(req.currentUser!.id);

    if (!admin || admin.role !== RoleType.Admin) {
        throw new BadRequestError("You don't have this permission");
    }

    const { isValid } = mongoose.Types.ObjectId;

    if (!req.query.appointmentId || !isValid(String(req.query.appointmentId))) {
        throw new BadRequestError("Appointment ID is invalid");
    }

    const appointment = await Appointment.findById(req.query.appointmentId);

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