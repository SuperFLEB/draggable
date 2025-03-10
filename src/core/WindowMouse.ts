import {DraggableHandlers, WindowMouseEventHandler, WindowMouseHandler, WindowMouseHandlers} from "./types.ts";

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
	onEnd: WindowMouseHandler | null = null;

	// Use bitwise OR (|) to combine, e.g.:
	//   wm.buttons = BUTTON.PRIMARY | BUTTON.SECONDARY;
	buttons: number = BUTTON.PRIMARY;

	#endAbort = new AbortController();

	#setHandlers(handlers: WindowMouseHandlers) {
		for (const handlerName of handlerNames) {
			if (handlers[handlerName]) {
				(this as any)[handlerName] = handlers[handlerName];
			}
		}
	}

	#start(e: MouseEvent) {
		// tslint:disable-next-line:no-bitwise
		if (!(e.buttons & this.buttons)) return;

		this.#endAbort.abort();
		this.#endAbort = new AbortController();
		window.addEventListener("mousemove", this.#move.bind(this), {signal: AbortSignal.any([this.#endAbort.signal])});
		window.addEventListener("mouseup", this.#mouseUp.bind(this), {signal: AbortSignal.any([this.#endAbort.signal])});
		this.onStart?.(e);
	}

	#move(e: MouseEvent) {
		this.onMove?.(e);
	}

	#mouseUp(e: MouseEvent) {
		this.onMouseUp?.(e);
		this.onEnd?.(e);
		this.#endAbort.abort();
	}

	#detach(): void {
		this.#endAbort.abort();
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
