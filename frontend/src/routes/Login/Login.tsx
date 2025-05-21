import { useState } from 'react';
import styles from './Login.module.css';
import { Link } from 'react-router-dom';
function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    return (
        <main className={styles.page_root}>
            <h1>Login</h1>
            <div className={styles.login_form}>
                <input onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" value={email} />
                <input onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" value={password} />
                <button type="submit">Login</button>
                <span>
                    You don't have an account? <Link to="/signup">You can join us</Link>
                </span>
            </div>
        </main>
    )
}
 
export default Login;