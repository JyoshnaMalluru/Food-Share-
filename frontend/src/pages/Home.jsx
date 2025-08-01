import React from 'react';
import Header from '../components/Header';
import '../styles/Home.css';

const Home = () => {
    return (
        <div className="home-container">
            <Header />
            <section className="features-section">
                <div className="container">
                    <h2>How Food Share Works</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <h3>Donate Food</h3>
                            <p>Share your excess food with those in need. Upload details about the food you want to donate.</p>
                        </div>
                        <div className="feature-card">
                            <h3>Request Food</h3>
                            <p>Browse available food donations and request what you need for yourself or your organization.</p>
                        </div>
                        <div className="feature-card">
                            <h3>Connect & Help</h3>
                            <p>Build a community of givers and receivers working together to reduce food waste.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;