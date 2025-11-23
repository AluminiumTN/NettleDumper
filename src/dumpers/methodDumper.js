import { FUNCTIONS, basePtr } from '../config/functions.js';
import { OFFSETS } from '../config/offsets.js';
import { TypeResolver } from '../core/types.js';
import { Formatters } from '../utils/formatters.js';

export class MethodDumper {
    static dumpMethods(type) {
        try {
            let methodCount = type.add(OFFSETS.METHOD.COUNT).readU16();
            let methodStartPtr = type.add(OFFSETS.METHOD.START_PTR).readPointer();

            if (methodStartPtr.isNull() || methodCount === 0) {
               // console.log(`\t// Methods: NONE\n`);
                return;
            }

            console.log("\t// Methods:\n");

            for (let j = 0; j < methodCount; j++) {
                try {
                    let methodInfoPtr = methodStartPtr.add(j * OFFSETS.METHOD.INFO_PTR_SIZE).readPointer();
                    if (methodInfoPtr.isNull()) continue;

                    let methodName = "unnamed_method";
                    try {
                        let methodNamePtr = FUNCTIONS.methodGetName(methodInfoPtr);
                        if (!methodNamePtr.isNull()) {
                            methodName = methodNamePtr.readUtf8String() || "unnamed_method";
                        }
                    } catch (e) {}

                    try {
                        let rvaPtr = methodInfoPtr.add(OFFSETS.METHOD.RVA).readPointer();
                        if (!rvaPtr.isNull()) {
                            let rva = rvaPtr.sub(basePtr);
                            console.log(`\t// RVA: 0x${rva.toString(16).toUpperCase()}`);
                        } else {
                            console.log(`\t// RVA: -1`);
                        }
                    } catch (e) {}

                    let methodFlagsStr = "";
                    try {
                        let attrsF = methodInfoPtr.add(OFFSETS.METHOD.FLAGS).readShort();
                        methodFlagsStr = Formatters.getMethodAttrs(attrsF);
                    } catch (e) {
                        methodFlagsStr = "public";
                    }

                    let returnTypeStr = "void";
                    try {
                        let returnTypePtr = FUNCTIONS.methodGetReturnType(methodInfoPtr);
                        if (!returnTypePtr.isNull()) {
                            returnTypeStr = TypeResolver.resolveGenericType(returnTypePtr);
                        }
                    } catch (e) {}

                    let paramsStr = "";
                    try {
                        let paramCount = FUNCTIONS.methodGetParamCount(methodInfoPtr);
                        for (let k = 0; k < paramCount; k++) {
                            let paramType = "unknown";
                            let paramName = `P_${k}`;

                            try {
                                let paramTypePtr = FUNCTIONS.methodGetParam(methodInfoPtr, k);
                                if (!paramTypePtr.isNull()) {
                                    paramType = TypeResolver.resolveGenericType(paramTypePtr);
                                }

                                try {
                                    let paramNamePtr = FUNCTIONS.methodGetParamName(methodInfoPtr, k);
                                    if (!paramNamePtr.isNull()) {
                                        let temp = paramNamePtr.readUtf8String();
                                        if (temp && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(temp)) {
                                            paramName = temp;
                                        }
                                    }
                                } catch (e) {}
                            } catch (e) {}

                            paramsStr += `${paramType} ${paramName}`;
                            if (k < paramCount - 1) paramsStr += ", ";
                        }
                    } catch (e) {}

                    console.log(`\t${methodFlagsStr} ${returnTypeStr} ${methodName}(${paramsStr});`);
                    console.log("");
                } catch (e) {}
            }
        } catch (e) {
            console.log(`\t// Methods: ERROR\n`);
        }
    }
}