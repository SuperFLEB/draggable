import {useCallback, useEffect, useRef, useState} from "react";
import {DraggableHandlers, DragState, Movement, UseDraggableOptions, XY} from "../core/types.ts";
import {Draggable} from "../core/index.ts";
import {Button} from "../core/enums.ts";

type UseDraggableReactReturn = {
	dragStartHandler: Draggable["dragStartHandler"],
	state: DragState,
}

type UseDraggableReact = (handlers: Partial<DraggableHandlers>, options: Partial<UseDraggableOptions>) => UseDraggableReactReturn;

const useDraggable: UseDraggableReact = (handlers = {}, options = {}) => {
	const {
		buttons = Button.PRIMARY,
		startXy = {x: 0, y: 0},
		pixelSize = {x: 1, y: 1},
	} = options;

	const [state, updateState] = useState<DragState>({});
	const draggableRef = useRef<Draggable | null>(null);
	draggableRef.current ??= new Draggable();

	const startXyRef = useRef<XY>(startXy);

	useEffect(() => {
		draggableRef.current = new Draggable();
	}, [options]);

	useEffect(() => {
		const draggable = draggableRef.current;
		draggable.setHandlers(handlers);
		draggable.buttons = buttons;
		draggable.pixelSize = pixelSize;
		draggable.adapterOnUpdate = (_: null, newState: Movement) => {
			updateState(newState);
		};
		updateState(draggable.state);

		return () => {
			draggable.detach();
			draggableRef.current = null;
		};
	}, [options]);

	const dragStartHandler = useCallback((e: MouseEvent): void => {
		if (draggableRef.current) return draggableRef.current.dragStartHandler(e);
		console.warn("dragStartHandler used while draggable was not initialized.");
	}, [draggableRef]);

	return {
		dragStartHandler,
		state
	};
};

export default useDraggable;
