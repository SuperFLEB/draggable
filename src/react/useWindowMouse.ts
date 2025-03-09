import {useEffect, useState} from "react";
import {WindowMouseHandlers, WindowMouseState} from "../core/types.ts";
import {windowMouse} from "../core/index.ts";

const useWindowMouse = (handlers: WindowMouseHandlers) => {
	const [state, updateState] = useState<WindowMouseState>({});
	const {mouseDownHandler, unmountHandler} = windowMouse(handlers, {
		get: (k) => state[k],
		set: (k, v) => updateState({...state, [k]: v})
	});
	// Only effect is to run the unmount handler on unmount
	useEffect(() => unmountHandler);
	return {mouseDownHandler};
};

export default useWindowMouse;
