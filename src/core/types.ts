import Draggable from "./Draggable.ts";

export type FixedLengthArray<L extends number, T> = [T, ...T[]] & { length: L };

export type WindowMouseState = {
	isMouseDown?: boolean | null,
}

export type DraggableState = {
	dragState?: Movement | null;
} & WindowMouseState;

export type XY<T = number> = { x: T, y: T };

export type PixelMovement = {
	// x, y in pixels relative to starting x and y in pixels (spx, spy)
	pxx: number;
	pxy: number;

	// Starting x, y in pixels. What was passed in on initialization divided by pixelSize
	pxsx: number;
	pxsy: number;

	// Pixel size (multiplier) used to calculate pixels
	psx: number;
	psy: number;

	// Pixel delta/distance since last event
	pxdx: number;
	pxdy: number;

	// Client (window, absolute) x, y
	pxcx: number | null;
	pxcy: number | null;
}

export type Movement = PixelMovement & {
	// x, y relative to starting x and y (sx, sy)
	x: number;
	y: number;

	// Starting x, y. What was passed in on initialization
	sx: number;
	sy: number;

	// Delta/distance since last event
	dx: number;
	dy: number;
}

export type Clicked = {
	buttons: number,
	isClicked: FixedLengthArray<16, boolean>
};

export type DragState = Movement & Clicked;

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
