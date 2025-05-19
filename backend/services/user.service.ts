import { User, type IUser } from "../models";
import { hashPassword, comparePassword } from "../utils/password.util";

export const createUser = async (user: {
        email: string;
        password: string;
        name: string;
        roles?: string[];
        isEmailVerified?: boolean;
    }) => {
    try {
        const hashedPassword = await hashPassword(user.password);
        const newUser = new User({
            email: user.email,
            password: hashedPassword,
            name: user.name,
            createdAt: new Date(),
            updatedAt: new Date(),
            isActive: true,
            isEmailVerified: false,
            verificationToken: null,
            verificationTokenExpires: null,
            roles: user.roles || ["user"],
        });

        const result = await newUser.save();

        return result;
    } catch (error) {
        throw new Error("Failed to create user");
    }
};

export const findUserByEmail = async (email: string) => {
    try {
        return await User.findOne({ email });
    } catch (error) {
        throw new Error("Failed to find user by email");
    }
};

export const updateLastLogin = async (email: string) => {
    try {
        return await User.findOneAndUpdate({ email }, { lastLogin: new Date() }, { new: true });
    } catch (error) {
        throw new Error("Failed to update last login");
    }
};