import {MouseEvent} from "react";
import WindowMouse from "./WindowMouse.ts";
import {
	DraggableEventHandler,
	DraggableEventHandlerEventName,
	DraggableHandler,
	DraggableHandlerEventName,
	draggableHandlerNames,
	DraggableHandlers,
	DragState,
	FixedLengthArray,
	Limits,
	Movement,
	PixelMovement,
	UnitType,
	WithOptionalDraggableHandlers,
	XY
} from "./types.ts";
import {Button} from "./enums.ts";
import {mouseEventFromTouchEvent} from "./mouseEventFromTouchEvent.ts";

const xyOf = (obj: any, keys: { x: string, y: string } = {x: "x", y: "y"}): XY => ({x: obj[keys.x], y: obj[keys.y]});

const newDefaultPixelMovement = (): PixelMovement => ({
	// x, y in pixels relative to starting x and y in pixels (spx, spy)
	pxX: 0,
	pxY: 0,

	// Starting x, y in pixels. What was passed in on initialization divided by pixelSize
	pxStartX: 0,
	pxStartY: 0,

	// Pixel size (multiplier) used to calculate pixels
	pixelSizeX: 1,
	pixelSizeY: 1,

	// Pixel delta/distance since last event
	pxDeltaX: 0,
	pxDeltaY: 0,

	// Client (window, absolute) x, y
	pxClientX: null,
	pxClientY: null,
})

const newDefaultMovement = (): Movement => ({
	// x, y relative to starting x and y (sx, sy)
	x: 0,
	y: 0,

	// Starting x, y. What was passed in on initialization
	startX: 0,
	startY: 0,

	// Delta/distance since last event
	deltaX: 0,
	deltaY: 0,

	...newDefaultPixelMovement(),
});

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

function getButtonStates(buttons: number = 0): { buttons: number, buttonStates: FixedLengthArray<16, boolean> } {
	return {
		buttons, buttonStates: Array.from(function* () {
			let bit = 0;
			// tslint:disable-next-line:no-bitwise
			while (bit < 16) yield !!(buttons & (2 ** bit++));
		}()) as FixedLengthArray<16, boolean>
	};
}

class Draggable implements WithOptionalDraggableHandlers {
	constructor() {
		this.#windowMouse = new WindowMouse();
	}

	// Mouse event handlers
	beforeStart: null | DraggableEventHandler = null;
	onStart: null | DraggableEventHandler = null;
	// Note that "move" events only trigger on during-drag moves and not on initial click or start. If you need both
	// (you often will), use "Change" instead.
	beforeMove: null | DraggableEventHandler = null;
	onMove: null | DraggableEventHandler = null;
	beforeEnd: null | DraggableHandler = null;
	onEnd: null | DraggableHandler = null;
	beforeMouseUp: null | DraggableEventHandler = null;
	onMouseUp: null | DraggableEventHandler = null;

	// State event handlers
	beforeBoundsFail: null | DraggableHandler = null;
	onBoundsFail: null | DraggableHandler = null;
	// "Change" events only trigger as the result of an interactive action, not a property set.
	// Prefer "change" over update, as change only happens once per action, while "update" happens every time the
	// state changes, even due to handler side-effects.
	beforeChange: null | DraggableHandler = null;
	onChange: null | DraggableHandler = null;
	beforeUpdate: null | DraggableHandler = null;
	onUpdate: null | DraggableHandler = null;

	// Redundant "adapter" events are for use in adapters
	adapterBeforeStart: null | DraggableEventHandler = null;
	adapterOnStart: null | DraggableEventHandler = null;
	adapterBeforeMove: null | DraggableEventHandler = null;
	adapterOnMove: null | DraggableEventHandler = null;
	adapterBeforeMouseUp: null | DraggableEventHandler = null;
	adapterOnMouseUp: null | DraggableEventHandler = null;
	adapterBeforeEnd: null | DraggableHandler = null;
	adapterOnEnd: null | DraggableHandler = null;

	adapterBeforeChange: null | DraggableHandler = null;
	adapterOnChange: null | DraggableHandler = null;
	adapterBeforeUpdate: null | DraggableHandler = null;
	adapterOnUpdate: null | DraggableHandler = null;
	adapterBeforeBoundsFail: null | DraggableHandler = null;
	adapterOnBoundsFail: null | DraggableHandler = null;

