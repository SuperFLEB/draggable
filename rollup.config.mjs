import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";
import {dts} from "rollup-plugin-dts";
import del from "rollup-plugin-delete";
import copy from "rollup-plugin-copy";

const externals = {
	"react": ["react"],
	"vue": ["vue"],
	"js": [],
	"core": [],
};

const minify = true;

const sub = (feature) => ([
	{
		input: `src/${feature}/index.ts`,
		output: [
			{
				dir: `dist/${feature}`,
				format: "cjs",
				sourcemap: true,
				entryFileNames: "index.cjs",
				exports: "named",
			},
			{
				dir: `dist/${feature}`,
				format: "esm",
				sourcemap: true,
				entryFileNames: "index.mjs",
			},
		],
		external: externals[feature],
		plugins: [
			typescript({
				tsconfig: "tsconfig.json",
				declaration: true,
				declarationDir: `dist/${feature}/types`,
				inlineSources: true,
			}),
			minify && terser({
				ecma: "2022",
				sourceMap: true,
			})
		],
	},
	{
		input: `dist/${feature}/types/${feature}/index.d.ts`,
		output: [{file: `dist/${feature}/index.d.ts`, format: "es"}],
		plugins: [dts(), del({hook: "buildEnd", verbose: true, targets: `dist/${feature}/types`})],
	},
]);

export default [
	...sub("react"),
	...sub("vue"),
	...sub("js"),
	...sub("core"),
	{
		input: "src/js/index.ts",
		output: {
			format: "iife",
			name: "$dd",
			file: "dist/standalone/superfleb-draggable.js",
			exports: "named",
			sourcemap: true,
		},
		plugins: [
			typescript({
				tsconfig: "tsconfig.json",
				declaration: true,
				declarationDir: `dist/standalone/types`,
				inlineSources: true
			}),
			minify && terser({
				ecma: "2022",
				sourceMap: true,
			}),
			copy({
				targets: [
					{
						src: "src/standalone/index.html",
						verbose: true,
						dest: "dist/standalone/"
					}
				]
			})
		]
	},
	{
		input: `dist/standalone/types/js/index.d.ts`,
		output: [{file: `dist/standalone/fleb-draggable.d.ts`, format: "es"}],
		plugins: [dts(), del({hook: "buildEnd", verbose: true, targets: `dist/standalone/types`})],
	}
];