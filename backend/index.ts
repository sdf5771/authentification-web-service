import { serve } from "bun";
import chalk from "chalk";
import { JWT_EXPIRES_IN, JWT_REFRESH_TOKEN_EXPIRES_IN } from "./config";
import { connectDB } from "./db";
import { findUserByEmail, createUser, updateLastLogin, updateUserRefreshToken } from "./services/user.service";
import { hashPassword, comparePassword } from "./utils/password.util";
import { generateAccessToken, generateRefreshToken } from "./services/jwt.service";

const BACKEND_API_SERVER_LOG_NAME = chalk.blue("[Bun API Server]:");

console.log(BACKEND_API_SERVER_LOG_NAME, chalk.green("Try Serving API Server..."));

const startServer = async () => {
    try {
        await connectDB();

        serve({
            port: 4000,
            routes: {
                "/api/v1/healthcheck": (req, res) => {
                    console.log(BACKEND_API_SERVER_LOG_NAME, chalk.green("Healthcheck passed"));
                    return new Response("OK");
                },
                "/api/v1/signup": async (req, res) => {
                    if(req.method !== "POST") {
                        const responseBody = JSON.stringify({
                            error: "Method not allowed"
                        });
                        const responseInit = {
                            status: 405,
                            headers: {
                                "Content-Type": "application/json"
                            }
                        };
        
                        console.log(BACKEND_API_SERVER_LOG_NAME, chalk.red("Signup failed: Method not allowed"));
        
                        return new Response(responseBody, responseInit);
                    }
        
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
                                "Content-Type": "application/json"
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
                                "Content-Type": "application/json"
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
                                "Content-Type": "application/json"
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
                                "Content-Type": "application/json"
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
                            "Content-Type": "application/json"
                        }
                    });
                },
                "/api/v1/signin": async (req, res) => {
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
                                "Content-Type": "application/json"
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
                                "Content-Type": "application/json"
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
                                "Content-Type": "application/json"
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
                     * Return response
                     */
                    console.log(BACKEND_API_SERVER_LOG_NAME, chalk.green("Signin successful"));
        
                    return new Response(JSON.stringify({
                        message: "Signin successful",
                        user,
                        accessToken,
                    }), {
                        status: 200,
                        headers: {
                            "Content-Type": "application/json",
                            "Set-Cookie": refreshTokenCookie
                        }
                    });
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