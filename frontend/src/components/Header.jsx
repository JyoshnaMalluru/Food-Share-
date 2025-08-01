import React from 'react';
import {useNavigate } from 'react-router-dom';
import '../styles/Header.css';
import foodDonationImg from '../assets/food_donation.webp';
import foodReceivingImg from '../assets/food_receiver.webp';


const Header = () => {
  const navigate = useNavigate();
  return (
    <>
    <header className="main-header">
      <div className="header-content">
        <h1>To a hungry person, every bite is a blessing. Be the reason someone doesn't go to bed hungry.</h1>
        <button onClick={() => navigate('/donate')} className="donate-button">Donate Food</button>
      </div>
      <div className='header-image'>
        <img src={foodDonationImg} className='donate-img' alt="food donation" />
      </div>
    </header>
    <header className="main-header">
      <div className='header-image'>
        <img src={foodReceivingImg} className='donate-img' alt="food donation" />
      </div>
      <div className="header-content">
        <h1>We are not asking for riches. We are asking for food.</h1>
        <button onClick={() => navigate('/available')} className="donate-button">Find Food</button>
      </div>
    </header>
    </>
  );
};

export default Header;