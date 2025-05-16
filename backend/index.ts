import { serve } from "bun";

console.log("Bun API Server Starting...");
serve({
    port: 4000,
    routes: {
        "/api/v1/healthcheck": (req, res) => {
            return new Response("OK");
        },
        "/api/v1/signup": async (req, res) => {
            const { email, password } = await req.json();
            
            /**
             * Email and password are required
             */
            if (!email || !password) {
                return new Response(JSON.stringify({
                    error: "Email and password are required"
                }), {
                    status: 400,
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
            }

            /**
             * Email must be valid
             */
            if(!email.includes("@")) {
                return new Response(JSON.stringify({
                    error: "Invalid email"
                }), {
                    status: 400,
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
            }

            /**
             * Password must be at least 8 characters long
             */
            if(password.length < 8) {
                return new Response(JSON.stringify({
                    error: "Password must be at least 8 characters long"
                }), {
                    status: 400,
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
            }

            /**
             * TODO:
             * 1. Check if user already exists
             * 2. Hash password
             * 3. Create user
             * 4. Return user
             */
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

console.log("Bun API Server Started on port 4000");