import {default as coreDraggable} from "../core/draggable.ts";
import {default as coreWindowMouse} from "../core/windowMouse.ts";
import type {DraggableHandlers, DraggableState, WindowMouseHandlers, WindowMouseResponse, XY} from "../core/types";

export function windowMouse(handlers: WindowMouseHandlers): WindowMouseResponse {
	const state: Record<string, any> = {};
	const stateInterface = {
		get: (key: string) => state[key],
		set: (key: string, value: any) => state[key] = value,
	};
	return coreWindowMouse(handlers, stateInterface);
}

export function draggable(handlers: DraggableHandlers = {}) {
	const state: Record<string, any> = {};
	const stateInterface = {
		get: (key: string) => state[key],
		set: (key: string, value: any) => state[key] = value,
	}
	return coreDraggable(handlers, stateInterface);
}

export default draggable;