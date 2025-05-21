import { useEffect } from 'react';
import styles from './Home.module.css';
import { useAuthStore } from '../../stores';
import { useNavigate } from 'react-router-dom';
const API_URL = import.meta.env.VITE_API_URL;

function Home() {
    const navigate = useNavigate();
    const { user, accessToken, setUser, setAccessToken, clearAuth } = useAuthStore();

    const fetchingHealthcheck = async () => {
        const response = await fetch(`${API_URL}/api/v1/healthcheck`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        if(response.status === 200) {
            const data = await response.json();
            setUser(data.user);
            setAccessToken(data.accessToken);
        } else {
            clearAuth();
            navigate('/login');
        }
    }

    useEffect(() => {
        if(!user || !accessToken) {
            navigate('/login');
            return
        }

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