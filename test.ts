import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");
console.log(Object.keys(pdf));
if (typeof pdf.default === 'function') console.log('default is function');
if (typeof pdf === 'function') console.log('root is function');
