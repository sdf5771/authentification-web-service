import { serve } from "bun";
import chalk from "chalk";


const BACKEND_API_SERVER_LOG_NAME = chalk.blue("[Bun API Server]:");

console.log(BACKEND_API_SERVER_LOG_NAME, chalk.green("Try Serving API Server..."));

serve({
    port: 4000,
    routes: {
        "/api/v1/healthcheck": (req, res) => {
            console.log(BACKEND_API_SERVER_LOG_NAME, chalk.green("Healthcheck passed"));
            return new Response("OK");
        },
        "/api/v1/signup": async (req, res) => {
            interface ISignupRequest {
                email: string;
                password: string;
            }
            
            const { email, password } = await req.json() as ISignupRequest;
            
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

            /**
             * TODO:
             * 1. Check if user already exists
             * 2. Hash password
             * 3. Create user
             * 4. Return user
             */
            console.log(BACKEND_API_SERVER_LOG_NAME, chalk.green("Signup successful"));
            return new Response(JSON.stringify({
                message: "User created successfully"
            }), {
                status: 201,
                headers: {
                    "Content-Type": "application/json"
                }
            });
        },
    }
});

console.log(BACKEND_API_SERVER_LOG_NAME, chalk.green("Bun API Server Started on port 4000"));