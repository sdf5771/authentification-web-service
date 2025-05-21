import { useEffect } from 'react';
import styles from './Home.module.css';
import { useAuthStore } from '../../stores';
import { useNavigate } from 'react-router-dom';
const API_URL = import.meta.env.VITE_API_URL;

const getAccessToken = () => {
    return localStorage.getItem('accessToken');
}

function Home() {
    const navigate = useNavigate();
    const { user, setUser, setAccessToken } = useAuthStore();
    const fetchingRefreshToken = async () => {
        const response = await fetch(`${API_URL}/api/v1/refresh-token`, {
            method: 'POST',
            credentials: 'include'
        });
        if(response.status === 200) {
            const data = await response.json();
            console.log('data: ', data);
            setUser({
                email: data.user.email,
                name: data.user.name,
            });
            setAccessToken(data.accessToken);
            localStorage.setItem('accessToken', data.accessToken);
        } else {
            navigate('/login');
        }
    }

    const fetchingHealthcheck = async (accessToken: string) => {
        const response = await fetch(`${API_URL}/api/v1/healthcheck`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        const data = await response.json();
        console.log('data: ', data);
        if(response.status !== 200) {
            await fetchingRefreshToken();
        }
    }

    useEffect(() => {
        const checkAuth = async () => {
            const accessToken = getAccessToken();
            if(accessToken){
                await fetchingHealthcheck(accessToken);
            } else {
                await fetchingRefreshToken();
            }
        }

        checkAuth();
    }, []);
    
    return (
        <main className={styles.page_root}>
            <h1>Home</h1>
            <h2>You are logged in</h2>
            <span>User: {user?.email}</span>
        </main>
    )
}

export default Home;