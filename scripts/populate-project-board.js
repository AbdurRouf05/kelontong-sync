const { execSync } = require('child_process');

const missingIssues = [7, 8, 10, 11, 12, 13, 15, 16, 17, 18, 19, 20, 22, 23, 24, 25, 26, 27, 29];
const projectId = 'PVT_kwHOD2NqCM4BYK59';
const fieldId = 'PVTSSF_lAHOD2NqCM4BYK59zhTSmAM'; // Status
const doneOptionId = '98236657'; // Done column
const owner = 'AbdurRouf05';
const repo = 'kelontong-sync';

function run(cmd) {
  try {
    // Pass empty GITHUB_TOKEN in Node's environment options cleanly
    return execSync(cmd, { 
      stdio: 'pipe', 
      env: { ...process.env, GITHUB_TOKEN: '' } 
    }).toString().trim();
  } catch (error) {
    console.error(`Error running command: ${cmd}`);
    if (error.stderr) console.error(error.stderr.toString());
    return null;
  }
}

async function main() {
  console.log('=== KELONTONGSYNC GITHUB PROJECTS AUTO-POPULATOR ===');
  console.log(`Project ID: ${projectId}`);
  console.log(`Adding ${missingIssues.length} issues to Project board...\n`);

  for (let i = 0; i < missingIssues.length; i++) {
    const num = missingIssues[i];
    const url = `https://github.com/${owner}/${repo}/issues/${num}`;
    const progress = `[${i + 1}/${missingIssues.length}]`;
    
    console.log(`${progress} Adding Issue #${num} to project...`);
    const addCmd = `gh project item-add 3 --owner "${owner}" --url "${url}" --format json`;
    const addRes = run(addCmd);
    
    if (addRes) {
      try {
        const item = JSON.parse(addRes);
        const itemId = item.id;
        console.log(`  ✓ Added item ID: ${itemId}`);
        
        console.log(`  Editing status of item to "Done"...`);
        const editCmd = `gh project item-edit --id "${itemId}" --field-id "${fieldId}" --project-id "${projectId}" --single-select-option-id "${doneOptionId}" --format json`;
        const editRes = run(editCmd);
        
        if (editRes) {
          console.log(`  ✓ Status updated to "Done".`);
        } else {
          console.error(`  ❌ Failed to edit status.`);
        }
      } catch (err) {
        console.error(`  ❌ Failed to parse JSON response:`, err.message);
      }
    } else {
      console.error(`  ❌ Failed to add issue to project.`);
    }

    // Small delay to prevent hitting GitHub rate limits
    await new Promise(resolve => setTimeout(resolve, 800));
  }

  console.log('\n=== ALL COMPLETED! ===');
  console.log('Your GitHub Project board is now fully populated and up-to-date!');
}

main();
