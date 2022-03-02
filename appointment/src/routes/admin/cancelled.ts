import express, { Request, Response } from "express";
import { Appointment } from "../../models/appointment.model";
import { User } from "../../models/user.model";
import { requireAuth, BadRequestError, StatusType, RoleType } from "@clinic-services/common";
const router = express.Router();

router.patch("/api/appointment/admin/cancelled", requireAuth, async (req: Request, res: Response) => {

    const admin = await User.findById(req.currentUser!.id);

    if (!admin || admin.role !== RoleType.Admin) {
        throw new BadRequestError("You don't have this permission");
    }

    const doctor = await User.findById(req.query.doctorId);

    if (!doctor || doctor.role !== RoleType.Doctor) {
        throw new BadRequestError("Doctor Not Found");
    }

    const patient = await User.findById(req.query.patientId);

    if (!patient || patient.role !== RoleType.Patient) {
        throw new BadRequestError("Patient Not Found");
    }

    if (!req.query.appointmentId) {
        throw new BadRequestError("Appointment ID is required");
    }

    const appointment = await Appointment.findOne({
        id: req.query.appointmentId,
        doctor: doctor.id,
        patient: patient.id,
    });

    if (!appointment) {
        throw new BadRequestError("Appointment Not Found");
    }

    appointment.dataStatus = {
        id: admin.id,
        status: StatusType.Cancelled
    };

    await appointment.save();

    res.status(200).send({ status: 200, appointment, success: true });

});
export { router as admin_cancelled_appointment_router };