import { useEffect } from 'react';
import styles from './Home.module.css';
import { useAuthStore } from '../../stores';
import { useNavigate } from 'react-router-dom';
const API_URL = import.meta.env.VITE_API_URL;

function Home() {
    const navigate = useNavigate();
    const { user, accessToken, setUser, setAccessToken, clearAuth } = useAuthStore();

    const fetchingRefreshToken = async () => {
        const response = await fetch(`${API_URL}/api/v1/refresh-token`, {
            method: 'POST',
            credentials: 'include'
        });
        console.log(response);
        if(response.status === 200) {
            const data = await response.json();
            setUser(data.user);
            console.log('data.accessToken: ', data.accessToken);
            setAccessToken(data.accessToken);
        } else {
            navigate('/login');
        }
    }

    const fetchingHealthcheck = async () => {
        const response = await fetch(`${API_URL}/api/v1/healthcheck`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        console.log(response);
        if(response.status !== 200) {
            clearAuth();
            await fetchingRefreshToken();
        }
    }

    useEffect(() => {
        fetchingHealthcheck();

    }, [user, accessToken]);
    
    return (
        <main className={styles.page_root}>
            <h1>Home</h1>
            <h2>You are logged in</h2>

        </main>
    )
}

export default Home;