import Draggable from "./Draggable.ts";
import type WindowMouse from "./WindowMouse.ts";
import {Button} from "./enums.ts";

export type FixedLengthArray<L extends number, T> = [T, ...T[]] & { length: L };

export type XY<T = number> = { x: T, y: T };

export type PixelMovement = {
	// x, y in pixels relative to starting x and y in pixels (spx, spy)
	pxX: number;
	pxY: number;

	// Starting x, y in pixels. What was passed in on initialization divided by pixelSize
	pxStartX: number;
	pxStartY: number;

	// Pixel size (multiplier) used to calculate pixels
	pixelSizeX: number;
	pixelSizeY: number;

	// Pixel delta/distance since last event
	pxDeltaX: number;
	pxDeltaY: number;

	// Client (window, absolute) x, y
	pxClientX: number | null;
	pxClientY: number | null;
}

export type Movement = PixelMovement & {
	// x, y relative to starting x and y (sx, sy)
	x: number;
	y: number;

	// Starting x, y. What was passed in on initialization
	startX: number;
	startY: number;

	// Delta/distance since last event
	deltaX: number;
	deltaY: number;
}

export type DragExtras = {
	buttons: number,
	buttonStates: FixedLengthArray<16, boolean>
	inDrag: boolean;
};

export type DragState = Movement & DragExtras;

export type {Movement as default};
export type DraggableEventHandler = (this: Draggable, e: MouseEvent, dragState: DragState, instance: Draggable) => void;
export type DraggableHandler = (this: Draggable, e: MouseEvent | null, dragState: DragState, instance: Draggable) => void;

const draggableEventHandlerEventNames = Object.freeze(["start", "move", "mouseUp"] as const);
const draggableHandlerEventNames = Object.freeze(["end", "update", "change", "boundsFail"] as const);
export const draggableEventNames = Object.freeze([...draggableEventHandlerEventNames, ...draggableHandlerEventNames]);
export const draggableEventPrefixes = Object.freeze(["before", "on", "adapterBefore", "adapterOn"] as const);
export const draggableHandlerNames = Object.freeze(draggableEventPrefixes.flatMap(
	prefix => draggableEventNames.map(
		name => `${prefix}${name[0].toUpperCase() + name.slice(1)}` as DraggableHandlerMethodName
	)
));

export type DraggableEventHandlerEventName = typeof draggableEventHandlerEventNames[number];
export type DraggableHandlerEventName = typeof draggableHandlerEventNames[number];
export type HandlerPrefix = typeof draggableEventPrefixes[number];

type DraggableHandlerMethodName = `${HandlerPrefix}${Capitalize<DraggableHandlerEventName>}`;
type DraggableEventHandlerMethodName = `${HandlerPrefix}${Capitalize<DraggableEventHandlerEventName>}`;
export type DraggableHandlerName = DraggableHandlerMethodName | DraggableEventHandlerMethodName;
export type DraggableHandlers =
	{ [n in DraggableHandlerMethodName]: DraggableHandler }
	& { [n in DraggableEventHandlerMethodName]: DraggableEventHandler };
export type WithOptionalDraggableHandlers = { [k in keyof DraggableHandlers]: DraggableHandlers[k] | null };

export type UseDraggableOptions = {
	buttons: number | typeof Button;
	startXy: XY;
	pixelSize: XY;
	preserveState: boolean;
}

export type WindowMouseEventHandler = ((e: MouseEvent, instance: WindowMouse) => void);
export type WindowMouseHandler = ((e: MouseEvent | null, instance: WindowMouse) => void);
export type WindowMouseHandlers = {
	// Handler to run when the mouse button goes down.
	onStart?: WindowMouseEventHandler;
	// Handler to run when the mouse moves during a drag.
	onMove?: WindowMouseEventHandler;
	// Handler to run when the mouse button is released or when the component unmounts. This happens any time move events will no longer be handled.
	onEnd?: WindowMouseEventHandler;
	// Handler to run when the mouse button is released. Does not trigger when the drag ends because the component is unmounted.
	onMouseUp?: WindowMouseEventHandler;
}

export const enum UnitType {
	PIXEL = "PIXEL",
	VALUE = "VALUE",
};

export type Limits = {
	x: [number, number];
	y: [number, number];
	unit: UnitType;
}