const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

// Ensure dist directory exists
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

const isWatch = process.argv.includes('--watch');

const commonOptions = {
    entryPoints: ['src/index.js'],
    bundle: true,
    external: ['@alpinejs/morph'],
};

const esmBuild = {
    ...commonOptions,
    format: 'esm',
    outfile: 'dist/module.esm.js',
};

const cjsBuild = {
    ...commonOptions,
    format: 'cjs',
    outfile: 'dist/module.cjs.js',
};

const iifeBuild = {
    ...commonOptions,
    format: 'iife',
    outfile: 'dist/cdn.min.js',
    entryPoints: ['src/browser.js'],
    minify: true,
};

async function build() {
    try {
        if (isWatch) {
            console.log('Watching for changes...');
            const ctx = await esbuild.context({ ...esmBuild });
            await ctx.watch();
        } else {
            console.log('Building...');
            await Promise.all([
                esbuild.build(esmBuild),
                esbuild.build(cjsBuild),
                esbuild.build(iifeBuild),
            ]);
            console.log('Build complete!');
        }
    } catch (error) {
        console.error('Build failed:', error);
        process.exit(1);
    }
}

build();
