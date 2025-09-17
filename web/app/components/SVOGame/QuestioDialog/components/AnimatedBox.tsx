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

  if(!show) return children;

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'visible',
        height: "100%",
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '-6px',
          left: 0,
          right: 0,
          height: '6px',
          backgroundColor: color,
          animation: `${shrinkHorizontal} ${duration}s linear forwards`,
          animationPlayState: isPaused ? "paused" : "running"
        }}
      />
      
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: '-6px',
          bottom: 0,
          width: '6px',
          backgroundColor: color,
          animation: `${shrinkVertical} ${duration}s linear forwards`,
          animationPlayState: isPaused ? "paused" : "running"
        }}
      />
      
      <Box
        sx={{
          position: 'absolute',
          bottom: '-6px',
          left: 0,
          right: 0,
          height: '6px',
          backgroundColor: color,
          animation: `${shrinkHorizontal} ${duration}s linear forwards`,
          animationPlayState: isPaused ? "paused" : "running"
        }}
      />
      
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: '-6px',
          bottom: 0,
          width: '6px',
          backgroundColor: color,
          animation: `${shrinkVertical} ${duration}s linear forwards`,
          animationPlayState: isPaused ? "paused" : "running"
        }}
      />
      
        {children}
    </Box>
  );
};

export default AnimatedBox;