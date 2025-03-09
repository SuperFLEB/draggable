import {useEffect, useState} from "react";
import {DragDropHandlers, DragDropState} from "../core/types.ts";
import {dragDrop} from "../core/index.ts";

const useDragDrop = (handlers: DragDropHandlers = {}) => {
	const [state, updateState] = useState<DragDropState>({});
	const {mouseDownHandler, unmountHandler} = dragDrop(handlers, {
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

export default useDragDrop;
