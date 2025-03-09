import {onUnmounted, ref, type Ref} from "vue";
import dragDrop, {DragDropReturn} from "../core/dragDrop.ts";
import {DragDropHandlers, DragDropState} from "../core/types.ts";

export type UseDragDrop = (handlers: DragDropHandlers) => { mouseDownHandler: DragDropReturn["mouseDownHandler"], stateRef: Ref<DragDropState> };

const useDragDrop: UseDragDrop = (handlers: DragDropHandlers) => {
	const stateRef = ref<DragDropState>({});
	const intf = {
		get<StateKey extends keyof DragDropState>(key: StateKey) {
			return stateRef.value[key];
		},
		set<StateKey extends keyof DragDropState>(key: StateKey, value: DragDropState[StateKey]) {
			stateRef.value[key] = value;
		}
	};
	const { mouseDownHandler, unmountHandler } = dragDrop(handlers, intf);
	onUnmounted(unmountHandler);
	return {mouseDownHandler, stateRef};
};
export default useDragDrop;
