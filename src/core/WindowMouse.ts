import {WindowMouseEventHandler, WindowMouseHandler, WindowMouseHandlers} from "./types.ts";
import {Button} from "./enums.ts";

const handlerNames: (keyof WindowMouseHandlers)[] = ["onStart", "onMove", "onMouseUp", "onEnd"] as const;

class WindowMouse {
	onStart: WindowMouseEventHandler | null = null;
	onMove: WindowMouseEventHandler | null = null;
	onMouseUp: WindowMouseEventHandler | null = null;
	onButtonChange: WindowMouseEventHandler | null = null;
	onEnd: WindowMouseHandler | null = null;

	// Use bitwise OR (|) to combine, e.g.:
	//   wm.buttons = BUTTON.PRIMARY | BUTTON.SECONDARY;
	buttons: number = Button.PRIMARY;
	suppressContextMenuDuringDrag = true;
	mouseUpOnPhantomMove = true;

	#inDrag = false;
	#endAbort = new AbortController();

	#isClicked(e: MouseEvent): boolean {
		// tslint:disable-next-line:no-bitwise
		return Boolean(e.buttons & this.buttons);
	}

	#setHandlers(handlers: WindowMouseHandlers) {
		for (const handlerName of handlerNames) {
			if (handlers[handlerName]) {
				(this as any)[handlerName] = handlers[handlerName];
			}
		}
	}

	/**
	 * Checks whether the event is another button click while currently in drag
	 * (in which case, handlers should ignore the click).
	 * @private
	 */
	#checkMulti(e: MouseEvent) {
		if (!this.#isClicked(e)) return false;
		if (!this.#inDrag) return false;
		this.onButtonChange?.(e, this);
		return true;
	}

	#start(e: MouseEvent) {
		if (!this.#isClicked(e)) return;
		this.#checkMulti(e);

		if (this.inDrag) return;
		this.#inDrag = true;

		this.#endAbort.abort();
		this.#endAbort = new AbortController();

		if (this.suppressContextMenuDuringDrag) {
			e.target?.addEventListener("contextmenu", (ee: Event) => {
				ee.preventDefault();
			}, {signal: this.#endAbort.signal});
			window.addEventListener("contextmenu", (ee: Event) => {
				ee.preventDefault();
			}, {signal: this.#endAbort.signal});
		}
		window.addEventListener("mousemove", (...args) => this.#move(...args), {signal: this.#endAbort.signal});
		window.addEventListener("mouseup", (...args) => this.#mouseUp(...args), {signal: this.#endAbort.signal});
		this.onStart?.(e, this);
	}

	#move(e: MouseEvent) {
		if (this.mouseUpOnPhantomMove && !this.#isClicked(e)) {
			this.#mouseUp(e);
			return;
		}
		this.onMove?.(e, this);
	}

	#mouseUp(e: MouseEvent) {
		// tslint:disable-next-line:no-bitwise
		if (e.buttons & this.buttons) {
			// One of our requested buttons is still being clicked. Do not end.
			return;
		}
		this.#inDrag = false;
		this.onMouseUp?.(e, this);
		this.onEnd?.(e, this);
		this.#endAbort.abort();
	}

	#detach(): void {
		this.#inDrag = false;
		this.#endAbort.abort();
	}

	get checkMulti() {
		return this.#checkMulti;
	}

	get inDrag() {
		return this.#inDrag;
	}

	get dragStartHandler() {
		return (e: MouseEvent) => this.#start(e);
	}

	get detach() {
		return this.#detach;
	}

	get setHandlers() {
		return this.#setHandlers;
	}
}

export default WindowMouse;
