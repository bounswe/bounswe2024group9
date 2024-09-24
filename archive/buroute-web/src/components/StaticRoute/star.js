import React, { useState } from "react";
import { FaStar } from "react-icons/fa";

export default function StarRate() {
  const [rating, setRating] = useState(null);

  const handleRatingChange = (currentRate) => {
    setRating(currentRate);
  };

  return (
    <div style={{ display: "flex" }}>
      {[...Array(5)].map((star, index) => {
        const currentRate = index + 1;
        return (
          <div key={index} onClick={() => handleRatingChange(currentRate)}>
            <FaStar
              size={20}
              color={currentRate <= rating ? "yellow" : "grey"}
            />
          </div>
        );
      })}
    </div>
  );
}
