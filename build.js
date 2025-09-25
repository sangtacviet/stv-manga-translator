const fs = require('fs');
const path = require('path');
const srcDir = path.join(__dirname, 'src');
const outDir = path.join(__dirname, 'dist');
const babel = require('@babel/core');
if (!fs.existsSync(outDir)) {
	fs.mkdirSync(outDir);
}

function build() {
	let baseScript = fs.readFileSync(path.join(srcDir, 'base_userscript.js'), 'utf-8');
	let header = fs.readFileSync(path.join(srcDir, 'header.js'), 'utf-8');
	let classCode = fs.readFileSync(path.join(srcDir, 'class.js'), 'utf-8');
	let plugins = fs.readdirSync(path.join(srcDir, 'plugins'))
		.filter(file => file.endsWith('.js'))
		.map(file => fs.readFileSync(path.join(srcDir, 'plugins', file), 'utf-8'))
		.join('\n\n');
	let finalScript = baseScript
		.replace('{{HEADER}}', header)
		.replace('{{CLASS}}', classCode)
		.replace('{{PLUGINS}}', plugins);
	fs.writeFileSync(path.join(outDir, 'stv_manga_translator.user.js'), finalScript, 'utf-8');
	console.log('Build complete: dist/stv_manga_translator.user.js');
	// Minify with Babel without adding extra functions and keeping line breaks
	let minified = babel.transformSync(finalScript, {
		presets: [['@babel/preset-env', { targets: { chrome: '138' }, useBuiltIns: false, modules: false }]],
		minified: true,
		compact: false, // Keep line breaks
	});
	fs.writeFileSync(path.join(outDir, 'stv_manga_translator.user.min.js'), minified.code, 'utf-8');
	console.log('Minified build complete: dist/stv_manga_translator.user.min.js');
}

console.log('Building userscript...');
build();
