import {useEffect, useState} from "react";
import {DraggableHandlers, DraggableState} from "../core/types.ts";
import {draggable} from "../core/index.ts";

const useDraggable = (handlers: DraggableHandlers = {}) => {
	const [state, updateState] = useState<DraggableState>({});
	const {mouseDownHandler, unmountHandler} = draggable(handlers, {
		get(key: string) {
			return state[key];
		},
		set(key: string, value: any) {
			updateState({...state, [key]: value});
		}
	});
	// No effect except running unmountHandler on unmount.
	useEffect(() => unmountHandler);
	return {mouseDownHandler};
};

export default useDraggable;
