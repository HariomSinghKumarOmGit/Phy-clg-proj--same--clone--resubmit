import fs from 'fs';
import { PDFParse } from 'pdf-parse';

const buffer = fs.readFileSync('Applied Physics-I_ Lab Mannuals.pdf');
const uint8Array = new Uint8Array(buffer);
const parser = new PDFParse({ data: uint8Array });
const result = await parser.getText();
console.log(result.text);
