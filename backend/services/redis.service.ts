import Redis from "ioredis";
import { REDIS_URI } from "../config";
import crypto from 'crypto';

export const generateSessionId = (): string => {
  return crypto.randomUUID();
};

const redis = new Redis(REDIS_URI);

export const saveSession = async (sessionId: string, email: string, expiresAt: number) => {
    try {
        await redis.set(sessionId, email, "EX", expiresAt);
    } catch (error) {
        throw new Error("Failed to save session");
    }
};

export const getSession = async (sessionId: string) => {
    try {
        return await redis.get(sessionId);
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