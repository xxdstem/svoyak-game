import { Box, Button, DialogActions, DialogContent, DialogTitle, Divider, Typography, useTheme } from "@mui/material";
import type { CurrentQuestion, Question, Theme } from "./types";
import { $game } from "~/store/game";
import { useSelector } from "react-redux";

type Props = {
    handleShowAnswer: VoidFunction;
    showAnswer: boolean;
    themes: Theme[];
    currentQuestion: CurrentQuestion
}

export const QuestionDialog: React.FC<Props> = (props) => {
    const { handleShowAnswer, showAnswer, themes, currentQuestion  } = props;

    const gameData = useSelector($game);
    const theme = useTheme();

    // Получение текста вопроса
    const getQuestionText = (question: Question) => {
        const questionParams = question.Params.find(p => p.Name === 'question');
        if (!questionParams) return '';

        // Ищем текстовый контент (не изображения/аудио)
        const textItems = questionParams.Items.filter(item =>
            !['image', 'audio'].includes(item.Type) &&
            item.Placement !== 'replic' &&
            item.Content.trim()
        );

        return textItems.map(item => item.Content).join('\n');
    };

    // Получение ответа
    const getAnswerText = (question: Question) => {
        return question.Right.Answers.join(' или ');
    };

    // Получение медиа (изображения/аудио) вопроса
    const getQuestionMedia = (question: Question) => {
        const questionParams = question.Params.find(p => p.Name === 'question');
        if (!questionParams) return null;

        return questionParams.Items.find(item => ['image', 'audio'].includes(item.Type));
    };

    const gameTheme = themes[currentQuestion.themeIndex];
    const question = gameTheme.Questions[currentQuestion.questionIndex];
    const questionText = getQuestionText(question);
    const answerText = getAnswerText(question);
    const media = getQuestionMedia(question);
    if (!gameData){
        return <>lol?</>
    }
    return (
        <>
        <DialogTitle sx={{ 
            backgroundColor: theme.palette.primary.dark, 
            color: theme.palette.text.primary 
        }}>
            {gameTheme.Name} за {question.Price}
        </DialogTitle>
        <DialogContent sx={{ padding: 4 }}>
            {media?.Type === 'image' && (
            <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: 2 }}>
                <img 
                src={`http://localhost:8080/files/${gameData.PackageID}/Images/${media.Content}`}
                alt="Question media" 
                style={{ maxWidth: '100%', maxHeight: '80%' }} 
                />
            </Box>
            )}
            
            {media?.Type === 'audio' && (
            <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: 2 }}>
                <audio controls autoPlay>
                <source src={`http://localhost:8080/files/${gameData.PackageID}/Audio/${media.Content}`} type="audio/mpeg" />
                Ваш браузер не поддерживает аудио элемент.
                </audio>
            </Box>
            )}
            
            {questionText && (
            <Typography variant="h5" gutterBottom>
                {questionText}
            </Typography>
            )}
            
            {showAnswer && (
            <>
                <Divider sx={{ marginY: 3 }} />
                <Typography variant="h6" color="primary">
                Ответ:
                </Typography>
                <Typography variant="h5">
                {answerText}
                </Typography>
            </>
            )}
        </DialogContent>
        <DialogActions sx={{ 
            justifyContent: 'space-between', 
            padding: 2,
            backgroundColor: theme.palette.background.default,
        }}>
            <Box>
            {!showAnswer && (
                <Button
                onClick={handleShowAnswer} 
                color="primary" 
                variant="contained"
                >
                Показать ответ
                </Button>
            )}
            </Box>

        </DialogActions>
        </>
    );
}