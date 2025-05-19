import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES_IN, JWT_REFRESH_TOKEN_EXPIRES_IN, JWT_ALGORITHM } from "../config";

export interface IGenerateToken {
    email: string;
    name: string;
    roles: string[];
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

export const verifyAccessToken = (token: string) => {
    return jwt.verify(
        token, 
        JWT_SECRET as string, 
        { 
            algorithms: [JWT_ALGORITHM as jwt.Algorithm] 
        }
    );
};

export const verifyRefreshToken = (token: string) => {
    return jwt.verify(
        token, 
        JWT_SECRET as string, 
        { algorithms: [JWT_ALGORITHM as jwt.Algorithm] 

        }
    );
};