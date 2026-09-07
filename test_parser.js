const fs = require('fs');
const path = require('path');

// Logic 1: AutoCAD to CSV
const autoCadInput = `
Point 1: X=712383.745 Y=564669.792 Z=16.984
712387.227, 564669.735
`;
const prefix = 'TOSET';
let startNum = 1;
const code = 'COL';
const defaultElev = '16.984';

console.log("--- TEST 1: AutoCAD to CSV ---");
const lines1 = autoCadInput.trim().split(/\r?\n/);
let currentIndex = parseInt(startNum, 10) || 1;
let result1 = '';

lines1.forEach(line => {
    const matches = line.match(/-?\d+\.\d+|-?\d+/g);
    if (matches && matches.length >= 2) {
        let easting, northing, elevation;
        if (matches.length === 2) {
            easting = matches[0];
            northing = matches[1];
            elevation = defaultElev;
        } else {
            const len = matches.length;
            easting = matches[len - 3];
            northing = matches[len - 2];
            elevation = matches[len - 1];
        }
        result1 += `${prefix}${currentIndex},${code},${easting},${northing},${elevation}\n`;
        currentIndex++;
    }
});
console.log(result1);


// Logic 2: CSV to AutoCAD Script
const moweFilePath = path.join(__dirname, 'MOWE OFADA Site_2026-06-18-12-19-37.csv');
const csvInput = fs.readFileSync(moweFilePath, 'utf8');

console.log("--- TEST 2: CSV to AutoCAD Script ---");
const lines2 = csvInput.trim().split(/\r?\n/);
let result2 = '';
let includeTextLabels = true;
let textHeight = '2.5';

lines2.forEach(line => {
    const parts = line.split(',').map(p => p.trim()).filter(p => p !== '');
    if (parts.length >= 2) {
        let name = '';
        let easting, northing, elevation;

        if (parts.length >= 4) {
            name = parts[0];
            easting = parts[1];
            northing = parts[2];
            elevation = parts[3];
        } else if (parts.length === 3) {
            if (/[a-zA-Z]/.test(parts[0])) {
                name = parts[0];
                easting = parts[1];
                northing = parts[2];
                elevation = '0';
            } else {
                easting = parts[0];
                northing = parts[1];
                elevation = parts[2];
            }
        } else if (parts.length === 2) {
            easting = parts[0];
            northing = parts[1];
            elevation = '0';
        }

        if (easting && northing) {
            result2 += `POINT ${easting},${northing},${elevation}\n`;
            if (includeTextLabels && name) {
                result2 += `TEXT ${easting},${northing},${elevation} ${textHeight} 0 ${name}\n`;
            }
        }
    }
});
console.log(result2);
