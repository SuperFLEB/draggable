import {MouseEvent} from "react";
import WindowMouse from "./WindowMouse.ts";
import {
	DraggableEventHandler,
	DraggableHandler,
	DraggableHandlers,
	DragState,
	FixedLengthArray,
	Movement,
	PixelMovement,
	XY
} from "./types.ts";
import {Button} from "./enums.ts";

const handlerNames: (keyof DraggableHandlers)[] = ["beforeStart", "onStart", "beforeMove", "onMove", "beforeEnd", "onEnd", "onUpdate"] as const;

const xyFrom = (obj: any, keys: { x: string, y: string } = {x: "x", y: "y"}): XY => ({x: obj[keys.x], y: obj[keys.y]});

export const enum UnitType {
	PIXEL = "PIXEL",
	VALUE = "VALUE",
};

function pxToMovement(pxMovement: PixelMovement): Movement {
	return {
		...pxMovement,

		x: pxMovement.pxX * pxMovement.pixelSizeX,
		y: pxMovement.pxY * pxMovement.pixelSizeY,

		startX: pxMovement.pxStartX * pxMovement.pixelSizeX,
		startY: pxMovement.pxStartY * pxMovement.pixelSizeY,

		deltaX: pxMovement.pxDeltaX * pxMovement.pixelSizeX,
		deltaY: pxMovement.pxDeltaY * pxMovement.pixelSizeY,
	};
}

function newMovement(starting: XY = {x: 0, y: 0}, unit: UnitType = UnitType.VALUE, pixelSize: XY = {
	x: 1,
	y: 1
}): Movement {
	const isValue = unit === UnitType.VALUE;

	// Get pixel size either from a passed-in Movement or an XY
	const startingPx: XY = {
		x: starting.x / (isValue ? 1 : pixelSize.x),
		y: starting.y / (isValue ? 1 : pixelSize.y),
	};

	const pxMovement: PixelMovement = {
		pxX: startingPx.x,
		pxY: startingPx.y,

		pxStartX: startingPx.x,
		pxStartY: startingPx.y,

		pixelSizeX: pixelSize.x,
		pixelSizeY: pixelSize.y,

		pxDeltaX: 0,
		pxDeltaY: 0,

		pxClientX: null,
		pxClientY: null,
	};

	return pxToMovement(pxMovement);
}

function getButtonStates(buttons: number = 0): { buttons: number, buttonStates: FixedLengthArray<16, boolean> } {
	return {
		buttons, buttonStates: Array.from(function* () {
			let bit = 0;
			// tslint:disable-next-line:no-bitwise
			while (bit < 16) yield !!(buttons & (2 ** bit++));
		}()) as FixedLengthArray<16, boolean>
	};
}

class Draggable {
	constructor() {
		this.#windowMouse = new WindowMouse();

	}

	// External event callbacks

	beforeStart: DraggableEventHandler | null = null;
	onStart: DraggableEventHandler | null = null;
	beforeMove: DraggableEventHandler | null = null;
	onMove: DraggableEventHandler | null = null;
	beforeEnd: DraggableHandler | null = null;
	onEnd: DraggableHandler | null = null;
	onUpdate: DraggableHandler | null = null;

	// These are redundant events specifically to be used by adapters.
	// If you're not writing an adapter, don't use these.
	adapterBeforeStart: DraggableEventHandler | null = null;
	adapterOnUpdate: DraggableHandler | null = null;
	adapterOnEnd: DraggableHandler | null = null;

