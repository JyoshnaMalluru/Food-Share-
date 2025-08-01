import React from 'react';

const FoodCard = ({ food, onRequest }) => {
  return (
    <div className="food-card">
      <img src={food.imageUrl} alt={food.foodName} className="food-image" />
      <div className="food-details">
        <h3>{food.foodName}</h3>
        <p><strong>City:</strong> {food.city}</p>
        <p><strong>Description:</strong> {food.description}</p>
        <p><strong>Available Till:</strong> {new Date(food.expiryTime).toLocaleString()}</p>
        {onRequest && (
          <button onClick={() => onRequest(food._id)} className="request-btn">Request Pickup</button>
        )}
      </div>
    </div>
  );
};

export default FoodCard;
