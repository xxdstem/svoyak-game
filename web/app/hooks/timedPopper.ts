import { useDispatch } from "react-redux";
import { setPlayerPopper } from "~/store/room";

export function useTimedPopper() {
  const dispatch = useDispatch();
  return (ID: string, text: string, timeout = 5000) =>{
    dispatch(setPlayerPopper({ id: ID, popperText: text }));
    setTimeout(() => {
      dispatch(setPlayerPopper({ id: ID, popperText: null }));
    }, timeout);
  }
}
