export type WindowMouseState = {
	isMouseDown?: boolean | null,
}

export type DraggableState = {
	dragState?: Movement | null;
} & WindowMouseState;

export type StateInterface<T extends DraggableState | WindowMouseState> = {
	get: <StateKey extends keyof T>(key: StateKey) => T[StateKey];
	set: <StateKey extends keyof T>(key: StateKey, value: T[StateKey]) => void;
}

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
export type DraggableEventHandler = (e: MouseEvent, dragState: Movement) => void;
export type DraggableSyntheticHandler = (e: null, dragState: Movement) => void;
export type DraggableHandler = (e: MouseEvent | null, dragState: Movement) => void;
export type DragTransformer = (e: MouseEvent, priorDragState: Movement, proposedDragState: Movement) => XY | null;
export type DraggableHandlers = {
	// Handler for when the drag starts, on mousedown.
	onStart?: DraggableEventHandler | null;
	// Handler for when the mouse button is down and the mouse moves, mid-drag.
	onMove?: DraggableEventHandler | null;
	// Handler for when the drag ends, either due to mouseup or the component unmounting. Event may be null in the case of an unmount.
	onEnd?: DraggableHandler | null;
	// Handler for when the drag ends due to mouseup. Not run when the component unmounts.
	onMouseUp?: DraggableEventHandler | null;

	// Interpret and modify the initial drag state on mousedown
	xyOnStart?: DragTransformer | null;
	// Interpret and modify the initial drag state on drag move. Note that this will zero any dx/dy delta values for the move.
	xyOnMove?: DragTransformer | null;
}

export type WindowMouseEventHandler = ((e: MouseEvent, reason: Exclude<HandlerReason, HandlerReason.UNMOUNT>) => void);
export type WindowMouseDragEndHandler = {
	(e: null, reason: HandlerReason.UNMOUNT): void;
	(e: MouseEvent, reason: HandlerReason.MOUSEUP): void;
}

export type WindowMouseHandlers = {
	// Handler to run when the mouse button goes down.
	dragStartHandler?: WindowMouseEventHandler;
	// Handler to run when the mouse moves during a drag.
	dragMoveHandler?: WindowMouseEventHandler;
	// Handler to run when the mouse button is released or when the component unmounts. This happens any time move events will no longer be handled.
	dragEndHandler?: WindowMouseDragEndHandler;
	// Handler to run when the mouse button is released. Does not trigger when the drag ends because the component is unmounted.
	mouseUpHandler?: WindowMouseEventHandler;
}

export type WindowMouseResponse = {
	mouseDownHandler: (e: MouseEvent) => void;
	unmountHandler: () => void;
}

export const enum HandlerReason {
	MOUSEDOWN = "mousedown",
	MOVE = "mousemove",
	MOUSEUP = "mouseup",
	UNMOUNT = "unmount",
}
