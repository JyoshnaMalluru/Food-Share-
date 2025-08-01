import React, { useEffect, useState, useContext } from 'react';
import '../styles/Login.css';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const Login = () => {
    const { backendUrl, authToken, setAuthToken, setUserData } = useContext(AppContext);
    const [type, setType] = useState("donor");
    const [state, setState] = useState("Sign Up");
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [phone, setPhone] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (state === 'Sign Up') {
                const res = await axios.post(`${backendUrl}/api/users/register`, {
                    name,
                    email,
                    password,
                    role: type,
                    location,
                    phone
                });
                
                if (res.data && res.data.success && res.data.token) {
                    localStorage.setItem('authToken', res.data.token);
                    setAuthToken(res.data.token);
                    localStorage.setItem('user', JSON.stringify(res.data.user));
                    setUserData(res.data.user);
                    toast.success('Registered successfully!');
                    navigate('/');
                } else {
                    toast.error(res.data?.message || 'Registration failed');
                }
            } else {
                const res = await axios.post(`${backendUrl}/api/users/login`, {
                    email,
                    password,
                    role: type
                });
                
                if (res.data && res.data.success && res.data.token) {
                    localStorage.setItem('authToken', res.data.token);
                    localStorage.setItem('user', JSON.stringify(res.data.user));
                    setAuthToken(res.data.token);
                    setUserData(res.data.user);
                    toast.success('Login successful!');
                    navigate('/');
                } else {
                    toast.error(res.data?.message || 'Login failed');
                }
            }
        } catch (error) {
            if (state === 'Sign Up') {
                toast.error(error.response?.data?.message ||
                    error.message ||
                    'Error occurred in registration.');
            } else {
                toast.error(error.response?.data?.message ||
                    error.message ||
                    'Error occurred in login.');
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className={`form ${state === 'Sign Up' ? 'signup-form' : 'login-form'}`}>
            <div className='form-model'>
                <p className='form-head'>{state === "Sign Up" ? "Create Account" : "Login"}</p>
                <p>Please {state === "Sign Up" ? "sign up" : "log in"} to continue</p>
                <div className='form-h'>
                    <p>Role</p>
                    <select className='form-input' value={type} onChange={e => setType(e.target.value)}>
                        <option value="donor">Donor</option>
                        <option value="receiver">Receiver</option>
                        <option value="volunteer">Volunteer</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                {state === 'Sign Up' ? (
                    <div className="form-columns">
                        <div>
                            <div className='form-h'>
                                <p>Full Name</p>
                                <input className='form-input' type='text' onChange={e => setName(e.target.value)} value={name} required />
                            </div>
                            <div className='form-h'>
                                <p>Email</p>
                                <input className='form-input' type='email' onChange={e => setEmail(e.target.value)} value={email} required />
                            </div>
                            <div className='form-h'>
                                <p>Password</p>
                                <input className='form-input' type='password' onChange={e => setPassword(e.target.value)} value={password} required />
                            </div>
                        </div>
                        <div>
                            <div className='form-h'>
                                <p>Location</p>
                                <input className='form-input' type='text' onChange={e => setLocation(e.target.value)} value={location} required />
                            </div>
                            <div className='form-h'>
                                <p>Phone</p>
                                <input className='form-input' type='text' onChange={e => setPhone(e.target.value)} value={phone} required />
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className='form-h'>
                            <p>Email</p>
                            <input className='form-input' type='email' onChange={e => setEmail(e.target.value)} value={email} required />
                        </div>
                        <div className='form-h'>
                            <p>Password</p>
                            <input className='form-input' type='password' onChange={e => setPassword(e.target.value)} value={password} required />
                        </div>
                    </>
                )}
                <button type='submit' className='form-btn'>{state === "Sign Up" ? "Create Account" : "Login"}</button>
                {state === "Sign Up"
                    ? <p>Already have an account? <span onClick={() => setState('Login')} className='form-end'>Login here</span></p>
                    : <p>Create a new account? <span onClick={() => setState('Sign Up')} className='form-end'>Click here</span></p>
                }
            </div>
        </form>
    );
};

export default Login;