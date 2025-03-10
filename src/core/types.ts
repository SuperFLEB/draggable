import Draggable from "./Draggable.ts";

export type WindowMouseState = {
	isMouseDown?: boolean | null,
}

export type DraggableState = {
	dragState?: Movement | null;
} & WindowMouseState;

export type XY<T = number> = { x: T, y: T };
export type Movement = {
	// x, y relative to starting x and y (sx, sy)
	x: number;
	y: number;

	// Starting x, y. What was passed in on initialization
	sx: number;
	sy: number;

	// Delta/distance since last event
	dx: number;
	dy: number;

	// Client (window, absolute) x, y
	cx: number;
	cy: number;
}

export type {Movement as default};
export type DraggableEventHandler = (this: Draggable, e: MouseEvent, dragState: Movement) => void;
export type DraggableHandler = (this: Draggable, e: MouseEvent | null, dragState: Movement) => void;
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

// Includes the onStateChange handler for use by adapters.
// If you're not writing an adapter, use "onUpdate". It's the same thing.
export type AllDraggableHandlers = DraggableHandlers & {
	onStateChange?: DraggableHandler;
};

export type WindowMouseEventHandler = ((e: MouseEvent) => void);
export type WindowMouseHandler = ((e: MouseEvent | null) => void);
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
