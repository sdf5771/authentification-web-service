import { User } from "../models";
import { hashPassword } from "../utils/password.util";
import { JWT_REFRESH_TOKEN_EXPIRES_IN } from "../config";
import { addTimeToDate } from "../utils/date.util";

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
    return await User.findOne({ email });
};

export const updateLastLogin = async (email: string) => {
    try {
        return await User.findOneAndUpdate({ email }, { lastLogin: new Date() });
    } catch (error) {
        throw new Error("Failed to update last login");
    }
};

export const updateUserRefreshToken = async (email: string, refreshToken: string) => {
    try {
        return await User.findOneAndUpdate(
            { email }, 
            { 
                verificationToken: refreshToken, 
                verificationTokenExpires: addTimeToDate(new Date(), JWT_REFRESH_TOKEN_EXPIRES_IN) 
            }
        );
    } catch (error) {
        throw new Error("Failed to update user refresh token");
    }
};

export const updateUserRedisSession = async (email: string, sessionId: string) => {
    try {
        return await User.findOneAndUpdate(
            { email },
            { redisSession: { id: sessionId, expiresAt: addTimeToDate(new Date(), JWT_REFRESH_TOKEN_EXPIRES_IN) } }
        );
    } catch (error) {
        throw new Error("Failed to update user redis session");
    }
}

export const findUserByRefreshToken = async (refreshToken: string) => {
    return await User.findOne({ "verificationToken": refreshToken });
}