	#setHandlers(handlers: DraggableHandlers, clearUnset = true) {
		for (const handlerName of draggableHandlerNames) {
			if (handlers[handlerName]) {
				(this as any)[handlerName] = handlers[handlerName];
			} else if (clearUnset) {
				(this as any)[handlerName] = null;
			}
		}
	}

	// Options
	enabled = true;
	#pixelSize: XY = {x: 1, y: 1};
	#limit: XY<number> & { unit: UnitType } = {x: Infinity, y: Infinity, unit: UnitType.VALUE};
	buttons: number = Button.PRIMARY;

	// Private properties
	#windowMouse: WindowMouse;
	#state: DragState = {
		...newDefaultMovement(),
		buttons: 0,
		buttonStates: new Array(16).fill(false) as FixedLengthArray<16, boolean>,
		inDrag: false,
	};

	#events(names: (DraggableEventHandlerEventName | DraggableHandlerEventName)[], initiatingEvent: MouseEvent | null) {
		const prefixes = ["adapterBefore", "before", "adapterOn", "on"] as const;
		for (const prefix of prefixes) {
			for (const name of names) {
				const prefixed = prefix + name[0].toUpperCase() + name.slice(1) as keyof DraggableHandlers;
				if (prefixed in this && typeof this[prefixed] === "function") {
					this[prefixed](initiatingEvent, this.#state, this);
				}
			}
		}
	}

	#xyToNewMovement(xy: XY = {x: 0, y: 0}, startingUnit: UnitType = UnitType.VALUE): Movement {
		const startingPx: XY = this.#resolveToUnits(xy, startingUnit, UnitType.PIXEL);
		const pxMovement: PixelMovement = {
			...newDefaultPixelMovement(),
			...xy,

			pxX: startingPx.x,
			pxY: startingPx.y,

			pxStartX: startingPx.x,
			pxStartY: startingPx.y,

			pixelSizeX: this.#pixelSize.x,
			pixelSizeY: this.#pixelSize.y,
		};
		return pxToMovement(pxMovement);
	}

	#resolveToUnits(xy: XY, unitIn: UnitType, unitOut: UnitType = UnitType.VALUE): XY {
		if (unitIn === unitOut) return xyOf(xy);
		const size = {x: this.#state.pixelSizeX, y: this.state.pixelSizeY};
		const factor: XY = (unitIn === UnitType.VALUE) ? size : {x: 1 / size.x, y: 1 / size.y};
		return {x: xy.x * factor.x, y: xy.y * factor.y};
	}

	#boundsCheck(movement: Movement) {
		if (movement.x < this.#limit.x[0] || movement.x > this.#limit.y) {

		}
	}

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

			pixelSizeX: this.#pixelSize.x,
			pixelSizeY: this.#pixelSize.y,

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
		this.#events(["update"], e);
	}

	#resetState(movement: Partial<DragState>) {
		this.#state = {
			...this.#state,
			...movement,
		};
		this.#events(["change", "update"], null);
	}

	#dragStartHandler(e: MouseEvent | TouchEvent) {
		if (!this.enabled) return;
		if (e instanceof MouseEvent && this.#windowMouse.checkMulti(e)) return;

		const mouseEvent = (e instanceof TouchEvent) ? mouseEventFromTouchEvent(e) : e as MouseEvent;
		if (!mouseEvent) throw new Error("Unable to get mouse event from event given to dragStartHandler");

		this.#windowMouse.onButtonChange = (ee: MouseEvent) => this.#move(ee);
		this.#windowMouse.onMove = (ee: MouseEvent) => this.#move(ee);
		this.#windowMouse.onEnd = (ee: MouseEvent) => this.#end(ee);
		this.#windowMouse.onMouseUp = (ee: MouseEvent) => this.#events(["mouseUp"], ee);
		this.#windowMouse.dragStartHandler(e);
		this.#start(mouseEvent);
	}

	#start(e: MouseEvent) {
		this.#updateState(e);
		this.#events(["start", "change"], e);
	}

	#move(e: MouseEvent) {

		this.#updateState(e);
		this.#events(["move", "change"], e);
	}

	#end(e: MouseEvent | null) {
		this.#resetState({pxClientX: null, pxClientY: null, inDrag: false});
		this.#events(["end", "change"], e);
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
		let newXy = xyOf(xy);
		if (typeof newXy.x !== "number" || typeof newXy.y !== "number") {
			console.error("Attempt to set draggable.xy to a non-numeric value. Defaulting to {x:0, y:0}, Offending value:", xy);
			newXy = {x: 0, y: 0};
		}
		this.#resetState(this.#xyToNewMovement(newXy, UnitType.VALUE));
	}

	get pxXy() {
		return {x: this.#state.pxX, y: this.#state.pxY};
	}

	set pxXy(xy: XY) {
		let newXy = xy;
		if (typeof xy.x !== "number" || typeof xy.y !== "number") {
			console.error("Attempt to set draggable.pxXy to a non-numeric value. Defaulting to {x:0, y:0}. Offending value:", xy);
			newXy = {x: 0, y: 0};
		}
		this.#resetState(this.#xyToNewMovement(newXy, UnitType.PIXEL));
	}

	get pixelSize() {
		return this.#pixelSize;
	}

	set pixelSize(xyOrSize: XY | number) {
		let xy;
		if (typeof xyOrSize === "number") {
			this.#pixelSize = {x: xyOrSize, y: xyOrSize};
			return;
		}
		if (!(typeof xyOrSize.x === "number" && typeof xyOrSize.y === "number")) {
			console.error("Attempt to set draggable.pixelSize to a non-numeric value. Defaulting to {x:1, y:1}. Offending value:", xyOrSize);
		}
		this.#pixelSize = xyOrSize;
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

	get limit() {
		return this.#limit;
	}

	set limit(lim: Partial<Limits>) {
		const limit = {unit: UnitType.VALUE, x: [-Infinity, Infinity], y: [-Infinity, Infinity], ...lim};
		if (limit.x[0] > limit.x[1]) limit.x = [limit.x[1], limit.x[0]];
		if (limit.y[0] > limit.y[1]) limit.y = [limit.y[1], limit.y[0]];
		this.#limit = limit;
	}

}

export default Draggable;
