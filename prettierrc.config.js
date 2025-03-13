const config = {
	// Format multiline ternaries as:
	// question ?
	//   yes
	// : no
	experimentalTernaries: true,

	// May be overridden by editorconfig
	tabWidth: 4,
	useTabs: true,

	// Semicolons?
	semi: true,

	singleQuote: false,
	quoteProps: "as-needed",

	jsxSingleQuote: false,

	trailingComma: "es5",
	bracketSpacing: true,
	objectWrap: "collapse",
	bracketSameLine: false,
	arrowParens: "always",

	vueIndentScriptAndStyle: true,
	endOfLine: "lf",

	embeddedLanguageFormatting: "auto",
	singleAttributePerLine: false,
};

export default config;