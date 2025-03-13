import {onMounted, onUnmounted, ref, shallowRef} from "vue";
import WindowMouse from "../core/WindowMouse.ts";
import type {WindowMouseHandlers} from "../core/types.ts";
import {Button} from "../core/enums.ts";

type UseWindowMouseVueProps = {
	handlers: WindowMouseHandlers;
	buttons: number | typeof Button;
}
type UseWindowMouseVueReturn = {
	dragStartHandler: WindowMouse["dragStartHandler"];
}
type UseWindowMouseVue = (props: UseWindowMouseVueProps) => UseWindowMouseVueReturn;

const useWindowMouse: UseWindowMouseVue = ({handlers = {}, buttons = Button.PRIMARY}) => {
	const windowMouseRef = shallowRef<WindowMouse>(new WindowMouse());
	onMounted(() => {
		windowMouseRef.value.buttons = buttons;
		windowMouseRef.value.setHandlers(handlers);
	});
	onUnmounted(() => {
		windowMouseRef.value.detach();
		windowMouseRef.value = null;
	});
	return {dragStartHandler: windowMouseRef.dragStartHandler};
};

export default useWindowMouse;
