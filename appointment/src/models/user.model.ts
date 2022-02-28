import mongoose from 'mongoose';
import { RoleType } from '@clinic-services/common';
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

interface UserAttrs {
    id: string;
    email: string;
    picture: string;
    specialization?: string;
    phone?: string;
    role: RoleType;
    availableDates: string[];
};

interface UserDoc extends mongoose.Document {
    email: string;
    picture: string;
    specialization?: string;
    phone?: string;
    role: RoleType;
    availableDates: string[];
    rate: number;
    version: number;
    createdAt: string;
    updatedAt: string;
};

interface UserModel extends mongoose.Model<UserDoc> {
    build(attrs: UserAttrs): UserDoc;
}

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        max: 50,
        lowercase: true
    },
    picture: {
        type: String,
    },
    role: {
        type: String,
        trim: true,
        enum: Object.values(RoleType),
    },
    phone: {
        type: String,
        trim: true,
    },
    specialization: {
        type: String,
        trim: true,
    },
    rate: {
        type: Number,
        default: 0,
        max: 5,
        min: 0
    },
    availableDates: {
        type: Array,
        default: []
    },
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id,
                delete ret._id,
                delete ret.password;
            if (ret.availableDates.length === 0) {
                delete ret.availableDates;
            } else {
                ret.availableDates = ret.availableDates.map((data: any) => {
                    const { date, start_time, end_time, _id: id } = data;
                    return { date, start_time, end_time, id };
                });
            }
        }
    },
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

userSchema.set("versionKey", "version");

userSchema.plugin(updateIfCurrentPlugin);

userSchema.statics.build = (attrs: UserAttrs) => new User({ _id: attrs.id, ...attrs });

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };