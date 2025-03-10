type Handler = (e: MouseEvent) => void;
class WindowMouse {
	onStart: Handler | null = null;
	onMove: Handler | null = null;
	onMouseUp: Handler | null = null;
	onEnd: Handler | null = null;

	#endAbort = new AbortController();
	#detachAbort = new AbortController();

	#attachment: HTMLElement | null = null;

	#attach(element: HTMLElement) {
		if (this.#attachment) {
			this.#detach();
		}
		this.#attachment = element;
		this.#detachAbort = new AbortController();
		element.addEventListener("mousedown", this.#start.bind(this), { signal: this.#detachAbort.signal });
	}

	#start(e: MouseEvent) {
		this.#endAbort = new AbortController();
		window.addEventListener("mousemove", this.#move.bind(this), { signal: AbortSignal.any([this.#endAbort.signal, this.#detachAbort.signal ])});
		window.addEventListener("mouseup", this.#mouseUp.bind(this), { signal: AbortSignal.any([this.#endAbort.signal, this.#detachAbort.signal ])});
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
		this.#detachAbort.abort();
	}

	get attach() { return this.#attach }
	get detach() { return this.#detach }
}
export default WindowMouse;
