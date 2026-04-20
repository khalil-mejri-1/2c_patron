const fs = require('fs');
const lines = fs.readFileSync('shop.jsx', 'utf8').split('\n');
let inStyle = false;
let keys = [];
let found = [];

lines.forEach((l, i) => {
    if (l.includes('style={{')) {
        inStyle = true;
        keys = [];
    }
    if (inStyle) {
        const m = l.match(/^\s+(\w+):/);
        if (m) {
            const k = m[1];
            if (keys.includes(k)) {
                found.push({ line: i + 1, key: k, content: l.trim() });
            }
            keys.push(k);
        }
        if (l.includes('}}')) {
            inStyle = false;
            keys = [];
        }
    }
});

if (found.length > 0) {
    found.forEach(f => console.log('DUPLICATE at line ' + f.line + ': ' + f.key + ' => ' + f.content));
} else {
    console.log('No duplicate style keys found.');
}
