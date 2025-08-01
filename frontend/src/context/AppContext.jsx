import {createContext} from 'react';
import axios from 'axios'
import { toast } from "react-toastify";
import { useState, useEffect } from 'react';

export const AppContext = createContext();

const AppContextProvider = (props) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [authToken, setAuthToken] = useState(localStorage.getItem('authToken') || '');
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUserData(JSON.parse(storedUser));
        }
    }, []);

    const value = {
        backendUrl,
        authToken,
        setAuthToken,
        userData,
        setUserData
    };
    
    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};

export default AppContextProvider;