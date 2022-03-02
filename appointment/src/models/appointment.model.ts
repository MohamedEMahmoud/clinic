import mongoose from "mongoose";
import { StatusType } from "@clinic-services/common";

interface AppointmentAttrs {
    doctor: string;
    patient?: string;
    date?: string;
    start_time?: string;
    end_time?: string;
    description?: string;
    dataStatus?: { id: string; status: StatusType; };
}

interface AppointmentDoc extends mongoose.Document {
    doctor: string;
    patient: string;
    date: string;
    start_time: string;
    end_time: string;
    description: string;
    dataStatus: { id: string; status: StatusType; };
    reschedule: boolean;
    createdAt: string;
    updatedAt: string;
}

interface AppointmentModel extends mongoose.Model<AppointmentDoc> {
    build(attrs: AppointmentAttrs): AppointmentDoc;
}

const appointmentSchema = new mongoose.Schema({
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    date: {
        type: String,
    },
    start_time: {
        type: String,
    },
    end_time: {
        type: String,
    },
    description: {
        type: String,
        trim: true,
        max: 100,
    },
    reschedule: {
        type: Boolean,
        default: false,
    },
    dataStatus: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        status: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            enum: Object.values(StatusType),
        }
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        }
    },
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    versionKey: false
});

const Appointment = mongoose.model<AppointmentDoc, AppointmentModel>('Appointment', appointmentSchema);

export { Appointment };