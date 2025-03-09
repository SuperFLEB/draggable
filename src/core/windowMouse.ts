import type {StateInterface, WindowMouseHandlers, WindowMouseResponse, WindowMouseState} from "./types.ts";
import {HandlerReason} from "./types.ts";

/**
 * Creates handlers that get mouseUp and mouseMove events from the window, so situations where mouseUp happens outside
 * the component DOM are still handled. If you're making a draggable element, consider the derivative "draggable" instead.
 * If you need events but want to do something else with them, though, windowMouse is here for you.
 */
const windowMouse = ({
						 dragStartHandler,
						 dragMoveHandler,
						 dragEndHandler,
						 mouseUpHandler,
					 }: WindowMouseHandlers, {get, set}: StateInterface<WindowMouseState>): WindowMouseResponse => {

	const handleMouseMove = (e: MouseEvent) => {
		if (!(get("isMouseDown") && dragMoveHandler)) return;
		dragMoveHandler(e, HandlerReason.MOVE);
	};

	const handleMouseUp = (e: MouseEvent) => {
		window.removeEventListener("mousemove", handleMouseMove);
		window.removeEventListener("mouseup", handleMouseUp);
		mouseUpHandler?.(e, HandlerReason.MOUSEUP);
		dragEndHandler?.(e, HandlerReason.MOUSEUP);
	};

	const unmountHandler = () => {
		window.removeEventListener("mousemove", handleMouseMove);
		window.removeEventListener("mouseup", handleMouseUp);
		window.removeEventListener("mousedown", mouseDownHandler);
		debugger;
		if (get("isMouseDown")) dragEndHandler?.(null, HandlerReason.UNMOUNT);
		set("isMouseDown", false);
	};

	const mouseDownHandler = (e: MouseEvent) => {
		set("isMouseDown", true);
		window.addEventListener("mousemove", handleMouseMove);
		window.addEventListener("mouseup", handleMouseUp);
		dragStartHandler?.(e, HandlerReason.MOUSEDOWN);
	};

	return {mouseDownHandler, unmountHandler} as const;
};

export default windowMouse;
