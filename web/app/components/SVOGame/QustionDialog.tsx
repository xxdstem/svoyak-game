import { Box, Button, DialogActions, DialogContent, DialogTitle, Divider, Typography, useTheme } from "@mui/material";
import type { CurrentQuestion, Question, Theme } from "./types";
import { $game } from "~/store/game";
import { useSelector } from "react-redux";
import MusicIcon from "./MusicIcon";
import { useCallback, useRef, useState } from "react";

type Props = {
    themes: Theme[];
    currentQuestion: CurrentQuestion
}

export const QuestionDialog: React.FC<Props> = (props) => {
    const { themes, currentQuestion  } = props;

    const gameData = useSelector($game);
    const theme = useTheme();

    const [showAnswer, setShowAnswer] = useState(false);

    const imgRef = useRef<HTMLImageElement>(null);
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
    const getQuestionMedia = useCallback((question: Question) => {
        const questionParams = question.Params.find(p => p.Name === (showAnswer ? 'answer' : 'question'))
        if (!questionParams) return null;

        return questionParams.Items.find(item => ['image', 'audio'].includes(item.Type));
    },[showAnswer]);


    const gameTheme = themes[currentQuestion.themeIndex];
    const question = gameTheme.Questions[currentQuestion.questionIndex];
    const questionText = getQuestionText(question);
    const answerText = getAnswerText(question);
    const media =  getQuestionMedia(question);

    if (!gameData){
        return null
    }
    return (
        <>
        <DialogTitle sx={{ 
            fontSize:"100%",
            backgroundColor: theme.palette.primary.dark, 
            color: theme.palette.text.primary 
        }}>
            {gameTheme.Name} за {question.Price}
        </DialogTitle>
        <DialogContent>
            <Box sx={{ display: 'flex', alignItems:"center",
                 flexDirection:"column", justifyContent: 'center'}}>
            {media && <>
                {media.Type === 'image' && (
                        <img
                        ref={imgRef}
                        src={`http://localhost:8080/files/${gameData.PackageID}/Images/${encodeURIComponent(encodeURIComponent(media.Content))}`}
                        alt="Question media" 
                        style={{ maxWidth: '90%', maxHeight: '70vh' }} 
                        />
                    )}
                    
                    {media.Type === 'audio' && (<>
                        <audio style={{display:"none"}} controls autoPlay>
                        <source src={`http://localhost:8080/files/${gameData.PackageID}/Audio/${encodeURIComponent(encodeURIComponent(media.Content))}`} type="audio/mpeg" />
                        Ваш браузер не поддерживает аудио элемент.
                        </audio>
                        <MusicIcon/></>
                    )}
            </>}
            {!media && showAnswer && imgRef && <div style={{display: "flex", minHeight:'300px', width: imgRef.current?.width, height: imgRef.current?.height}}>
                <Typography style={{margin: "auto", fontSize: "60px", lineHeight: 1, textAlign: "center"}} variant="h1">
                    {answerText}
                </Typography>
                </div>}
            
            {questionText && !showAnswer && (
            <Typography variant="h4" mt={2} gutterBottom>
                {questionText}
            </Typography>
            )}
            
            </Box>
        </DialogContent>
         <DialogActions sx={{ 
            minHeight: 74,
            justifyContent: 'space-between', 
            padding: 2,
            backgroundColor: theme.palette.background.default,
        }}>
           
                {!showAnswer && (<Button
                onClick={()=>setShowAnswer(true)} 
                color="primary" 
                variant="contained"
                >
                Показать ответ
                </Button>)}
                {media && showAnswer && <Typography style={{margin: "auto"}} variant="h1">
                    {answerText}
                </Typography>}
        </DialogActions>
        </>
    );
}