import {DraggableEventHandler, DraggableHandler, DraggableHandlers, Movement, XY} from "./types.ts";
import WindowMouse, {BUTTON} from "./WindowMouse.ts";
const handlerNames: (keyof DraggableHandlers)[] = ["beforeStart", "onStart", "beforeMove", "onMove", "beforeEnd", "onEnd", "onUpdate"] as const;

const xyOf = (xy: XY) => ({x: xy.x, y: xy.y});
const getNextMovement = (e: MouseEvent, movement: Movement): Movement => {
	const delta = {
		x: e.clientX - movement.cx,
		y: e.clientY - movement.cy,
	};
	return {
		...movement,
		x: movement.x + delta.x,
		y: movement.y + delta.y,
		cx: e.clientX,
		cy: e.clientY,
		dx: delta.x,
		dy: delta.y,
	};
};
const getNewMovement = (xy: XY): Movement => {
	return {
		x: xy.x,
		y: xy.y,
		sx: xy.x,
		sy: xy.y,
		cx: 0,
		cy: 0,
		dx: 0,
		dy: 0
	};
};

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

	mutateState = false;
	enabled = true;

	// buttons: number = BUTTON.PRIMARY;
	get buttons(): number { return this.#windowMouse.buttons; }
	set buttons(value: number) { this.#windowMouse.buttons = value; }

	// Private properties

	#windowMouse: WindowMouse;
	#movement: Movement = getNewMovement({x: 0, y: 0});

	#updateMovement(newMovement: Partial<Movement>) {
		const movement = this.state;
		Object.assign(movement, newMovement);
		this.#movement = movement;
		this.onStateChange?.(null, this.state);
		this.onUpdate?.(null, this.state);
	}

	#dragStartHandler(e: MouseEvent) {
		if (!this.enabled) return;
		this.#windowMouse.onMove = this.#move.bind(this);
		this.#windowMouse.onEnd = this.#end.bind(this);
		this.#windowMouse.dragStartHandler(e);
		this.#start(e);
	}

	#start(e: MouseEvent) {
		this.#updateMovement(getNextMovement(e, this.state));
		this.beforeStart?.(e, this.state);
		this.onStart?.(e, this.state);
	}

	#move(e: MouseEvent) {
		this.#updateMovement(getNextMovement(e, this.state));
		this.beforeMove?.(e, this.state);
		this.onMove?.(e, this.state);
	}

	#end(e: MouseEvent | null) {
		if (e) this.#updateMovement(getNextMovement(e, this.state));
		this.beforeEnd?.(e, this.state);
		this.onEnd?.(e, this.state);
	}

	#detach() {
		this.#windowMouse.detach();
	}

	// Property accessors

	get state(): Movement {
		return this.mutateState ? this.#movement : {...this.#movement};
	}

	get xy(): XY {
		return xyOf(this.#movement);
	}

	set xy(xy: XY) {
		this.#updateMovement({
			...xy,
			sx: xy.x,
			sy: xy.y,
		});
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
