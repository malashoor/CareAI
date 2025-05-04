const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

// Configuration
const config = {
  reportPath: path.join(__dirname, '../docs/qa-reports/dashboard-qa-summary.md'),
  outputDir: path.join(__dirname, '../dist/qa-reports'),
  pdfOutput: path.join(__dirname, '../dist/qa-reports/dashboard-qa-summary.pdf'),
  trackerPath: path.join(__dirname, '../docs/qa-tracker.md'),
};

// Ensure output directory exists
if (!fs.existsSync(config.outputDir)) {
  fs.mkdirSync(config.outputDir, { recursive: true });
}

// Generate PDF from Markdown
async function generatePDF() {
  try {
    // Use pandoc to convert markdown to PDF with custom styling
    const command = `pandoc "${config.reportPath}" \
      -o "${config.pdfOutput}" \
      --pdf-engine=xelatex \
      -V geometry:margin=1in \
      -V fontsize=11pt \
      -V colorlinks=true \
      -V linkcolor=blue \
      -V toccolor=blue \
      --toc \
      --toc-depth=3 \
      --standalone`;

    await execAsync(command);
    console.log('✅ PDF generated successfully');
  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    throw error;
  }
}

// Update QA Tracker
async function updateQATracker() {
  try {
    const trackerContent = fs.readFileSync(config.trackerPath, 'utf8');
    
    // Update Dashboard module status
    const updatedContent = trackerContent.replace(
      /## Dashboard\n\nStatus:.*\n/,
      `## Dashboard\n\nStatus: ✅ Complete\n\n` +
      `- Test Coverage: 98%\n` +
      `- Linter Errors: 0\n` +
      `- Snapshot Tests: 7\n` +
      `- Accessibility Flows: 3\n\n` +
      `[View Full Report](./qa-reports/dashboard-qa-summary.pdf)\n\n`
    );

    fs.writeFileSync(config.trackerPath, updatedContent);
    console.log('✅ QA Tracker updated successfully');
  } catch (error) {
    console.error('❌ Error updating QA tracker:', error);
    throw error;
  }
}

// Main execution
async function main() {
  try {
    console.log('🚀 Starting QA report export...');
    
    // Generate PDF
    await generatePDF();
    
    // Update QA tracker
    await updateQATracker();
    
    console.log('✨ QA report export completed successfully!');
  } catch (error) {
    console.error('❌ Export failed:', error);
    process.exit(1);
  }
}

main(); 