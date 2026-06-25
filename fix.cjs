const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let original = content;

            // Fix malformed emerald classes
            content = content.replace(/bg-emerald-(['" ])/g, 'bg-emerald-600$1');
            content = content.replace(/text-emerald-(['" ])/g, 'text-emerald-600$1');
            content = content.replace(/border-emerald-(['" ])/g, 'border-emerald-500$1');
            content = content.replace(/focus:ring-emerald-(['" ])/g, 'focus:ring-emerald-500$1');
            content = content.replace(/focus:border-emerald-(['" ])/g, 'focus:border-emerald-500$1');
            content = content.replace(/hover:text-emerald-(['" ])/g, 'hover:text-emerald-700$1');
            content = content.replace(/outline-emerald-(['" ])/g, 'outline-emerald-500$1');

            if (content !== original) {
                fs.writeFileSync(fullPath, content);
                console.log('Fixed malformed classes in', fullPath);
            }
        }
    }
}

processDir('resources/js');
console.log('Fix script complete');
