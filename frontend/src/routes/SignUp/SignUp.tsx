import styles from './SignUp.module.css';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

function SignUp() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if(password !== passwordConfirm) {
            alert('Password and Password Confirm are not the same');
            return;
        }
        try {
            const response = await fetch(`${API_URL}/api/v1/signup`, {
                method: 'POST',
                body: JSON.stringify({ name, email, password }),
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            const data = await response.json();
            console.log(data);
        } catch (error) {
            console.error(error);
            if(error instanceof Error) {
                alert(error.message);
            } else {
                alert('Sign up failed');
            }
        }
    }

    return (
        <main className={styles.page_root}>
            <h1>SignUp</h1>
            <form className={styles.signup_form} onSubmit={handleSubmit}>
                <input 
                    onChange={(e) => setName(e.target.value)} 
                    type="text" 
                    placeholder="Name" 
                    required 
                    value={name}
                />
                <input 
                    onChange={(e) => setEmail(e.target.value)} 
                    type="email" 
                    placeholder="Email" 
                    required 
                    value={email}
                />
                <input 
                    onChange={(e) => setPassword(e.target.value)} 
                    type="password" 
                    placeholder="Password" 
                    required 
                    value={password}
                />
                <input 
                    onChange={(e) => setPasswordConfirm(e.target.value)} 
                    type="password" 
                    placeholder="Password Confirm" 
                    required 
                    value={passwordConfirm}
                />
                <button
                    disabled={!name || !email || !password || !passwordConfirm} 
                    type="submit">Sign Up</button>
                <span>
                    You already have an account? <Link to="/login">You can login</Link>
                </span>
            </form>
        </main>
    )
}

export default SignUp;