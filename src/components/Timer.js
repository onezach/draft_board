import React, { useState, useEffect } from 'react';

const Timer = ({ initialTime, isRunning, onTimesUp }) => {
  const [time, setTime] = useState(initialTime);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      if (isRunning && time > 0) {
        setTime((prevTime) => prevTime - 1);
      }
      if (!expired && time <= 0) {
        onTimesUp();
        setExpired(true);
      }
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [isRunning, time, expired, onTimesUp]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60).toString().padStart(2, '0');
    const seconds = (time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  return (
    <div className='Timer'>
      <div>{formatTime(time)}</div>
    </div>
  );
};

export default Timer;
