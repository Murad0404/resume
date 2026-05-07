const fs = require('fs');
const path = require('path');

const logPath = '/Users/admin/.gemini/antigravity/brain/7cc0f56a-fba9-4911-b2d4-b0265d1db08c/.system_generated/logs/overview.txt';
const content = fs.readFileSync(logPath, 'utf8');

const lines = content.split('\n');

for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const obj = JSON.parse(line);
    if (obj.tool_calls) {
      for (const call of obj.tool_calls) {
        if (call.name === 'write_to_file' || call.name === 'replace_file_content' || call.name === 'multi_replace_file_content') {
          const args = call.args;
          const target = args.TargetFile || args.targetFile;
          if (target && target.includes('PaymentModal.jsx') && args.CodeContent) {
            console.log('Found PaymentModal.jsx write_to_file CodeContent in step', obj.step_index);
            fs.writeFileSync('/Users/admin/Desktop/resume/src/components/PaymentModal.jsx', JSON.parse('"' + args.CodeContent + '"'));
          }
          if (target && target.includes('PromptMarketplace.jsx') && args.CodeContent) {
            console.log('Found PromptMarketplace.jsx write_to_file CodeContent in step', obj.step_index);
            fs.writeFileSync('/Users/admin/Desktop/resume/src/pages/PromptMarketplace.jsx', JSON.parse('"' + args.CodeContent + '"'));
          }
        }
      }
    }
  } catch (err) {
    // Ignore parse errors for non-JSON lines
  }
}
