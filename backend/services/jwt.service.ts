import jwt, { type JwtPayload } from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES_IN, JWT_REFRESH_TOKEN_EXPIRES_IN, JWT_ALGORITHM } from "../config";

export interface IGenerateToken {
    email: string;
    name: string;
    roles: string[];
}

interface IVerifyTokenResult {
    isValid: boolean;
    isExpired: boolean;
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

export const isExpiredToken = (exp: number): boolean => {
    const now = Date.now() / 1000;
    return exp < now;
};

export const verifyAccessToken = (token: string): IVerifyTokenResult => {
    try {
        const result = jwt.verify(
            token, 
            JWT_SECRET as string, 
            { algorithms: [JWT_ALGORITHM as jwt.Algorithm] }
        ) as JwtPayload;

        if(!result.exp) {
            return {
                isValid: false,
                isExpired: true,
                result: null,
            };
        }
        
        const isExpired = isExpiredToken(result.exp);
        return {
            isValid: true,
            isExpired: isExpired,
            result: result,
        };
    } catch (error) {
        return {
            isValid: false,
            isExpired: true,
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

        if(!result.exp) {
            return {
                isValid: false,
                isExpired: true,
                result: null,
            };
        }
        
        const isExpired = isExpiredToken(result.exp);
        return {
            isValid: true,
            isExpired: isExpired,
            result: result,
        };
    } catch (error) {
        return {
            isValid: false,
            isExpired: true,
            result: null,
            error: error as Error,
        };
    }
};