
const fs = require('fs');
const content = fs.readFileSync('/src/App.tsx', 'utf8');

function checkTags(content) {
  const stack = [];
  const tagRegex = /<(\/?)([a-zA-Z0-9\.]+)(\s+[^>]*)?>/g;
  let match;
  while ((match = tagRegex.exec(content)) !== null) {
    const [full, isClosing, tagName] = match;
    if (tagName === 'img' || tagName === 'input' || tagName === 'br' || tagName === 'hr' || tagName === 'ReferenceLine' || tagName === 'Cell' || tagName === 'XAxis' || tagName === 'YAxis' || tagName === 'CartesianGrid' || tagName === 'Tooltip' || tagName === 'Legend' || tagName === 'Bar' || tagName === 'Area' || tagName === 'Line') {
      if (!isClosing && !full.endsWith('/>')) {
        // Assume these are auto-closing if they don't end with /> and don't have a closing tag
        // Actually Recharts tags usually end with />
      }
      continue;
    }
    if (isClosing) {
      if (stack.length === 0) {
        console.log(`Unmatched closing tag: </${tagName}> at index ${match.index}`);
        continue;
      }
      const last = stack.pop();
      if (last.tagName !== tagName) {
        console.log(`Mismatched tags: <${last.tagName}> at ${last.index} closed by </${tagName}> at ${match.index}`);
      }
    } else if (!full.endsWith('/>')) {
      stack.push({ tagName, index: match.index });
    }
  }
  while (stack.length > 0) {
    const last = stack.pop();
    console.log(`Unclosed tag: <${last.tagName}> at index ${last.index}`);
  }
}

checkTags(content);
