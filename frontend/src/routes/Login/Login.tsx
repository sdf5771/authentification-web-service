import { useState } from 'react';
import styles from './Login.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores';
const API_URL = import.meta.env.VITE_API_URL;

function Login() {
    const { setUser, setAccessToken } = useAuthStore();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const handleLogin = async () => {
        const response = await fetch(`${API_URL}/api/v1/signin`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        console.log(data);
        if(data.error !== undefined) {
            alert(data.error);
        } else {
            alert(data.message);
            if(data.accessToken && data.user) {
                setUser({
                    email: data.user.email,
                    name: data.user.name,
                });
                setAccessToken(data.accessToken);
                localStorage.setItem('accessToken', data.accessToken);
                navigate('/');
            } else {
                throw new Error('Login failed');
            }
        }
    }
    return (
        <main className={styles.page_root}>
            <h1>Login</h1>
            <div className={styles.login_form}>
                <input onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" value={email} />
                <input onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" value={password} />
                <button onClick={handleLogin} type="submit">Login</button>
                <span>
                    You don't have an account? <Link to="/signup">You can join us</Link>
                </span>
            </div>
        </main>
    )
}
 
export default Login;