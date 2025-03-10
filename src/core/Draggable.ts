import {
	Clicked,
	DraggableEventHandler,
	DraggableHandler,
	DraggableHandlers,
	DragState,
	FixedLengthArray,
	Movement,
	PixelMovement,
	XY
} from "./types.ts";
import WindowMouse from "./WindowMouse.ts";

const handlerNames: (keyof DraggableHandlers)[] = ["beforeStart", "onStart", "beforeMove", "onMove", "beforeEnd", "onEnd", "onUpdate"] as const;

const xyOf = (xy: XY) => ({x: xy.x, y: xy.y});

export const enum UnitType {
	PIXEL = "PIXEL",
	VALUE = "VALUE",
};

function pxToMovement(pxMovement: PixelMovement): Movement {
	return {
		...pxMovement,

		x: pxMovement.pxx * pxMovement.psx,
		y: pxMovement.pxy * pxMovement.psy,

		sx: pxMovement.pxsx * pxMovement.psx,
		sy: pxMovement.pxsy * pxMovement.psy,

		dx: pxMovement.pxdx * pxMovement.psx,
		dy: pxMovement.pxdy * pxMovement.psy,
	};
}

function newMovement(starting: XY = {x: 0, y: 0}, unit: UnitType = UnitType.VALUE, pixelSize: XY | Movement = {
	x: 1,
	y: 1
}): Movement {
	const isValue = unit === UnitType.VALUE;
	// Get pixel size either from a passed-in Movement or an XY
	const pixelSizeResolved = ("psx" in pixelSize) ? {x: pixelSize.psx, y: pixelSize.psy} : pixelSize;
	const startingPx: XY = {
		x: starting.x / (isValue ? 1 : pixelSizeResolved.x),
		y: starting.y / (isValue ? 1 : pixelSizeResolved.y),
	};
	const pxMovement = {
		pxx: startingPx.x,
		pxy: startingPx.y,

		pxsx: startingPx.x,
		pxsy: startingPx.y,

		psx: pixelSizeResolved.x,
		psy: pixelSizeResolved.y,

		pxdx: 0,
		pxdy: 0,

		pxcx: null,
		pxcy: null,
	};

	return pxToMovement(pxMovement);
}

function updateMovement(movement: Movement, clientXY: XY): Movement {
	const delta = {
		x: movement.pxcx === null ? 0 : clientXY.x - movement.pxcx,
		y: movement.pxcy === null ? 0 : clientXY.y - movement.pxcy,
	};

	const pxMovement = {
		pxx: movement.pxx + delta.x,
		pxy: movement.pxy + delta.y,

		pxsx: movement.pxsx,
		pxsy: movement.pxsy,

		psx: movement.psx,
		psy: movement.psy,

		pxdx: delta.x,
		pxdy: delta.y,

		pxcx: clientXY.x,
		pxcy: clientXY.y,
	};

	return pxToMovement(pxMovement);
}

function getClicked(buttons: number = 0): Clicked {
	return {
		buttons, isClicked: Array.from(function* () {
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

	// This is a redundant event specifically to be bound to by adapters.
	// Don't pass this to your consumers. It's all yours. Tell them to use onUpdate.
	onStateChange: DraggableHandler | null = null;

	#setHandlers(handlers: DraggableHandlers) {
		for (const handlerName of handlerNames) {
			if (handlers[handlerName]) {
				// It's okay, TypeScript. I've got this under control.
				(this as any)[handlerName] = handlers[handlerName];
			}
		}
	}

	// Options
	enabled = true;
	pixelSize: XY = {x: 1, y: 1};

	// buttons: number = BUTTON.PRIMARY;
	get buttons(): number {
		return this.#windowMouse.buttons;
	}

	set buttons(value: number) {
		this.#windowMouse.buttons = value;
	}

	// Private properties

	#windowMouse: WindowMouse;
	#state: DragState = {
		...newMovement({x: 0, y: 0}),
		buttons: 0,
		isClicked: new Array(16).fill(false) as FixedLengthArray<16, boolean>
	};

	#updateState(...states: Partial<DragState>[]) {
		for (const nextState of states) {
			this.#state = {...this.#state, ...nextState};
		}
		this.onStateChange?.(null, this.state);
		this.onUpdate?.(null, this.state);
	}

	#dragStartHandler(e: MouseEvent) {
		if (!this.enabled) return;
		if (this.#windowMouse.checkMulti(e)) return;
		this.#windowMouse.onButtonChange = this.#move.bind(this);
		this.#windowMouse.onMove = this.#move.bind(this);
		this.#windowMouse.onEnd = this.#end.bind(this);
		this.#windowMouse.dragStartHandler(e);
		this.#start(e);
	}

	#start(e: MouseEvent) {
		this.#updateState(updateMovement(this.state, {x: e.clientX, y: e.clientY}), getClicked(e.buttons));
		this.beforeStart?.(e, this.state);
		this.onStart?.(e, this.state);
	}

	#move(e: MouseEvent) {
		this.#updateState(updateMovement(this.state, {x: e.clientX, y: e.clientY}), getClicked(e.buttons));
		this.beforeMove?.(e, this.state);
		this.onMove?.(e, this.state);
	}

	#end(e: MouseEvent | null) {
		if (e) this.#updateState(updateMovement(this.state, {x: e.clientX, y: e.clientY}), getClicked(e?.buttons ?? 0));
		this.beforeEnd?.(e, this.state);
		this.onEnd?.(e, this.state);
	}

	#detach() {
		this.#windowMouse.detach();
	}

	// Property accessors

	get state(): DragState {
		return {...this.#state};
	}

	get xy(): XY {
		return xyOf(this.#state);
	}

	set xy(xy: XY) {
		const newMvmt = newMovement(xy, UnitType.VALUE, this.#state);
		this.#updateState(newMvmt);
	}

	// Method accessors (read-only)

	get detach() {
		return this.#detach;
	}

	get dragStartHandler() {
		return this.#dragStartHandler.bind(this);
	}

	get setHandlers() {
		return this.#setHandlers;
	}
}

export default Draggable;
