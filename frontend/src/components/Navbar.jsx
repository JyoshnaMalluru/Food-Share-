import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import '../styles/Navbar.css';


const Navbar = () => {
    const navigate = useNavigate();
    const [showProfileMenu, setShowProfileMenu] = React.useState(false);
    const {authToken, setAuthToken, userData} = useContext(AppContext);
    
    // Get user data from localStorage if userData is not in context
    const user = userData || (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null);
    
    const logout = () => {
        setAuthToken(false);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setShowProfileMenu(false);
        navigate('/');
    }

    const getDashboardRoute = () => {
        if (!user) return '/';
        switch(user.role) {
            case 'donor': return '/donor-dashboard';
            case 'receiver': return '/receiver-dashboard';
            case 'volunteer': return '/volunteer-dashboard';
            case 'admin': return '/admin';
            default: return '/';
        }
    }

    return (
        <nav className="navbar">
            <h1 onClick={() => navigate('/')} className="navbar-logo">Food Share</h1>
            <div className='navbar-links'>
                {authToken && (
                    <>
                        {user?.role !== 'admin'&& user?.role !== 'volunteer' && (
                            <NavLink className='myposts' to="/myposts">Food Posts</NavLink>
                        )}
                        <NavLink className='myposts' to={getDashboardRoute()}>Dashboard</NavLink>
                    </>
                )}
                
                {authToken ? (
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <button
                            onClick={() => setShowProfileMenu((prev) => !prev)}
                            className="profile-button"
                        >
                            <i className="fa-solid fa-user profile-icon"></i>
                            <span>{user?.name || "User"}</span>
                        </button>
                        {showProfileMenu && (
                            <div className="dropdown-menu show">
                                <button className="dropdown-item" onClick={() => {
                                    setShowProfileMenu(false);
                                    navigate('/profile');
                                }}>
                                    Show Profile
                                </button>
                                <button className="dropdown-item" onClick={() => {
                                    setShowProfileMenu(false);
                                    navigate(getDashboardRoute());
                                }}>
                                    Dashboard
                                </button>
                                <button className="dropdown-item" onClick={logout}>
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{ position: 'relative' }}>
                        <button className='btn create-btn' onClick={() => navigate('/login')}>
                            Create Account
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;