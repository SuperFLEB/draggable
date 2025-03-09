import {default as coreDragDrop} from "../core/dragDrop.ts";
import {default as coreWindowMouse} from "../core/windowMouse.ts";
import type {DragDropHandlers, DragDropState, WindowMouseHandlers, WindowMouseResponse, XY} from "../core/types";

export function windowMouse(handlers: WindowMouseHandlers): WindowMouseResponse {
	const state: Record<string, any> = {};
	const stateInterface = {
		get: (key: string) => state[key],
		set: (key: string, value: any) => state[key] = value,
	};
	return coreWindowMouse(handlers, stateInterface);
}

export function dragDrop(handlers: DragDropHandlers = {}) {
	const state: Record<string, any> = {};
	const stateInterface = {
		get: (key: string) => state[key],
		set: (key: string, value: any) => state[key] = value,
	}
	return coreDragDrop(handlers, stateInterface);
}

export default dragDrop;