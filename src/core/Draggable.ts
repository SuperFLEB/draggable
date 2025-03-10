import {DraggableEventHandler, DraggableHandler, Movement, XY} from "./types.ts";
import WindowMouse from "./WindowMouseOo.ts";

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

	beforeStart: DraggableEventHandler | null = null;
	onStart: DraggableEventHandler | null = null;
	beforeMove: DraggableEventHandler | null = null;
	onMove: DraggableEventHandler | null = null;
	beforeEnd: DraggableHandler | null = null;
	onEnd: DraggableHandler | null = null;

	mutateState = false;

	get state() {
		return this.mutateState ? this.#movement : {...this.#movement};
	}

	get setXy() {
		return this.#setXy;
	}

	#setXy(xy: XY) {
		this.#updateMovement({
			...xy,
			sx: xy.x,
			sy: xy.y,
		});
	}

	get attach() {
		return this.#attach;
	}

	get detach() {
		return this.#detach;
	}

	#windowMouse: WindowMouse;
	#movement: Movement = getNewMovement({x: 0, y: 0});

	#updateMovement(newMovement: Partial<Movement>) {
		const movement = this.state;
		Object.assign(movement, newMovement);
		this.#movement = movement;
	}

	#attach(element: HTMLElement) {
		this.#windowMouse.onStart = this.#start.bind(this);
		this.#windowMouse.onMove = this.#move.bind(this);
		this.#windowMouse.onEnd = this.#end.bind(this);
		this.#windowMouse.attach(element);
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

	#end(e: MouseEvent) {
		this.#updateMovement(getNextMovement(e, this.state));
		this.beforeEnd?.(e, this.state);
		this.onEnd?.(e, this.state);
	}

	#detach() {
		this.#windowMouse.detach();
	}
}

export default Draggable;
