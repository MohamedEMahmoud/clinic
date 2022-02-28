import { Password } from "../services/Password";
import mongoose from 'mongoose';
import { GenderType, RoleType } from '@clinic-services/common';
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

interface UserAttrs {
    username: string;
    email: string;
    password: string;
    gender: GenderType;
    picture: string;
    role: RoleType;
    age: number;
    macAddress: { MAC: String; }[];
    specialization?: string;
    phone: string;
    activeKey: string;
};

interface UserDoc extends mongoose.Document {
    username: string;
    email: string;
    password: string;
    gender: GenderType;
    picture: string;
    phone: string;
    role: RoleType;
    rate: number;
    age: number;
    specialization: string;
    macAddress: { MAC: String; }[];
    availableDates: string[];
    active: boolean;
    activeKey: string;
    resetPasswordKey: string;
    resetPasswordExpires: string;
    version: number;
    createdAt: string;
    updatedAt: string;
};

interface UserModel extends mongoose.Model<UserDoc> {
    build(attrs: UserAttrs): UserDoc;
}

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        minlength: [8, "Username must be more than 8 characters"],
        max: 20,
        lowercase: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        max: 50,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: [8, "Password must be more than 8 characters"]
    },
    gender: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        enum: Object.values(GenderType),
    },
    picture: {
        type: String,
    },
    role: {
        type: String,
        trim: true,
        enum: Object.values(RoleType),
    },
    age: {
        type: Number,
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
    macAddress: {
        type: Array,
        default: []
    },
    activeKey: {
        type: String,
        trim: true,
        lowercase: true,
    },
    active: {
        type: Boolean,
        default: false
    },
    resetPasswordKey: {
        type: String,
        trim: true,
        lowercase: true,
    },
    resetPasswordExpires: {
        type: String,
    }
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

userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        const hashed = await Password.toHash(this.get('password'));
        this.set('password', hashed);
    };

    next();
});

userSchema.statics.build = (attrs: UserAttrs) => new User(attrs);

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };