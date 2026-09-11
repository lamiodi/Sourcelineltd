const { ESLint } = require('./node_modules/eslint');

async function main() {
  const eslint = new ESLint();
  const results = await eslint.lintFiles(['src/**/*.{js,jsx}']);
  const formatter = await eslint.loadFormatter('stylish');
  const resultText = formatter.format(results);
  
  if (resultText && resultText.trim().length > 0) {
    console.log(resultText);
  }
  
  const errorCount = results.reduce((sum, r) => sum + r.errorCount, 0);
  const warningCount = results.reduce((sum, r) => sum + r.warningCount, 0);
  console.log(`\n--- ESLINT SUMMARY ---`);
  console.log(`Total Errors: ${errorCount}`);
  console.log(`Total Warnings: ${warningCount}`);
  
  if (errorCount > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('ESLint execution failed:', err);
  process.exit(1);
});
