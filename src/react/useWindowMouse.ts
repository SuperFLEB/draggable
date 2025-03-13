import {useEffect, useRef} from "react";
import {WindowMouseHandlers, XY} from "../core/types.ts";
import WindowMouse from "../core/WindowMouse.ts";
import {Button} from "../core/enums.ts";

type UseWindowMouseReactProps = {
	handlers: WindowMouseHandlers;
	buttons: typeof Button | number;
};

type UseWindowMouseReactReturn = {
	dragStartHandler: WindowMouse["dragStartHandler"];
}

type UseWindowMouseReact = (props: UseWindowMouseReactProps) => UseWindowMouseReactReturn;

const useWindowMouse: UseWindowMouseReact = ({handlers = {}, buttons = Button.PRIMARY}) => {
	const windowMouseRef = useRef<WindowMouse>(new WindowMouse());
	useEffect(() => {
		const windowMouse = windowMouseRef.current = windowMouseRef.current ?? new WindowMouse();
		windowMouse.setHandlers(handlers);
		windowMouse.buttons = buttons;
		return () => {
			windowMouseRef.current.detach();
			windowMouseRef.current = null;
		};
	}, []);
	return {dragStartHandler: windowMouseRef.current.dragStartHandler};
};

export default useWindowMouse;