	#setHandlers(handlers: DraggableHandlers, clearUnset = true) {
		for (const handlerName of handlerNames) {
			if (handlers[handlerName]) {
				(this as any)[handlerName] = handlers[handlerName];
			} else if (clearUnset) {
				(this as any)[handlerName] = null;
			}
		}
	}

	// Options
	enabled = true;
	pixelSize: XY = {x: 1, y: 1};
	buttons: Button.PRIMARY;

	// Private properties

	#windowMouse: WindowMouse;
	#state: DragState = {
		...newMovement({x: 0, y: 0}, UnitType.VALUE, {x: 1, y: 1}),
		buttons: 0,
		buttonStates: new Array(16).fill(false) as FixedLengthArray<16, boolean>,
		inDrag: false,
	};

	#getNextMovement(clientXY: XY): Movement {
		const state = this.#state;
		const delta = {
			x: state.pxClientX === null ? 0 : clientXY.x - state.pxClientX,
			y: state.pxClientY === null ? 0 : clientXY.y - state.pxClientY,
		};

		const pxMovement: PixelMovement = {
			pxX: state.pxX + delta.x,
			pxY: state.pxY + delta.y,

			pxStartX: state.pxStartX,
			pxStartY: state.pxStartY,

			pixelSizeX: this.pixelSize.x,
			pixelSizeY: this.pixelSize.y,

			pxDeltaX: delta.x,
			pxDeltaY: delta.y,

			pxClientX: clientXY.x,
			pxClientY: clientXY.y,
		};

		return pxToMovement(pxMovement);
	}

	#updateState(e: MouseEvent) {
		const nextMovement = this.#getNextMovement({x: e.clientX, y: e.clientY});
		const buttonStates = getButtonStates(e.buttons);
		this.#state = {
			...nextMovement,
			...buttonStates,
			inDrag: this.#windowMouse.inDrag,
		};
		this.adapterOnUpdate?.(null, this.#state, this);
		this.onUpdate?.(null, this.#state, this);
	}

	#resetState(movement: Partial<DragState>) {
		this.#state = {
			...this.#state,
			...movement,
		};
		this.adapterOnUpdate?.(null, this.#state, this);
		this.onUpdate?.(null, this.#state, this);
	}

	#dragStartHandler(e: MouseEvent) {
		if (!this.enabled) return;
		if (this.#windowMouse.checkMulti(e)) return;
		this.#windowMouse.onButtonChange = (ee: MouseEvent) => this.#move(ee);
		this.#windowMouse.onMove = (ee: MouseEvent) => this.#move(ee);
		this.#windowMouse.onEnd = (ee: MouseEvent) => this.#end(ee);
		this.#windowMouse.dragStartHandler(e);
		this.#start(e);
	}

	#start(e: MouseEvent) {
		this.#updateState(e);
		this.adapterBeforeStart?.(e, this.#state, this);
		this.beforeStart?.(e, this.#state, this);
		this.onStart?.(e, this.#state, this);
	}

	#move(e: MouseEvent) {
		this.#updateState(e);
		this.beforeMove?.(e, this.#state, this);
		this.onMove?.(e, this.#state, this);
	}

	#end(e: MouseEvent | null) {
		this.#resetState({pxClientX: null, pxClientY: null, inDrag: false});
		this.beforeEnd?.(e, this.#state, this);
		this.onEnd?.(e, this.#state, this);
		this.adapterOnEnd?.(e, this.#state, this);
	}

	#fireUpdateEvent(e: MouseEvent | null = null) {
		this.adapterOnUpdate?.(null, this.#state, this);
		this.onUpdate?.(null, this.#state, this);
	}

	#detach() {
		this.#windowMouse.detach();
	}

	// Property accessors

	get state(): DragState {
		return {...this.#state};
	}

	get xy(): XY {
		return xyFrom(this.#state);
	}

	set xy(xy: XY) {
		this.#resetState(newMovement(xy, UnitType.VALUE, xyFrom(this.#state, {x: "pixelSizeX", y: "pixelSizeY"})));
	}

	get pxXy() {
		return {x: this.#state.pxX, y: this.#state.pxY};
	}

	set pxXy(xy: XY) {
		this.#resetState(newMovement(xy, UnitType.PIXEL, xyFrom(this.#state, {x: "pxSizeX", y: "pxSizeY"})));
	}

	// Method accessors (read-only)

	get detach() {
		return this.#detach;
	}

	get dragStartHandler() {
		return (e: MouseEvent) => this.#dragStartHandler(e);
	}

	get setHandlers() {
		return this.#setHandlers;
	}
}

export default Draggable;
