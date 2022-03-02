import express, { Request, Response } from "express";
import { Appointment } from "../../models/appointment.model";
import { User } from "../../models/user.model";
import { requireAuth, BadRequestError, upload, StatusType, RoleType } from "@clinic-services/common";
import _ from "lodash";
const router = express.Router();

router.patch("/api/appointment/admin/update-book", upload.none(), requireAuth, async (req: Request, res: Response) => {

    const admin = await User.findById(req.currentUser!.id);

    if (!admin || admin.role !== RoleType.Admin) {
        throw new BadRequestError("You don't have this permission");
    }

    if (!req.query.appointmentId) {
        throw new BadRequestError("Appointment ID is required");
    }

    const appointment = await Appointment.findById(req.query.appointmentId);

    if (!appointment) {
        throw new BadRequestError("Appointment Not Found");
    }

    if (req.body.date) {
        appointment.date = new Date(req.body.date).toDateString();
    }

    _.extend(appointment, req.body);

    appointment.dataStatus = {
        id: admin.id,
        status: StatusType.Reserved
    };

    await appointment.save();

    res.status(200).send({ status: 200, appointment, success: true });

});

export { router as admin_update_book_appointment_router };