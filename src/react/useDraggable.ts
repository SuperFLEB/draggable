import {useEffect, useRef, useState} from "react";
import {DraggableHandlers, DraggableState, Movement} from "../core/types.ts";
import {Draggable} from "../core/index.ts";
import {BUTTON} from "../core/WindowMouse.ts";

const useDraggable = (handlers: DraggableHandlers = {}, buttons: BUTTON.PRIMARY) => {
	const [state, updateState] = useState<DraggableState>({});
	const draggableRef = useRef(new Draggable());

	useEffect(() => {
		draggableRef.current.setHandlers(handlers);
		draggableRef.current.buttons = buttons;
		draggableRef.current.onStateChange = (_: null, newState: Movement) => {
			updateState(newState);
		};
		return () => draggableRef.current.detach();
	});

	return {dragStartHandler: draggableRef.current.dragStartHandler};
};

export default useDraggable;
