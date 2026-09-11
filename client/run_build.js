import { build } from 'vite';

console.log('Initiating Vite programmatic build...');
try {
  await build({
    root: '.',
    logLevel: 'info',
    build: {
      emptyOutDir: false,
    }
  });
  console.log('✅ VITE BUILD SUCCESSFUL!');
  process.exit(0);
} catch (err) {
  console.error('❌ VITE BUILD FAILED:', err);
  process.exit(1);
}
