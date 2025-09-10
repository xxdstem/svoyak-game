import { Box, Button, DialogActions, DialogContent, DialogTitle, Divider, Typography, useTheme } from "@mui/material";
import type { CurrentQuestion, Question, RoomPlayer, Theme } from "./types";
import { $room } from "~/store/room";
import { useSelector } from "react-redux";
import MusicIcon from "./MusicIcon";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { $currentUser } from "~/store/user";
import { AnimatedBox } from "./AnimatedBox";

type Props = {
    themes: Theme[];
    currentQuestion: CurrentQuestion
    handleCloseQuestion: VoidFunction;
}

export const QuestionDialog: React.FC<Props> = (props) => {
    const { themes, currentQuestion, handleCloseQuestion  } = props;
    const default_delay = 2;
    const question_duration = 5;
    
    const room = useSelector($room);
    const user = useSelector($currentUser);
    const theme = useTheme();
    const [delaying, setDelaying] = useState(true);
    const [showAnswer, setShowAnswer] = useState(false);

    const currentPlayer = useMemo<RoomPlayer | undefined>(()=>Object.values(room.players).find(p=>p != null && p.id == user?.session_id), [room]);
    
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

    const answer = ()=>{

    }

    // Получение медиа (изображения/аудио) вопроса
    const getQuestionMedia = useCallback((question: Question) => {
        let questionParams;
        if(showAnswer){
            questionParams = question.Params.find(p => p.Name === 'answer')
        }
        if(!questionParams){
            questionParams = question.Params.find(p => p.Name === 'question')
            if (!questionParams) return null;
        }

        return questionParams.Items.find(item => ['image', 'audio'].includes(item.Type));
    },[showAnswer]);

    useEffect(()=>{
        setTimeout(()=>setDelaying(false), default_delay * 1000);
    }, []);

    useEffect(()=>{
        if(!delaying){
            setTimeout(()=>{
                setShowAnswer(true);
                setTimeout(()=>{
                    handleCloseQuestion()
                }, default_delay * 1000);
            }, question_duration * 1000)
        }
    }, [delaying])

    const gameTheme = themes[currentQuestion.themeIndex];
    const question = currentQuestion.question;
    const questionText = getQuestionText(question);
    const answerText = getAnswerText(question);
    const media =  getQuestionMedia(question);
    
    return (
        <>
        <DialogTitle sx={{ 
            fontSize:"100%",
            backgroundColor: theme.palette.primary.dark, 
            color: theme.palette.text.primary 
        }}>
            {gameTheme.Name} за {question.Price}
        </DialogTitle>
        <DialogContent sx={{pt: '16px !important'}}>
            <AnimatedBox duration={question_duration} delay={default_delay} show={!delaying}>
                <Box sx={{ display: 'flex', alignItems:"center",
                    flexDirection:"column", justifyContent: 'center'}}>
                    {(questionText || !media) && (
                        <Typography variant="h4" mb={1} align="center" gutterBottom>
                            {questionText}
                        </Typography>
                    )}
                    {media && <>
                        {media.Type === 'image' && (
                            <img
                            src={`http://localhost:8080/files/${room.package_id}/Images/${encodeURIComponent(encodeURIComponent(media.Content))}`}
                            alt="Question media" 
                            style={{ maxWidth: '90%', maxHeight: '70vh' }} 
                            />
                        )}
                            
                        {media.Type === 'audio' && (<>
                            <audio style={{display:"none"}} controls autoPlay>
                            <source src={`http://localhost:8080/files/${room.package_id}/Audio/${encodeURIComponent(encodeURIComponent(media.Content))}`} type="audio/mpeg" />
                            Ваш браузер не поддерживает аудио элемент.
                            </audio>
                            <MusicIcon/></>
                        )}
                    </>}
                    
                    
                </Box>
            </AnimatedBox>
        </DialogContent>
        <DialogActions sx={{ 
            minHeight: 74,
            justifyContent: 'space-between', 
            padding: 2,
            backgroundColor: theme.palette.background.default,
        }}>
            {showAnswer ? <Typography style={{margin: "auto"}} variant="h1">
                {answerText}
                </Typography>
            : (<>
                {currentPlayer?.room_stats.Role == "host" ? <Button
                onClick={()=>setShowAnswer(true)} 
                color="primary" 
                variant="contained"
                >
                Показать ответ
                </Button> : !delaying && <Button
                fullWidth
                onClick={answer} 
                color="success" 
                variant="contained"
                >ОТВЕТИТЬ
                </Button>}</>
            )}
        </DialogActions>
        </>
    );
}