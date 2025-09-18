import React from 'react';
import { Box, Typography } from '@mui/material';
import type { GameData } from './types';

export const RoundHeader: React.FC<{ currentRound: number; gameData: GameData | undefined }> = ({ currentRound, gameData }) => (
  <Typography variant="h2" align="center" gutterBottom sx={{ marginBottom: 3 }}>
    Раунд {currentRound + 1}: {gameData?.Name}
  </Typography>
);
