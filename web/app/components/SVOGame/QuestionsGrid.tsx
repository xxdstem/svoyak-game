import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import type { Theme, Question } from './types';

interface QuestionsGridProps {
  themes: Theme[];
  availableQuestion: (q: Question) => boolean;
  handleQuestionClick: (themeIndex: number, questionIndex: number) => void;
}

export const QuestionsGrid: React.FC<QuestionsGridProps> = ({ themes, availableQuestion, handleQuestionClick }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%', overflow: 'auto' }}>
    {themes.map((gameTheme, themeIndex) => (
      <Box key={themeIndex} sx={{ display: 'grid', gridTemplateColumns: '1fr 5fr', alignItems: 'stretch', gap: 2, width: '100%' }}>
        <Card sx={{
          backgroundColor: 'primary.light',
          color: 'text.primary',
          minWidth: '200px',
          width: '100%',
          minHeight: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          wordBreak: 'break-word',
        }}>
          <CardContent>
            <Typography variant="h6" align="center" mt={1}>
              {gameTheme.Name}
            </Typography>
          </CardContent>
        </Card>
        <Box sx={{ display: 'flex', gap: 1, width: '100%', height: '100%' }}>
          {gameTheme.Questions
            .sort((a, b) => a.Price - b.Price)
            .map((question, questionIndex) => (
              <Card
                key={questionIndex}
                onClick={() => handleQuestionClick(themeIndex, questionIndex)}
                sx={{
                  cursor: availableQuestion(question) ? 'pointer' : 'default',
                  backgroundColor: availableQuestion(question) ? 'primary.dark' : 'grey.100',
                  color: 'text.primary',
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  '&:hover': availableQuestion(question) ? {
                    backgroundColor: 'primary.main',
                  } : {},
                }}
              >
                <CardContent>
                  <Typography variant="h5" mt={1} align="center">
                    {question.IsAnswered ? '' : question.Price}
                  </Typography>
                </CardContent>
              </Card>
            ))}
        </Box>
      </Box>
    ))}
  </Box>
);
