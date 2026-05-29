import React from 'react';

export default function PredictionCard({title, result}){
  return (
    <div className="prediction-card">
      <h5>{title}</h5>
      <div>{result}</div>
    </div>
  );
}
