import { ESLint } from 'eslint';

async function main() {
  console.log('Linting PointConverter.jsx with ESLint 9...');
  const eslint = new ESLint();
  const results = await eslint.lintFiles(['src/pages/PointConverter.jsx']);
  const formatter = await eslint.loadFormatter('stylish');
  const resultText = formatter.format(results);
  if (resultText && resultText.trim()) {
    console.log(resultText);
    const hasErrors = results.some(r => r.errorCount > 0);
    process.exit(hasErrors ? 1 : 0);
  } else {
    console.log('✅ PointConverter.jsx PASSED lint with ZERO errors or warnings!');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Lint runner error:', err);
  process.exit(1);
});
