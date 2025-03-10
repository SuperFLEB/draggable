import {onMounted, onUnmounted, ref} from "vue";
import WindowMouse, {BUTTON} from "../core/WindowMouse.ts";
import type {WindowMouseHandlers} from "../core/types.ts";

const useWindowMouse = (handlers: WindowMouseHandlers, buttons: number = BUTTON.PRIMARY): {
	dragStartHandler: WindowMouse["dragStartHandler"]
} => {
	const windowMouseRef = ref<WindowMouse>(new WindowMouse());
	onMounted(() => {
		windowMouseRef.current.buttons = buttons;
		windowMouseRef.current.setHandlers(handlers);
	});
	onUnmounted(() => {
		windowMouseRef.value.detach();
		windowMouseRef.value = null;
	});
	return {dragStartHandler: windowMouseRef.dragStartHandler};
};

export default useWindowMouse;
