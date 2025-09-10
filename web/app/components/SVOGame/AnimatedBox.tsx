import React from "react";
import { Box } from '@mui/material';
import { keyframes } from '@mui/system';

type Props = {
  duration: number;
  delay: number;
  show: boolean;
  children: React.ReactNode
}
export const AnimatedBox: React.FC<Props> = ({ 
  duration, 
  delay,
  show,
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
        backgroundColor: 'grey.800',
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
          backgroundColor: show ? '#fff' : 'transparent',
          animation: `${shrinkHorizontal} ${duration}s ease-in-out forwards`,
          animationDelay: `${delay}s`
        }}
      />
      
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: '4px',
          backgroundColor:  show ? '#fff' : 'transparent',
          animation: `${shrinkVertical} ${duration}s ease-in-out forwards`,
          animationDelay: `${delay}s`
        }}
      />
      
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '4px',
          backgroundColor:  show ? '#fff' : 'transparent',
          animation: `${shrinkHorizontal} ${duration}s ease-in-out forwards`,
          animationDelay: `${delay}s`
        }}
      />
      
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: '4px',
          backgroundColor: show ? '#fff' : 'transparent',
          animation: `${shrinkVertical} ${duration}s ease-in-out forwards`,
          animationDelay: `${delay}s`
        }}
      />
      
      <Box sx={{ p: 2 }}>
        {children}
      </Box>
    </Box>
  );
};