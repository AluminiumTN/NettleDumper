import { FUNCTIONS } from '../config/functions.js';
import { CONSTANTS } from '../config/constants.js';
import { IL2CPPCore } from '../core/il2cpp.js';
import { TypeResolver } from '../core/types.js';
import { Formatters } from '../utils/formatters.js';

export class FieldDumper {
    static FieldGetName(field) {
        if (field.isNull()) return "error_in_field";

        try {
            let namePointer = FUNCTIONS.FieldGet_Name(field);
            if (!namePointer.isNull()) {
                let fieldName = namePointer.readUtf8String();
                if (fieldName !== null && fieldName.length > 0) {
                    let identifierMatch = fieldName.match(/<([a-zA-Z_][a-zA-Z0-9_]*)>/);
                    if (identifierMatch && identifierMatch[1]) {
                        return `<${identifierMatch[1]}>`;
                    }

                    let cleanMatch = fieldName.match(/^([a-zA-Z_][a-zA-Z0-9_]*)/);
                    if (cleanMatch && cleanMatch[1]) {
                        return cleanMatch[1];
                    }

                    let trimmedName = fieldName.trim();
                    let printableChars = trimmedName.match(/[ -~]/g);
                    if (printableChars && printableChars.length > trimmedName.length / 2) {
                        return trimmedName;
                    }

                    return fieldName;
                }
            }
        } catch (error) {}

        return "error_in_field";
    }

    static GetFieldType(field) {
        if (field.isNull()) return "unknown_type_null";

        try {
            let typePtr = FUNCTIONS.FieldGetReturn_Type(field);
            if (typePtr.isNull()) {
                return "null_type_ptr";
            }

            let resolvedType = TypeResolver.resolveGenericType(typePtr);
            return resolvedType;
        } catch (error) {
            return "error_type";
        }
    }

    static dumpFields(type) {
        let iterPtr = Memory.alloc(Process.pointerSize);
        iterPtr.writePointer(ptr(0));
        let fieldIndex = 0;
        let hasPrintedHeader = false;

        while (true) {
            let field = FUNCTIONS.klassGetFields(type, iterPtr);
            if (field.isNull()) break;

            if (!hasPrintedHeader) {
                console.log("\t// Fields:\n");
                hasPrintedHeader = true;
            }

            try {
                let fieldName = this.FieldGetName(field);
                let fieldType = this.GetFieldType(field);
                let fieldAttrs = Formatters.GetFieldAttrs(field);
                let offset = FUNCTIONS.FieldGetOffset(field);

                if (fieldType.includes("__StaticArrayInitTypeSize") ||
                    /^[0-9A-F]{40}$/.test(fieldName) ||
                    fieldName.includes("__StaticArrayInitTypeSize")) {
                    continue;
                }

                let enumstat = IL2CPPCore.isRealEnum(type);
                let attrsF = IL2CPPCore.FieldGetFlags(field);
                let output;

                if ((attrsF & CONSTANTS.FIELD_ATTRIBUTE.LITERAL) && enumstat) {
                    try {
                        const outPtr = Memory.alloc(8);
                        FUNCTIONS.StaticFieldGetValue(field, outPtr);
                        const val = outPtr.readS32();
                        output = `\t${fieldAttrs} ${fieldType} ${fieldName} = ${val}; // Offset: 0x${offset.toString(16).toUpperCase()}`;
                    } catch (valueerror) {
                        output = `\t${fieldAttrs} ${fieldType} ${fieldName} = /* read error */; // Offset: 0x${offset.toString(16).toUpperCase()}`;
                    }
                } else {
                    output = `\t${fieldAttrs} ${fieldType} ${fieldName}; // Offset: 0x${offset.toString(16).toUpperCase()}`;
                }

                console.log(output);
            } catch (fieldError) {
                console.log(`\t// Field ${fieldIndex} error`);
            }

            fieldIndex++;
        }

        if (hasPrintedHeader) {
            console.log("");
        }
    }
}