# @superfleb/drag-drop

Draggable element handlers for Vue, React, and Vanilla JS. Uses move/mouseUp events on the window
to prevent drag loss from fast cursor movement.

Example code is TypeScript, but the library does not necessarily require TypeScript.

## Browser Requirements

Requires a browser with ES2017 (ES8) support. Internet Explorer is _not_ supported.

## Usage

This package provides two features: "dragDrop", a full-featured object with absolute and relative
positions from a given start point, and the lower-level "windowMouse", that provides events, but no position or
position-change information.

For Vue and React, use the `useDragDrop` and `useWindowMouse` hooks/composables exported from @superfleb/drag-drop/vue and
@superfleb/drag-drop/react sub-packages. There is also @superfleb/drag-drop/js, which provides a plain-JS wrapper around the
core components that manages state and returns position and distance information.

## Variations

### @superfleb/drag-drop/vue

Vue interface, including internal state management and exposure of a reactive state object.

### @superfleb/drag-drop/react

React interface, including internal state management.

### @superfleb/drag-drop/js

Plain JS interface, including internal state management.

### @superfleb/drag-drop/standalone

Plain JS interface in a `<script>`-tag ready format, exposing dragDrop and windowMouse on a `$dd` global.

### @superfleb/drag-drop/core

Access to the core functions. This is probably not what you need, but it's there if you want it. Using core will require
you to provide your own state handling as well as event handlers.

#### Usage:

