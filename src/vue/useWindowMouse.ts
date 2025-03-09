import {onUnmounted, Ref, ref} from "vue";
import windowMouse from "../core/windowMouse.ts";
import type {DragDropState, StateInterface, WindowMouseHandlers, WindowMouseResponse} from "../core/types.ts";

const useWindowMouse = (handlers: WindowMouseHandlers): {
	mouseDownHandler: WindowMouseResponse["mouseDownHandler"],
	stateRef: Ref<DragDropState>
} => {
	const stateRef = ref<DragDropState>({});
	const intf: StateInterface<DragDropState> = {
		get<StateKey extends keyof DragDropState>(key: StateKey) {
			return stateRef.value[key];
		},
		set<StateKey extends keyof DragDropState>(key: StateKey, value: DragDropState[StateKey]): void {
			stateRef.value[key] = value;
		}
	};
	const {mouseDownHandler, unmountHandler} = windowMouse(handlers, stateRef);
	onUnmounted(unmountHandler);
	return {mouseDownHandler, stateRef};
};

export default useWindowMouse;
