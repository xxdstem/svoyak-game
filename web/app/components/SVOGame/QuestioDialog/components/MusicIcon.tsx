import React from 'react';
import { Box, keyframes, styled } from '@mui/material';
import MusicNoteIcon from '@mui/icons-material/MusicNote';

// Анимации
const pulse = keyframes`
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(156, 39, 176, 0.7);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 20px rgba(156, 39, 176, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(156, 39, 176, 0);
  }
`;

const float = keyframes`
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
`;

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

// Стилизованные компоненты
const MusicContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 120,
  height: 120,
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #9c27b0, #673ab7)',
    animation: `${pulse} 1s infinite ease-in-out, ${float} 3s infinite ease-in-out`,
  cursor: 'default',
  transition: 'all 0.3s ease',
}));

const Icon = styled(MusicNoteIcon)(({ theme }) => ({
  fontSize: 60,
  color: 'white',
  animation: `${rotate} 4s infinite linear`,
  transition: 'all 0.3s ease',
}));

const RippleEffect = styled(Box)(({ theme }) => ({
  position: 'absolute',
  borderRadius: '50%',
  border: '2px solid rgba(255, 255, 255, 0.3)',
  animation: `${pulse} 3s infinite ease-in-out`,
  '&:nth-of-type(1)': {
    width: 140,
    height: 140,
    animationDelay: '0.5s',
  },
  '&:nth-of-type(2)': {
    width: 160,
    height: 160,
    animationDelay: '1s',
  },
  '&:nth-of-type(3)': {
    width: 180,
    height: 180,
    animationDelay: '1.5s',
  },
}));

const Notes = styled(Box)(({ theme }) => ({
  position: 'absolute',
  '&::before, &::after': {
    content: '"♪"',
    position: 'absolute',
    fontSize: 24,
    color: 'rgba(255, 255, 255, 0.8)',
    animation: `${float} 2s infinite ease-in-out`,
  },
  '&::before': {
    top: -30,
    left: -20,
    animationDelay: '0.2s',
  },
  '&::after': {
    bottom: -25,
    right: -15,
    animationDelay: '0.7s',
  },
}));

interface AnimatedMusicIconProps {
  size?: number;
  color?: string;
  onClick?: () => void;
}

const MusicIcon: React.FC<AnimatedMusicIconProps> = ({
  size = 150,
  color = '#9c27b0'
}) => {
  return (
    <MusicContainer
      sx={{
        marginTop: 'auto',
        marginBottom: 'auto',
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${color}, ${color}66)`,
      }}
    >
      <RippleEffect />
      <RippleEffect />
      <RippleEffect />
      
      <Notes />
      
      <Icon sx={{ fontSize: size * 0.5 }} />
    </MusicContainer>
  );
};

export default MusicIcon;