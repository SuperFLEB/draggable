import {onMounted, onUnmounted, ref, type Ref} from "vue";
import {DraggableHandlers, DraggableState} from "../core/types.ts";
import {Draggable} from "../core/index.ts";
import {BUTTON} from "../core/WindowMouse.ts";

export type UseDraggable = (handlers: DraggableHandlers, buttons: number) => { dragStartHandler: Draggable["dragStartHandler"], stateRef: Ref<DraggableState> };

const useDraggable: UseDraggable = (handlers: DraggableHandlers, buttons: number = BUTTON.PRIMARY) => {
	const stateRef = ref<DraggableState>({});
	const draggableRef = ref<Draggable>(new Draggable());
	onMounted(() => {
		draggableRef.value.setHandlers(handlers);
		draggableRef.value.onStateChange((_: null, newState: DraggableState) => {
			stateRef.value = newState;
		});
		draggableRef.value.buttons = buttons;
	})
	onUnmounted(() => {
		draggableRef.value.detach();
		draggableRef.value = null;
		stateRef.value = {};
	});
	return {dragStartHandler: draggableRef.value.dragStartHandler, stateRef};
};

export default useDraggable;
