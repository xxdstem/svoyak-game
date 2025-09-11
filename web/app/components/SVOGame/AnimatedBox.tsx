import React from "react";
import { Box } from '@mui/material';
import { keyframes } from '@mui/system';
type Props = {
  duration: number;
  show: boolean;
  isPaused: boolean;
  children: React.ReactNode
}
export const AnimatedBox: React.FC<Props> = ({ 
  duration,
  show,
  isPaused,
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
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          backgroundColor: '#fff',
          animation: `${shrinkHorizontal} ${duration}s linear forwards`,
          animationPlayState: isPaused ? "paused" : "running"
        }}
      />
      
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: '4px',
          backgroundColor: '#fff',
          animation: `${shrinkVertical} ${duration}s linear forwards`,
          animationPlayState: isPaused ? "paused" : "running"
        }}
      />
      
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '4px',
          backgroundColor: '#fff',
          animation: `${shrinkHorizontal} ${duration}s linear forwards`,
          animationPlayState: isPaused ? "paused" : "running"
        }}
      />
      
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: '4px',
          backgroundColor: '#fff',
          animation: `${shrinkVertical} ${duration}s linear forwards`,
          animationPlayState: isPaused ? "paused" : "running"
        }}
      />
      
      <Box>
        {children}
      </Box>
    </Box>
  );
};