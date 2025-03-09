import {onUnmounted, ref, type Ref} from "vue";
import draggable, {DraggableReturn} from "../core/draggable.ts";
import {DraggableHandlers, DraggableState} from "../core/types.ts";

export type UseDraggable = (handlers: DraggableHandlers) => { mouseDownHandler: DraggableReturn["mouseDownHandler"], stateRef: Ref<DraggableState> };

const useDraggable: UseDraggable = (handlers: DraggableHandlers) => {
	const stateRef = ref<DraggableState>({});
	const intf = {
		get<StateKey extends keyof DraggableState>(key: StateKey) {
			return stateRef.value[key];
		},
		set<StateKey extends keyof DraggableState>(key: StateKey, value: DraggableState[StateKey]) {
			stateRef.value[key] = value;
		}
	};
	const { mouseDownHandler, unmountHandler } = draggable(handlers, intf);
	onUnmounted(unmountHandler);
	return {mouseDownHandler, stateRef};
};
export default useDraggable;
