export const Button = Object.freeze({
	NONE: 0,       // No button or un-initialized
	ANY: 65535,    // Any button

	// The first five buttons are supported by most browsers
	PRIMARY: 1,         // Primary button (usually the left button)
	SECONDARY: 2,       // Secondary button (usually the right button)
	MIDDLE: 2 ** 2,     // Auxiliary (usually the mouse wheel button or middle button)

	BUTTON_1: 1,
	BUTTON_2: 2,
	BUTTON_3: 2 ** 2,

	BUTTON_4: 2 ** 3,   // 4th button (typically the "Browser Back" button)
	BUTTON_5: 2 ** 4,   // 5th button (typically the "Browser Forward" button)

	// The following are not widely supported but are technically possible
	BUTTON_6: 2 ** 5,
	BUTTON_7: 2 ** 6,
	BUTTON_8: 2 ** 7,
	BUTTON_9: 2 ** 8,
	BUTTON_10: 2 ** 9,
	BUTTON_11: 2 ** 10,
	BUTTON_12: 2 ** 11,
	BUTTON_13: 2 ** 12,
	BUTTON_14: 2 ** 13,
	BUTTON_15: 2 ** 14,
	BUTTON_16: 2 ** 15,
});
