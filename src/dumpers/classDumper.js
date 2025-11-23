import { FUNCTIONS } from '../config/functions.js';
import { IL2CPPCore } from '../core/il2cpp.js';
import { Formatters } from '../utils/formatters.js';
import { FieldDumper } from './fieldDumper.js';
import { PropertyDumper } from './propertyDumper.js';
import { MethodDumper } from './methodDumper.js';

export class ClassDumper {
    static dumpClasses(maxTypes = 100) {
        let typeIndex = 0;

        while (true) {
            let type = null;

            try {
                type = FUNCTIONS.getTypeInfo(typeIndex);
            } catch (e) {
                break;
            }

            if (type.isNull()) {
                console.log(`// pizda: ${typeIndex}`);
                break;
            }

            let ns = "";
            let name = "unnamed_class";

            try {
                let nsPtr = FUNCTIONS.klassGetNamespaze(type);
                if (!nsPtr.isNull()) {
                    ns = nsPtr.readUtf8String() || "";
                }

                let namePtr = FUNCTIONS.klassGetName(type);
                if (!namePtr.isNull()) {
                    name = namePtr.readUtf8String() || "unnamed_class";
                }
            } catch (e) {}

            if (name.includes("__StaticArrayInitTypeSize")) {
                typeIndex++;
                continue;
            }

            try {
                FUNCTIONS.klassSetupMethods(type);
            } catch (e) {}

            // Class attributes
            let ClassAttrs = Formatters.GetClassAttrs(type);

            // Module name
            const moduleName = IL2CPPCore.getModuleNameFromKlass(type);
            if (moduleName && moduleName.length > 0) {
                console.log(`// Module: ${moduleName}.dll`);
            } else {
                console.log(`// Module: TOTAL ZRADA`);
            }

            console.log(`// TypeDefinitionIndex: ${typeIndex}`);
            console.log(`// Namespace: ${ns}`);
            console.log(`// Fullname: ${ns}.${name}`);

            let extendsList = IL2CPPCore.getExtendsListViaAPI(type);
            if (extendsList.length > 0) {
                console.log(`${ClassAttrs} ${name} : ${extendsList.join(', ')} \n{`);
            } else {
                console.log(`${ClassAttrs} ${name} \n{`);
            }

            try {
                FieldDumper.dumpFields(type);
            } catch (e) {}

            try {
                PropertyDumper.dumpProperties(type);
            } catch (e) {}

            try {
                MethodDumper.dumpMethods(type);
            } catch (e) {}

            console.log("}\n");

            typeIndex++;

            if (typeIndex > maxTypes) {
                console.log("// test array done");
                break;
            }
        }

        console.log(`// Dumped!\n`);
    }
}