import {useEffect, useRef} from "react";
import {WindowMouseHandlers} from "../core/types.ts";
import WindowMouse, {BUTTON} from "../core/WindowMouse.ts";

const useWindowMouse = (handlers: WindowMouseHandlers, buttons: number = BUTTON.PRIMARY) => {
	const windowMouseRef = useRef<WindowMouse>(new WindowMouse());
	useEffect(() => {
		windowMouseRef.current.setHandlers(handlers);
		windowMouseRef.buttons = buttons;
		return () => windowMouseRef.detach();
	});
	return {dragStartHandler: windowMouseRef.current.dragStartHandler};
};

export default useWindowMouse;
