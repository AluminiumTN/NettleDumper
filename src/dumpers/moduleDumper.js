import { FUNCTIONS } from '../config/functions.js';

export class ModuleDumper {
    static dumpModulesList() {
        console.log("// Modules List:");
        
        try {
            const moduleMap = new Map();
            let typeIndex = 0;
            
            while (true) {
                let type = null;
                try {
                    type = FUNCTIONS.getTypeInfo(typeIndex);
                } catch (e) {
                    break;
                }
                
                if (type.isNull()) break;
                
                try {
                    const imagePtr = FUNCTIONS.KlassGetImage(type);
                    if (!imagePtr.isNull()) {
                        const moduleName = imagePtr.readUtf8String();
                        if (moduleName && moduleName.length > 0) {
                            if (!moduleMap.has(moduleName)) {
                                moduleMap.set(moduleName, typeIndex);
                            }
                        }
                    }
                } catch (e) {}
                
                typeIndex++;
                
                if (typeIndex > 100000) break;
            }
            
            let imageIndex = 0;
            for (const [moduleName, firstTypeIndex] of moduleMap) {
                console.log(`// Image ${imageIndex}: ${moduleName} - ${firstTypeIndex}`);
                imageIndex++;
            }
            
            console.log("");
            
        } catch (error) {
            console.log(`// Error dumping modules list: ${error.message || error}`);
            console.log("");
        }
    }
}
