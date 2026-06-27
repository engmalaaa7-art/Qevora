const fs = require('fs');
const path = require('path');

const filePath = 'C:\\Users\\A Al Malah\\.gemini\\antigravity\\brain\\572648b8-d4b3-4219-bc8a-cccc3a476509\\.system_generated\\steps\\300\\output.txt';
const content = fs.readFileSync(filePath, 'utf8');
const data = JSON.parse(content);

const ds = data.designSystems[0];
fs.writeFileSync('C:\\Users\\A Al Malah\\.gemini\\antigravity\\brain\\572648b8-d4b3-4219-bc8a-cccc3a476509\\scratch\\formatted_ds.json', JSON.stringify(ds, null, 2), 'utf8');
console.log('Saved formatted design system to formatted_ds.json');
