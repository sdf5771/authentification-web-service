import jwt, { type JwtPayload } from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES_IN, JWT_REFRESH_TOKEN_EXPIRES_IN, JWT_ALGORITHM } from "../config";

export interface IGenerateToken {
    email: string;
    name: string;
    roles: string[];
}

interface IVerifyTokenResult {
    isValid: boolean;
    result: JwtPayload | null;
    error?: Error | null;
}

export const generateAccessToken = (payload: IGenerateToken) => {
    return jwt.sign(
        payload, 
        JWT_SECRET as jwt.Secret, 
        { 
            expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"], 
            algorithm: JWT_ALGORITHM as jwt.Algorithm 
        }
    );
};

export const generateRefreshToken = (payload: IGenerateToken) => {
    return jwt.sign(
        payload, 
        JWT_SECRET as jwt.Secret, 
        { 
            expiresIn: JWT_REFRESH_TOKEN_EXPIRES_IN as jwt.SignOptions["expiresIn"], 
            algorithm: JWT_ALGORITHM as jwt.Algorithm 
        }
    );
};

export const verifyAccessToken = (token: string): IVerifyTokenResult => {
    try {
        const result = jwt.verify(
            token, 
            JWT_SECRET as string, 
            { algorithms: [JWT_ALGORITHM as jwt.Algorithm] }
        ) as JwtPayload;

        return {
            isValid: true,
            result: result,
        };
    } catch (error) {
        return {
            isValid: false,
            result: null,
            error: error as Error,
        };
    }
};

export const verifyRefreshToken = (token: string): IVerifyTokenResult => {
    try {
        const result = jwt.verify(
            token, 
            JWT_SECRET as string, 
            { algorithms: [JWT_ALGORITHM as jwt.Algorithm] }
        ) as JwtPayload;

        return {
            isValid: true,
            result: result,
        };
    } catch (error) {
        return {
            isValid: false,
            result: null,
            error: error as Error,
        };
    }
};