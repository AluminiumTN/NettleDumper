import { initPromise } from './config/functions.js';
import { ClassDumper } from './dumpers/classDumper.js';
import { ModuleDumper } from './dumpers/moduleDumper.js';

console.log("=".repeat(60));
console.log("Nettle Dumper");
console.log("=".repeat(60));
console.log("");

initPromise.then(() => {
    console.log("=".repeat(60));
    console.log("Starting dump...");
    console.log("=".repeat(60));
    console.log("");
    
    ModuleDumper.dumpModulesList();
    
    ClassDumper.dumpClasses(999999);
    
}).catch(error => {
    console.error("Initialization failed:", error.message);
    console.error("[!] Make sure the game is fully loaded!");
});
