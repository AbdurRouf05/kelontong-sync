const fs = require('fs');
const path = require('path');

const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}\u{2B50}\u{2139}\u{25B6}\u{23F1}-\u{23F3}\u{23E9}-\u{23EC}\u{2934}-\u{2935}\u{21A9}-\u{21AA}\u{203C}\u{2049}\u{2122}\u{00A9}\u{00AE}\u{FE0F}\u{1F1E6}-\u{1F1FF}]/gu;

function removeEmojis(text) {
  return text.replace(emojiRegex, '');
}

const files = [
  'README.md',
  'docs/deployment.md',
  'docs/checklist.md',
  'docs/rencana.md',
  'docs/database.md',
  'docs/user-guide.md'
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    let noEmoji = removeEmojis(content);
    // Clean up empty spaces left behind
    noEmoji = noEmoji.replace(/ +/g, ' '); 
    fs.writeFileSync(filePath, noEmoji);
    console.log(`Cleaned ${file}`);
  }
});
