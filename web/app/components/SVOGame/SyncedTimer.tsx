import { useCallback, useEffect, useRef, useState } from "react";

export const useSyncedTimer = (callback: () => void, duration: number) => {
    const timeoutRef = useRef<NodeJS.Timeout>(null);
    const remainingDuration = useRef<number>(duration);
    const startTime = useRef<number>(Date.now());
    const [isPaused, setPaused] = useState(true);

    const resume = useCallback(()=>{
        setPaused(false);
        timeoutRef.current = setTimeout(()=>{
            callback()
        }, remainingDuration.current)
    },[]);

    const start = useCallback(()=>{
        startTime.current = Date.now();
        resume();
    },[]);
    
    const pause = useCallback(() => {
        remainingDuration.current -= Date.now() - startTime.current;
        setPaused(true);
        clearTimeout(timeoutRef.current!)
    }, []);
    useEffect(()=>{
        return () => clearTimeout(timeoutRef.current!);
    }, [])
    return {start, resume, pause, isPaused}
}