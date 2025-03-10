import {DraggableHandlers, WindowMouseEventHandler, WindowMouseHandler, WindowMouseHandlers} from "./types.ts";
import {MouseEvent} from "react";

const handlerNames: (keyof WindowMouseHandlers)[] = ["onStart", "onMove", "onMouseUp", "onEnd"] as const;

export const enum BUTTON {
	NONE = 0,       // No button or un-initialized
	ANY = 65535,    // Any button

	// The first five buttons are supported by most browsers
	PRIMARY = 1,    // Primary button (usually the left button)
	SECONDARY = 2,  // Secondary button (usually the right button)
	MIDDLE = 2 ** 2,     // Auxiliary (usually the mouse wheel button or middle button)

	BUTTON_1 = 1,
	BUTTON_2 = 2,
	BUTTON_3 = 2 ** 2,

	BUTTON_4 = 2 ** 3,   // 4th button (typically the "Browser Back" button)
	BUTTON_5 = 2 ** 4,   // 5th button (typically the "Browser Forward" button)

	// The following are not widely supported but are technically possible
	BUTTON_6 = 2 ** 5,
	BUTTON_7 = 2 ** 6,
	BUTTON_8 = 2 ** 7,
	BUTTON_9 = 2 ** 8,
	BUTTON_10 = 2 ** 9,
	BUTTON_11 = 2 ** 10,
	BUTTON_12 = 2 ** 11,
	BUTTON_13 = 2 ** 12,
	BUTTON_14 = 2 ** 13,
	BUTTON_15 = 2 ** 14,
	BUTTON_16 = 2 ** 15,
};

class WindowMouse {
	onStart: WindowMouseEventHandler | null = null;
	onMove: WindowMouseEventHandler | null = null;
	onMouseUp: WindowMouseEventHandler | null = null;
	onButtonChange: WindowMouseEventHandler | null = null;
	onEnd: WindowMouseHandler | null = null;

	// Use bitwise OR (|) to combine, e.g.:
	//   wm.buttons = BUTTON.PRIMARY | BUTTON.SECONDARY;
	buttons: number = BUTTON.PRIMARY;
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
		this.onButtonChange?.(e);
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
			e.target?.addEventListener("contextmenu", (ee: MouseEvent) => { ee.preventDefault(); }, {signal: this.#endAbort.signal});
			window.addEventListener("contextmenu", (ee: MouseEvent) => { ee.preventDefault(); }, {signal: this.#endAbort.signal});
		}
		window.addEventListener("mousemove", this.#move.bind(this), {signal: this.#endAbort.signal});
		window.addEventListener("mouseup", this.#mouseUp.bind(this), {signal: this.#endAbort.signal});
		this.onStart?.(e);
	}

	#move(e: MouseEvent) {
		if (this.mouseUpOnPhantomMove && !this.#isClicked(e)) {
			this.#mouseUp(e);
			return;
		}
		this.onMove?.(e);
	}

	#mouseUp(e: MouseEvent) {
		// tslint:disable-next-line:no-bitwise
		if (e.buttons & this.buttons) {
			// One of our requested buttons is still being clicked. Do not end.
			return;
		}
		this.#inDrag = false;
		this.onMouseUp?.(e);
		this.onEnd?.(e);
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
		return this.#start.bind(this);
	}

	get detach() {
		return this.#detach;
	}

	get setHandlers() {
		return this.#setHandlers;
	}
}

export default WindowMouse;
