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
export type DraggableHandlers = {
	// Intercept before start to, e.g., transform the coordinates
	beforeStart?: DraggableEventHandler | null;
	// Handler for when the drag starts, on mousedown.
	onStart?: DraggableEventHandler | null;
	// Intercept before move to, e.g., transform the coordinates
	beforeMove?: DraggableEventHandler | null;
	// Handler for when the mouse button is down and the mouse moves, mid-drag.
	onMove?: DraggableEventHandler | null;
	// Intercept before end to, e.g., transform the coordinates
	beforeEnd?: DraggableHandler | null;
	// Handler for when the drag ends, either due to mouseup or the component unmounting. Event may be null in the case of an unmount.
	onEnd?: DraggableHandler | null;
	// Handler for when the drag ends due to mouseup. Not run when the component unmounts.
	onMouseUp?: DraggableEventHandler | null;
	// On any update
	onUpdate?: DraggableHandler | null;
}
export type UseDraggableOptions = {
	buttons: number | typeof Button;
	startXy: XY;
	pixelSize: XY;
	preserveState: boolean;
}

// Includes the onStateChange handler for use by adapters.
// If you're not writing an adapter, use "onUpdate". It's the same thing.
export type AllDraggableHandlers = DraggableHandlers & {
	onStateChange?: DraggableHandler;
};

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
