import { serve } from "bun";
import chalk from "chalk";
import { JWT_EXPIRES_IN, JWT_REFRESH_TOKEN_EXPIRES_IN } from "./config";
import { connectDB } from "./db";
import { findUserByEmail, createUser, updateLastLogin, updateUserRefreshToken, updateUserRedisSession, findUserByRefreshToken} from "./services/user.service";
import { hashPassword, comparePassword } from "./utils/password.util";
import { generateAccessToken, generateRefreshToken } from "./services/jwt.service";
import { generateSessionId, saveSession, getSession, deleteSession, type ISessionData } from "./services/redis.service";
import { addTimeToDate, addTimeToMilliseconds, addTimeToSeconds } from "./utils/date.util";
import validateAccessToken from "./middlewares/validateAccessToken.middleware";
import validateRefreshToken from "./middlewares/validateRefreshToken.middleware";
const BACKEND_API_SERVER_LOG_NAME = chalk.blue("[Bun API Server]:");

console.log(BACKEND_API_SERVER_LOG_NAME, chalk.green("Try Serving API Server..."));

const CORS_HEADERS = {
    headers: {
        "Access-Control-Allow-Origin": "http://localhost:5173",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": "true",
    },
};

const startServer = async () => {
    try {
        await connectDB();

        serve({
            port: 4000,
            routes: {
                "/api/v1/healthcheck": (req, res) => {
                    if(req.method === "OPTIONS") {
                        return new Response(null, { status: 204, headers: CORS_HEADERS.headers });
                    }
                    if(req.method === "GET"){
                        console.log(BACKEND_API_SERVER_LOG_NAME, chalk.green("Healthcheck passed"));
                        const authResult = validateAccessToken(req);
                        console.log('authResult: ', authResult);
                        if(authResult.isSuccess) {
                            return new Response(JSON.stringify({
                                message: "OK",
                            }), { status: 200, headers: CORS_HEADERS.headers });
                        } else {
                            return new Response(authResult.responseBody.message, { status: authResult.responseBody.status, headers: CORS_HEADERS.headers });
                        }
                    } else {
                        const responseBody = JSON.stringify({
                            error: "Method not allowed"
                        });
                        const responseInit = {
                            status: 405,
                            headers: {
                                "Content-Type": "application/json",
                                ...CORS_HEADERS.headers
                            }
                        };
                        return new Response(responseBody, responseInit);
                    }
                },
                "/api/v1/signup": async (req, res) => {
                    if(req.method === "OPTIONS") {
                        return new Response(null, { status: 204, headers: CORS_HEADERS.headers });
                    }

                    if(req.method === "POST") {
                        interface ISignupRequest {
                            email: string;
                            password: string;
                            name: string;
                        }
            
                        const { email, password, name } = await req.json() as ISignupRequest;
    
                        /**
                         * Email and password are required
                         */
                        if (!email || !password) {
                            const responseBody = JSON.stringify({
                                error: "Email and password are required"
                            });
                            const responseInit = {
                                status: 400,
                                headers: {
                                    "Content-Type": "application/json",
                                    ...CORS_HEADERS.headers
                                }
                            };
            
                            console.log(BACKEND_API_SERVER_LOG_NAME, chalk.red("Signup failed: Email and password are required"));
            
                            return new Response(responseBody, responseInit);
                        }
            
                        /**
                         * Email must be valid
                         */
                        if(!email.includes("@")) {
                            const responseBody = JSON.stringify({
                                error: "Invalid email"
                            });
                            const responseInit = {
                                status: 400,
                                headers: {
                                    "Content-Type": "application/json",
                                    ...CORS_HEADERS.headers
                                }
                            };
            
                            console.log(BACKEND_API_SERVER_LOG_NAME, chalk.red("Signup failed: Invalid email"));
            
                            return new Response(responseBody, responseInit);
                        }
            
                        /**
                         * Password must be at least 8 characters long
                         */
                        if(password.length < 8) {
                            const responseBody = JSON.stringify({
                                error: "Password must be at least 8 characters long"
                            });
                            const responseInit = {
                                status: 400,
                                headers: {
                                    "Content-Type": "application/json",
                                    ...CORS_HEADERS.headers
                                }
                            };
            
                            console.log(BACKEND_API_SERVER_LOG_NAME, chalk.red("Signup failed: Password must be at least 8 characters long"));
            
                            return new Response(responseBody, responseInit);
                        }
            
                        const user = await findUserByEmail(email);
                        console.log("user ", user);
            
                        if(user) {
                            const responseBody = JSON.stringify({
                                error: "User already exists"
                            });
                            const responseInit = {
                                status: 400,
                                headers: {
                                    "Content-Type": "application/json",
                                    ...CORS_HEADERS.headers
                                }
                            };
            
                            console.log(BACKEND_API_SERVER_LOG_NAME, chalk.red("Signup failed: User already exists"));
            
                            return new Response(responseBody, responseInit);
                        }
            
                        const newUser = await createUser({
                            email,
                            password: password,
                            name,
                        });
            
            
                        console.log(BACKEND_API_SERVER_LOG_NAME, chalk.green("Signup successful"), newUser);
                        return new Response(JSON.stringify({
                            message: "User created successfully"
                        }), {
                            status: 201,
                            headers: {
                                "Content-Type": "application/json",
                                ...CORS_HEADERS.headers
                            }
                        });
                    } else {
                        const responseBody = JSON.stringify({
                            error: "Method not allowed"
                        });
                        const responseInit = {
                            status: 405,
                            headers: {
                                "Content-Type": "application/json",
                                ...CORS_HEADERS.headers
                            }
                        };
        
                        console.log(BACKEND_API_SERVER_LOG_NAME, chalk.red("Signup failed: Method not allowed"));
        
                        return new Response(responseBody, responseInit);
                    }
                },
                "/api/v1/signin": async (req, res) => {
                    if(req.method === "OPTIONS") {
                        return new Response(null, { status: 204, headers: {
                            ...CORS_HEADERS.headers
                        } });
                    }

                    if(req.method === "POST") {
                        console.time("Signin Logic Time");
                    interface ISigninRequest {
                        email: string;
                        password: string;
                    }
        
                    const { email, password } = await req.json() as ISigninRequest;
                    
                    /**
                     * Email and password are required
                     */
                    if (!email || !password) {
                        const responseBody = JSON.stringify({
                            error: "Email and password are required"
                        });
                        const responseInit = {
                            status: 400,
                            headers: {
                                "Content-Type": "application/json",
                                ...CORS_HEADERS.headers
                            }
                        };
        
                        console.log(BACKEND_API_SERVER_LOG_NAME, chalk.red("Signin failed: Email and password are required"));
        
                        return new Response(responseBody, responseInit);
                    }
        
                    /**
                     * Find user by email
                     */
                    const user = await findUserByEmail(email);
        
                    if(!user) {
                        const responseBody = JSON.stringify({
                            error: "User not found"
                        });
                        const responseInit = {
                            status: 400,
                            headers: {
                                "Content-Type": "application/json",
                                ...CORS_HEADERS.headers
                            }
                        };
        
                        console.log(BACKEND_API_SERVER_LOG_NAME, chalk.red("Signin failed: User not found"));
        
                        return new Response(responseBody, responseInit);
                    }

                    /**
                     * Compare password
                     */
                    const isPasswordValid = await comparePassword(password, user.password);
                    
                    if(!isPasswordValid) {
                        const responseBody = JSON.stringify({
                            error: "Invalid password"
                        });
                        const responseInit = {
                            status: 400,
                            headers: {
                                "Content-Type": "application/json",
                                ...CORS_HEADERS.headers
                            }
                        };
        
                        console.log(BACKEND_API_SERVER_LOG_NAME, chalk.red("Signin failed: Invalid password"));
        
                        return new Response(responseBody, responseInit);
                    }
        
                    /**
                     * Generate access token and refresh token
                     */
                    const accessToken = generateAccessToken({
                        email: user.email,
                        name: user.name,
                        roles: user.roles,
                    });
        
                    const refreshToken = generateRefreshToken({
                        email: user.email,
                        name: user.name,
                        roles: user.roles,
                    });
                    
                    const refreshTokenCookie = `refreshToken=${refreshToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${JWT_REFRESH_TOKEN_EXPIRES_IN}`;
        
                    /**
                     * Update user refresh token
                     */
                    if(refreshToken) {
                        try {
                            await updateUserRefreshToken(user.email, refreshToken);
                        } catch (error) {
                            console.log(BACKEND_API_SERVER_LOG_NAME, chalk.red("Signin failed: Failed to update user refresh token"));
                        }
                    }
        
                    /**
                     * Update last login
                     */
                    if(accessToken && refreshToken) {
                        try {
                            await updateLastLogin(user.email);
                        } catch (error) {
                            console.log(BACKEND_API_SERVER_LOG_NAME, chalk.red("Signin failed: Failed to update last login"));
                        }
                    }

                    /**
                     * Generate session id
                     */

                    const sessionId = generateSessionId();

                    /**
                     * Save session
                     */

                    const sessionData: ISessionData = {
                        sessionId,
                        email: user.email,
                        name: user.name,
                        roles: user.roles,
                        accessToken,
                        accessTokenExpiresAt: addTimeToDate(new Date(), JWT_EXPIRES_IN),
                    }
                    await saveSession(sessionId, sessionData, addTimeToSeconds(JWT_REFRESH_TOKEN_EXPIRES_IN));
                    const newSession = await getSession(sessionId);
                    if(!newSession) {
                        console.log(BACKEND_API_SERVER_LOG_NAME, chalk.red("Signin failed: Failed to save session"));
                    } else {
                        console.log(BACKEND_API_SERVER_LOG_NAME, chalk.green("Signin successful: Session saved"));

                        /**
                         * Update user redisSession
                         */
                        try {
                            await updateUserRedisSession(user.email, sessionId);
                        } catch (error) {
                            console.log(BACKEND_API_SERVER_LOG_NAME, chalk.red("Signin failed: Failed to update user redis session"));
                        }
                    }

        
                    /**
                     * Return response
                     */
                    console.log(BACKEND_API_SERVER_LOG_NAME, chalk.green("Signin successful"));
                    console.timeEnd("Signin Logic Time");
                    return new Response(JSON.stringify({
                        message: "Signin successful",
                        user,
                        accessToken,
                    }), {
                        status: 200,
                        headers: {
                            "Content-Type": "application/json",
                            "Set-Cookie": refreshTokenCookie,
                            ...CORS_HEADERS.headers
                        }
                    });
                    } else {
                        const responseBody = JSON.stringify({
                            error: "Method not allowed"
                        });
                        const responseInit = {
                            status: 405,
                            headers: {
                                "Content-Type": "application/json",
                                ...CORS_HEADERS.headers
                            }
                        };
                        return new Response(responseBody, responseInit);
                    }
                },
                "/api/v1/refresh-token": async (req, res) => {
                    if(req.method === "OPTIONS") {
                        return new Response(null, { status: 204, headers: CORS_HEADERS.headers });
                    }

                    if(req.method === "POST") {
                        const refreshToken = req.cookies.get("refreshToken");

                    if(!refreshToken) {
                        const responseBody = JSON.stringify({
                            error: "Refresh token not found"
                        });

                        const responseInit = {
                            status: 400,
                            headers: {
                                "Content-Type": "application/json",
                                ...CORS_HEADERS.headers
                            }
                        };
                        return new Response(responseBody, responseInit);
                    }
                    
                    const user = await findUserByRefreshToken(refreshToken);

                    if(!user) {
                        const responseBody = JSON.stringify({
                            error: "User not found"
                        });
                        const responseInit = {
                            status: 400,
                            headers: {
                                "Content-Type": "application/json",
                                ...CORS_HEADERS.headers
                            }
                        };
                        return new Response(responseBody, responseInit);
                    }

                    /**
                     * Validate refresh token
                     */
                    const refreshTokenValidationResult = validateRefreshToken(req);

                    if(!refreshTokenValidationResult.isSuccess) {
                        return new Response(refreshTokenValidationResult.responseBody.message, { status: refreshTokenValidationResult.responseBody.status });
                    }

                    /**
                     * Generate AccessToken
                     */
                    const accessToken = generateAccessToken({
                        email: user.email,
                        name: user.name,
                        roles: user.roles,
                    });

                    /**
                     * Check if session is alived and update current session
                     */
                    const sessionId = user.redisSession?.id;
                    if(sessionId) {
                        const session = await getSession(sessionId);
                        if(!session) {
                            /**
                             * Save new session
                             */
                            const newSessionId = generateSessionId();
                            
                            try {
                                const sessionData: ISessionData = {
                                    sessionId: newSessionId,
                                    email: user.email,
                                    name: user.name,
                                    roles: user.roles,
                                    accessToken,
                                    accessTokenExpiresAt: addTimeToDate(new Date(), JWT_EXPIRES_IN),
                                }
                                await saveSession(newSessionId, sessionData, addTimeToSeconds(JWT_REFRESH_TOKEN_EXPIRES_IN));
                                await updateUserRedisSession(user.email, newSessionId);
                                console.log(BACKEND_API_SERVER_LOG_NAME, chalk.green("Refresh token successful: Session saved"));
                            } catch (error) {
                                console.log(BACKEND_API_SERVER_LOG_NAME, chalk.red("Refresh token failed: Failed to save session"));
                                return new Response(JSON.stringify({
                                    error: "Failed to save session"
                                }), {
                                    status: 500,
                                    headers: {
                                        "Content-Type": "application/json",
                                        ...CORS_HEADERS.headers
                                    }
                                });
                            }
                        } else {
                            /**
                             * Update Current Session
                             */
                            try {
                                const sessionData: ISessionData = {
                                    sessionId: sessionId,
                                    email: user.email,
                                    name: user.name,
                                    roles: user.roles,
                                    accessToken,
                                    accessTokenExpiresAt: addTimeToDate(new Date(), JWT_EXPIRES_IN),
                                }
                                await saveSession(sessionId, sessionData, addTimeToSeconds(JWT_REFRESH_TOKEN_EXPIRES_IN));
                                console.log(BACKEND_API_SERVER_LOG_NAME, chalk.green("Refresh token successful: Session saved"));
                            } catch (error) {
                                console.log(BACKEND_API_SERVER_LOG_NAME, chalk.red("Refresh token failed: Failed to save session"));
                                return new Response(JSON.stringify({
                                    error: "Failed to save session"
                                }), {
                                    status: 500,
                                    headers: {
                                        "Content-Type": "application/json",
                                        ...CORS_HEADERS.headers
                                    }
                                });
                            }
                        }
                    } 

                    return new Response(JSON.stringify({
                        message: "Refresh token successful",
                        accessToken,
                        user,
                    }), {
                        status: 200,
                        headers: {
                            "Content-Type": "application/json",
                            ...CORS_HEADERS.headers
                        }
                    });
                    } else {
                        const responseBody = JSON.stringify({
                            error: "Method not allowed"
                        });
                        const responseInit = {
                            status: 405,
                            headers: {
                                "Content-Type": "application/json",
                                ...CORS_HEADERS.headers
                            }
                        };
                        
                        console.log(BACKEND_API_SERVER_LOG_NAME, chalk.red("Refresh token failed: Method not allowed"));

                        return new Response(responseBody, responseInit);
                    }
                },
            }
        });
    } catch (error) {
        console.error(BACKEND_API_SERVER_LOG_NAME, chalk.red("Failed to connect to MongoDB"), error);
        process.exit(1);
    }
}
startServer();

console.log(BACKEND_API_SERVER_LOG_NAME, chalk.green("Bun API Server Started on port 4000"));