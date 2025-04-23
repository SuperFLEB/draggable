type TouchEventType = "touchstart" | "touchmove" | "touchend" | "touchcancel";
type MouseEventType = "mousedown" | "mousemove" | "mouseup";

let currentTouch: number | null = null;
let downCoords: [number, number] | null = null;
const touchEnds = ["touchend", "touchcancel"];

const typeMap: Record<TouchEventType, MouseEventType> = {
	touchstart: "mousedown",
	touchmove: "mousemove",
	touchend: "mouseup",
	touchcancel: "mouseup",
} as const;


function detectClick(e: TouchEvent) {
	if (e.type === "touchstart") {
		const touch = e.targetTouches[0];
		downCoords = [touch.pageX, touch.pageY];
		return false;
	}
	if (!touchEnds.includes(e.type)) return false;
	if (!downCoords) return false;

	const touch = Array.from(e.changedTouches).find(t => t.identifier === currentTouch);
	const isClick = touch && Math.abs(touch.pageX - downCoords[0]) < 3 && Math.abs(touch.pageY - downCoords[1]) < 3;
	downCoords = null;
	return isClick;
}

function interpret(e: Event) {
	if (e.currentTarget === null || !(e instanceof TouchEvent)) return;
	const isClick = detectClick(e);
	const mouseEvent = mouseEventFromTouchEvent(e);
	if (mouseEvent) {
		e.preventDefault();
		e.currentTarget?.dispatchEvent(mouseEvent);
		if (isClick) {
			const target = (e.target ?? e.currentTarget);
			target.dispatchEvent(new MouseEvent("click", { ...mouseEvent, bubbles: true, button: 1, buttons: 1 }));
		}
	};
}

export function addTouchEventInterpreters(target: EventTarget, abortSignal?: AbortSignal) {
	removeTouchEventInterpreters(target);
	for (const type of Object.keys(typeMap)) {
		target.addEventListener(type, interpret, {signal: abortSignal, passive: false});
	}
}

export function removeTouchEventInterpreters(target: EventTarget) {
	for (const type of Object.keys(typeMap)) {
		target.removeEventListener(type, interpret);
	}
}

export function mouseEventFromTouchEvent(e: TouchEvent) {
	if (e.type !== "touchstart" && currentTouch === null) return null;
	if (e.type === "touchstart") currentTouch = e.targetTouches[0].identifier;

	const touch = Array.from(e.changedTouches).find(t => t.identifier === currentTouch);
	if (!touch) return null;

	const isTouchEnd = touchEnds.includes(e.type);
	if (isTouchEnd) currentTouch = null;

	const {
		bubbles,
		cancelable,
		composed,
		detail,
		view,
		ctrlKey,
		shiftKey,
		altKey,
		metaKey,
	} = e;

	const {
		screenX,
		screenY,
		clientX,
		clientY,
		identifier,
	} = touch;

	const mouseEventOptions = {
		bubbles,
		cancelable,
		composed,
		detail,
		view,
		screenX,
		screenY,
		clientX,
		clientY,
		ctrlKey,
		shiftKey,
		altKey,
		metaKey,
		button: isTouchEnd ? 0 : 1,
		buttons: isTouchEnd ? 0 : 1,
		relatedTarget: null,
	};

	return new MouseEvent(typeMap[e.type as keyof typeof typeMap], mouseEventOptions);
}