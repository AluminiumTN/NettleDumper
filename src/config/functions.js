const CONFIG = {
    MODULE_NAME: "GameAssembly.dll",
    MODULE_LOAD_TIMEOUT: 10000,  
    ADDITIONAL_DELAY: 7000,     
};


function waitForModule(moduleName, timeout = 10000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();

        const checkModule = () => {
            try {
                const module = Process.getModuleByName(moduleName);
                if (module) {
                    console.log(`[✓] ${moduleName} loaded at 0x${module.base.toString(16)}`);
                    resolve(module);
                    return;
                }
            } catch (e) {}

            const elapsed = Date.now() - startTime;
            if (elapsed >= timeout) {
                reject(new Error(`Timeout: ${moduleName} not loaded after ${timeout}ms`));
                return;
            }

            setTimeout(checkModule, 100);
        };

        checkModule();
    });
}

console.log("[*] Waiting for GameAssembly.dll to load...");

let basePtr = null;
let FUNCTIONS = null;

export const initPromise = waitForModule(CONFIG.MODULE_NAME, CONFIG.MODULE_LOAD_TIMEOUT).then(module => {
    basePtr = module.base;

    console.log("[*] Initializing IL2CPP functions...");

    FUNCTIONS = {
        // Type & Class
        getTypeInfo: new NativeFunction(basePtr.add(0x0), 'pointer', ['int']),
        klassGetName: new NativeFunction(basePtr.add(0x0), 'pointer', ['pointer']),
        klassGetNamespaze: new NativeFunction(basePtr.add(0x0), 'pointer', ['pointer']),
        klassFromType: new NativeFunction(basePtr.add(0x0), 'pointer', ['pointer']),
        klassSetupMethods: new NativeFunction(basePtr.add(0x0), 'pointer', ['pointer']),
        KlassIsEnum: new NativeFunction(basePtr.add(0x0), 'bool', ['pointer']),
        KlassIsValue: new NativeFunction(basePtr.add(0x0), 'bool', ['pointer']),
        KlassGetParent: new NativeFunction(basePtr.add(0x0), 'pointer', ['pointer']),
        KlassGetType: new NativeFunction(basePtr.add(0x0), 'pointer', ['pointer']),
        ClassGet_Flags: new NativeFunction(basePtr.add(0x0), 'uint32', ['pointer']),
        KlassGetImage: new NativeFunction(basePtr.add(0x0), 'pointer', ['pointer']),

        // Methods
        klassGetMethods: new NativeFunction(basePtr.add(0x0), 'pointer', ['pointer', 'pointer']),
        methodGetName: new NativeFunction(basePtr.add(0x0), 'pointer', ['pointer']),
        methodGetReturnType: new NativeFunction(basePtr.add(0x0), 'pointer', ['pointer']),
        methodGetParamCount: new NativeFunction(basePtr.add(0x0), 'int', ['pointer']),
        methodGetParam: new NativeFunction(basePtr.add(0x0), 'pointer', ['pointer', 'int']),
        methodGetParamName: new NativeFunction(basePtr.add(0x0), 'pointer', ['pointer', 'int']),

        // Fields
        klassGetFields: new NativeFunction(basePtr.add(0x0), 'pointer', ['pointer', 'pointer']),
        FieldGetOffset: new NativeFunction(basePtr.add(0x0), 'pointer', ['pointer']),
        FieldGetReturn_Type: new NativeFunction(basePtr.add(0x0), 'pointer', ['pointer']),
        FieldGet_Flags: new NativeFunction(basePtr.add(0x0), 'uint32', ['pointer']),
        FieldGet_Name: new NativeFunction(basePtr.add(0x0), 'pointer', ['pointer']),
        StaticFieldGetValue: new NativeFunction(basePtr.add(0x0), 'void', ['pointer', 'pointer']),

        // Properties
        KlassGetProps: new NativeFunction(basePtr.add(0x0), 'pointer', ['pointer', 'pointer']),

        // Interfaces
        klassGetInterfaces: new NativeFunction(basePtr.add(0x0), 'pointer', ['pointer', 'pointer']),

        // Type resolution
        TypeGetName: new NativeFunction(basePtr.add(0x0), 'pointer', ['pointer'])
    };

    console.log("[] IL2CPP functions initialized");
    console.log("[*] Waiting additional 7 seconds for game initialization...");
    return new Promise(resolve => {
        setTimeout(() => {
            console.log("[] Ready to dump!");
            resolve({ FUNCTIONS, basePtr });
        }, CONFIG.ADDITIONAL_DELAY);
    });
});

export { FUNCTIONS, basePtr };