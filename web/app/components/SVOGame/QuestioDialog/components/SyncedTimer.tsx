import { useCallback, useEffect, useRef, useState } from "react";

export const useSyncedTimer = (callback: () => void, duration: number) => {
    const timeoutRef = useRef<NodeJS.Timeout>(null);
    const remainingDuration = useRef<number>(duration);
    const startTime = useRef<number>(Date.now());
    const [isPaused, setPaused] = useState(true);
    const isPausedRef = useRef(isPaused);
    useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
    
    const resume = useCallback(()=>{
        if(!isPausedRef.current) return;
        setPaused(false);
        startTime.current = Date.now();
        timeoutRef.current = setTimeout(()=>{
            callback()
        }, remainingDuration.current)
    },[callback]);

    const start = useCallback(()=>{
        remainingDuration.current = duration;
        setPaused(false);
        startTime.current = Date.now();
        timeoutRef.current = setTimeout(()=>{
            callback()
        }, remainingDuration.current)
    },[duration, callback]);
    
    const pause = useCallback(() => {
        if(isPausedRef.current) return;
        remainingDuration.current -= Date.now() - startTime.current;
        setPaused(true);
        clearTimeout(timeoutRef.current!)
    }, []);
    
    useEffect(()=>{
        return () => clearTimeout(timeoutRef.current!);
    }, [])
    return {start, resume, pause, isPaused}
}