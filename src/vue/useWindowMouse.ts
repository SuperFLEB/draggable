import {onUnmounted, Ref, ref} from "vue";
import windowMouse from "../core/windowMouse.ts";
import type {DraggableState, StateInterface, WindowMouseHandlers, WindowMouseResponse} from "../core/types.ts";

const useWindowMouse = (handlers: WindowMouseHandlers): {
	mouseDownHandler: WindowMouseResponse["mouseDownHandler"],
	stateRef: Ref<DraggableState>
} => {
	const stateRef = ref<DraggableState>({});
	const intf: StateInterface<DraggableState> = {
		get<StateKey extends keyof DraggableState>(key: StateKey) {
			return stateRef.value[key];
		},
		set<StateKey extends keyof DraggableState>(key: StateKey, value: DraggableState[StateKey]): void {
			stateRef.value[key] = value;
		}
	};
	const {mouseDownHandler, unmountHandler} = windowMouse(handlers, stateRef);
	onUnmounted(unmountHandler);
	return {mouseDownHandler, stateRef};
};

export default useWindowMouse;
