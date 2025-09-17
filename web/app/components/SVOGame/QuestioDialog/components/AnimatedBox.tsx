import React from "react";
import { Box } from '@mui/material';
import { keyframes } from '@mui/system';

type Props = {
  duration: number;
  show: boolean;
  isPaused?: boolean;
  color?: string;
  children: React.ReactNode
}

const AnimatedBox: React.FC<Props> = ({ 
  duration,
  show,
  isPaused = false,
  color = "#fff",
  children
}) => {

  const shrinkHorizontal = keyframes`
    from { 
      left: 0;
      right: 0;
    }
    to { 
      left: 50%;
      right: 50%;
    }
  `;

  const shrinkVertical = keyframes`
    from { 
      top: 0;
      bottom: 0;
    }
    to { 
      top: 50%;
      bottom: 50%;
    }
  `;

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        display: "flex",
        alignItems: "center",
        padding:"6px",
        height: '100%'
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '6px',
          backgroundColor: show ? color : "transparent",
          animation: !show ? "" :  `${shrinkHorizontal} ${duration}s linear forwards`,
          animationPlayState: isPaused ? "paused" : "running"
        }}
      />
      
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: '6px',
          backgroundColor: show ? color : "transparent",
          animation: !show ? "" :  `${shrinkVertical} ${duration}s linear forwards`,
          animationPlayState: isPaused ? "paused" : "running"
        }}
      />
      
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '6px',
          backgroundColor: show ? color : "transparent",
          animation: !show ? "" :  `${shrinkHorizontal} ${duration}s linear forwards`,
          animationPlayState: isPaused ? "paused" : "running"
        }}
      />
      
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: '6px',
          backgroundColor: show ? color : "transparent",
          animation: !show ? "" :  `${shrinkVertical} ${duration}s linear forwards`,
          animationPlayState: isPaused ? "paused" : "running"
        }}
      />
      
        {children}
    </Box>
  );
};

export default AnimatedBox;