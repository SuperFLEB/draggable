import {onMounted, onUnmounted, ref, type Ref, shallowRef} from "vue";
import {DraggableHandlers, DragState, UseDraggableOptions} from "../core/types.ts";
import {Draggable} from "../core/index.ts";
import {Button} from "../core/enums.ts";

export type UseDraggableVueReturn = {
	dragStartHandler: Draggable["dragStartHandler"];
	stateRef: Ref<DragState>
}

export type UseDraggableVue = (props?: Partial<DraggableHandlers>, options?: Partial<UseDraggableOptions>) => UseDraggableVueReturn;

const useDraggable: UseDraggableVue = (handlers = {}, options = {}) => {
	const {
		buttons = Button.PRIMARY,
		startXy = {x: 0, y: 0},
		preserveState = false,
	} = options;

	const stateRef = ref<DragState>({});
	const draggableRef = shallowRef<Draggable | null>(null);
	if (!draggableRef.value) draggableRef.value = new Draggable();

	const dragStartHandler = (e: MouseEvent) => {
		const handler = draggableRef.value?.dragStartHandler;
		if (!handler) {
			console.error("Drag start handler used before initialization.");
			return;
		}
		handler(e);
	};

	onMounted(() => {
		draggableRef.value.setHandlers(handlers);
		draggableRef.value.adapterOnUpdate = (_: null, newState: DragState) => {
			stateRef.value = {...newState};
		};
		draggableRef.value.xy = startXy;
		stateRef.value = {...draggableRef.value.state};
		draggableRef.value.buttons = buttons;
	});
	onUnmounted(() => {
		draggableRef.value.detach();
		draggableRef.value = null;
		stateRef.value = {};
	});
	return {dragStartHandler, stateRef};
};

export default useDraggable;
