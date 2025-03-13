# @superfleb/draggable

*This document is in progress and may be missing some options and use cases, or be straight-up wrong.*


Draggable element handlers for Vue, React, and Vanilla JS. Uses move/mouseUp events on the window
to prevent drag loss from fast cursor movement.

Example code is TypeScript, but the library does not necessarily require TypeScript.

## Browser Requirements

Requires a browser with ES2022 support. Internet Explorer is _not_ supported.

## Usage

This package provides two features: "draggable", a full-featured object with absolute and relative
positions from a given start point, and the lower-level "windowMouse", that provides events, but no position or
position-change information.

For Vue and React, use the `useDraggable` and `useWindowMouse` hooks/composables exported from @superfleb/draggable/vue
and
@superfleb/draggable/react sub-packages. For plain JS and other uses, use @superfleb/draggable/js and the Draggable and
WindowMouse classes.

## Variations

### @superfleb/draggable/vue

Vue interface, including internal state management and exposure of a reactive state object on Draggable.

#### Draggable Example

```vue
<script setup>
	import useWindowMouse from "@superfleb/draggable/vue";
	import Button from "@superfleb/draggable/core/WindowMouse";

	const styleRef: ref<CSSProperties>({});
	const dragStartHandler = useDraggable({
		// Intercept before start to, e.g., transform the coordinates
		beforeStart(e: MouseEvent) {
			const bounds = e.target.getBoundingClientRect?.();
			if (!bounds) return;
			// Set X/Y coordinates of the box so it moves relative to those.
			// Don't use an arrow function, and "this" will be set to the Draggable object.
			this.xy = {x: bounds.left, y: bounds.top};
		},
		// Handler for when the drag starts, on mousedown.
		onStart(e: MouseEvent) {
			/* ... */
		},
		// Intercept before move to, e.g., transform the coordinates
		beforeMove(e: MouseEvent) {
			/* ... */
		},
		// Handler for when the mouse button is down and the mouse moves, mid-drag.
		onMove(e: MouseEvent) {
			/* ... */
		},
		// Intercept before end to, e.g., transform the coordinates
		beforeEnd(e: MouseEvent) {
			/* ... */
		},
		// Handler for when the drag ends, either due to mouseup or the component unmounting. Event may be null in the case of an unmount.
		onEnd(e: MouseEvent) {
			/* ... */
		},
		// Handler for when the drag ends due to mouseup. Not run when the component unmounts.
		onMouseUp(e: MouseEvent) {
			/* ... */
		},
		// On any update
		onUpdate(e: MouseEvent) {
			/* ... */
		},
	}, BUTTON.primary);
</script>
<template>
	<div class="draggable-box" style="styleRef"></div>
</template>
<style>
	.draggable-box {
		position: absolute;
		width: 50px;
		height: 50px;
		background-color: red;
	}
</style>

```

```vue

<script setup>
	/* useWindowMouse example */
	import useWindowMouse from "@superfleb/draggable/vue";

	const styleRef: ref<CSSProperties>
	({});
	const {dragStartHandler} = useWindowMouse({
		// Handler run when the drag begins.
		onStart: (e: MouseEvent) => { /* ... */
		},
		// Handler run when the mouse moves during a drag.
		onMove: (e: MouseEvent) => {
			// Centers the DIV on the mouse cursor.
			styleRef.value = {left: `${e.clientX + 25}px`, top: `${e.clientY + 25}px`};
			/* ... */
		},
		// Handler run when the mouse button is released or when the component unmounts. This happens any time move events will no longer be handled.
		onEnd: (e: MouseEvent | null) => { /* ... */
		},
		// Handler run when the mouse button is released. Does not trigger when the drag ends because the component is unmounted.
		onMouseUp: (e: MouseEvent) => { /* ... */
		},
	}, Button.primary);
</script>
<template>
	<div class="draggable-box" style="styleRef"></div>
</template>
<style>
	.draggable-box {
		position: absolute;
		width: 50px;
		height: 50px;
		background-color: red;
	}
</style>

```

### @superfleb/draggable/react

React interface, including internal state management.

### @superfleb/draggable/js

Plain JS interface, including internal state management.

### @superfleb/draggable/standalone

Plain JS interface in a `<script>`-tag ready format, exposing `draggable` and `windowMouse` on a `$dd` global.

### @superfleb/draggable/core

Access to the core functions. This is probably not what you need, but it's there if you want it. Using core will require
you to provide your own state handling as well as event handlers.

#### Usage:

