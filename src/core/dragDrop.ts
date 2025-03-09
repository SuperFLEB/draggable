import type {DragDropHandlers, DragDropState, Movement, StateInterface, XY} from "./types.ts";
import {HandlerReason} from "./types.ts";
import windowMouse from "./windowMouse.ts";

const getNewDragState = (e: MouseEvent, dragState: Movement): Movement => {
	const delta = {
		x: e.clientX - dragState.cx,
		y: e.clientY - dragState.cy,
	};
	return {
		...dragState,
		x: dragState.x + delta.x,
		y: dragState.y + delta.y,
		cx: e.clientX,
		cy: e.clientY,
		dx: delta.x,
		dy: delta.y,
	};
};

export type DragDropReturn = {
	mouseDownHandler: (e: MouseEvent) => void;
	unmountHandler: () => void;
}
export default function dragDrop({
									 onStart = null,
									 onMove = null,
									 onEnd = null,
									 onMouseUp = null,
									 xyOnStart = null,
									 xyOnMove = null,
								 }: DragDropHandlers = {}, {set, get}: StateInterface<DragDropState>) {
	const handleDragStart = (e: MouseEvent) => {
		const newDragState: Movement = {
			x: e.clientX,
			y: e.clientY,
			sx: e.clientX,
			sy: e.clientY,
			dx: 0,
			dy: 0,
			cx: e.clientX,
			cy: e.clientY,
		};

		const updateXy = xyOnStart?.(e, newDragState, newDragState) ?? null;
		if (updateXy) {
			newDragState.x = updateXy.x;
			newDragState.y = updateXy.y;
			newDragState.sx = updateXy.x;
			newDragState.sx = updateXy.y;
		}
		set("dragState", newDragState);
		onStart?.(e, newDragState);
	};

	const handleMouseMove = (e: MouseEvent) => {
		const dragState = get("dragState");
		if (!dragState) return;
		const newDragState = getNewDragState(e, dragState);
		const updateXy = xyOnMove?.(e, dragState, newDragState) ?? null;
		if (updateXy) {
			newDragState.x = updateXy.x;
			newDragState.y = updateXy.y;
			newDragState.dx = 0;
			newDragState.dy = 0;
		}
		set("dragState", newDragState);
		onMove?.(e, newDragState);
	};

	const handleDragEnd = (e: MouseEvent | null, reason: HandlerReason) => {
		const dragState = get("dragState");
		if (!dragState) return;

		const endDragState = dragState;
		set("dragState", null);

		if (reason === HandlerReason.MOUSEUP) {
			onMouseUp?.(e as MouseEvent, endDragState);
		}

		onEnd?.(e, endDragState);
	};

	const {mouseDownHandler} = windowMouse({
		dragStartHandler: handleDragStart,
		dragMoveHandler: handleMouseMove,
		dragEndHandler: handleDragEnd,
	}, {get, set});

	const unmountHandler = () => {
		set("dragState", null);
	};

	return {mouseDownHandler, unmountHandler} as DragDropReturn;
}
