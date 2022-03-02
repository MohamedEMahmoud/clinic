import mongoose from 'mongoose';
import { RoleType } from '@clinic-services/common';
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

interface UserAttrs {
    id: string;
    username: string;
    email: string;
    role: RoleType;
    picture: string;
    age: number;
    specialization?: string;
    phone: string;
    version: number;
};

interface UserDoc extends mongoose.Document {
    email: string;
    picture: string;
    specialization?: string;
    phone?: string;
    role: RoleType;
    availableDates: string[];
    version: number;
    createdAt: string;
    updatedAt: string;
};

interface UserModel extends mongoose.Model<UserDoc> {
    build(attrs: UserAttrs): UserDoc;
    findByEvent(event: { id: string; version: number; }): Promise<UserDoc | null>;
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
            }
        }
    },
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

userSchema.set("versionKey", "version");

userSchema.plugin(updateIfCurrentPlugin);

userSchema.statics.build = (attrs: UserAttrs) => new User({ _id: attrs.id, ...attrs });

userSchema.statics.findByEvent = (event: { id: string; version: number; }) => {
    return User.findOne({
        id: event.id,
        version: event.version - 1
    });
};

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };