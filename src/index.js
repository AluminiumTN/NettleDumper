import { initPromise } from './config/functions.js';
import { ClassDumper } from './dumpers/classDumper.js';

console.log("=".repeat(60));
console.log("Nettle Dumper");
console.log("=".repeat(60));
console.log("");

initPromise.then(() => {
    console.log("=".repeat(60));
    console.log("Starting dump...");
    console.log("=".repeat(60));
    console.log("");

    ClassDumper.dumpClasses(999999);
}).catch(error => {
    console.error("Initialization failed:", error.message);
    console.error("[!] Make sure the game is fully loaded!");
});