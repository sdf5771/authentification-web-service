import Redis from "ioredis";
import { REDIS_URI } from "../config";
import crypto from 'crypto';

export const generateSessionId = (): string => {
  return crypto.randomUUID();
};

const redis = new Redis(REDIS_URI);

export interface ISessionData {
    sessionId: string;
    email: string;
    name: string;
    roles: string[];
    accessToken: string;
    accessTokenExpiresAt: Date;
}

export const saveSession = async (sessionId: string, data: ISessionData, expiresAt: number) => {
    try {
        await redis.set(sessionId, JSON.stringify(data), "EX", expiresAt);
    } catch (error) {
        throw new Error("Failed to save session");
    }
};

export const getSession = async (sessionId: string) => {
    try {
        const session = await redis.get(sessionId);
        if(!session) {
            return null;
        }
        return JSON.parse(session);
    } catch (error) {
        throw new Error("Failed to get session");
    }
}

export const deleteSession = async (sessionId: string) => {
    try {
        await redis.del(sessionId);
    } catch (error) {
        throw new Error("Failed to delete session");
    }
}