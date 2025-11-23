import { CONSTANTS } from '../config/constants.js';
import { IL2CPPCore } from '../core/il2cpp.js';
import { FUNCTIONS } from '../config/functions.js';

export class Formatters {
    static GetClassAttrs(type) {
        try {
            const flags = IL2CPPCore.ClassGetFlags(type);
            const isEnum = IL2CPPCore.isRealEnum(type);
            const isValue = !!FUNCTIONS.KlassIsValue(type);
            let out = "";

            const visibility = flags & CONSTANTS.TYPE_ATTRIBUTE.VISIBILITY_MASK;
            switch (visibility) {
                case CONSTANTS.TYPE_ATTRIBUTE.PUBLIC:
                case CONSTANTS.TYPE_ATTRIBUTE.NESTED_PUBLIC:
                    out += "public "; break;
                case CONSTANTS.TYPE_ATTRIBUTE.NOT_PUBLIC:
                case CONSTANTS.TYPE_ATTRIBUTE.NESTED_ASSEMBLY:
                case CONSTANTS.TYPE_ATTRIBUTE.NESTED_FAM_AND_ASSEM:
                    out += "internal "; break;
                case CONSTANTS.TYPE_ATTRIBUTE.NESTED_PRIVATE:
                    out += "private "; break;
                case CONSTANTS.TYPE_ATTRIBUTE.NESTED_FAMILY:
                    out += "protected "; break;
                case CONSTANTS.TYPE_ATTRIBUTE.NESTED_FAM_OR_ASSEM:
                    out += "protected internal "; break;
                default:
                    out += `/*visibility 0x${visibility.toString(16)}*/ `;
            }

            const isInterface = (flags & CONSTANTS.TYPE_ATTRIBUTE.INTERFACE) !== 0;

            if (!isInterface && (flags & CONSTANTS.TYPE_ATTRIBUTE.ABSTRACT) && (flags & CONSTANTS.TYPE_ATTRIBUTE.SEALED)) {
                out += "static ";
            } else {
                if (!isInterface && (flags & CONSTANTS.TYPE_ATTRIBUTE.ABSTRACT)) {
                    out += "abstract ";
                }
            }

            const alreadyStatic = (!isInterface) && (flags & CONSTANTS.TYPE_ATTRIBUTE.ABSTRACT) && (flags & CONSTANTS.TYPE_ATTRIBUTE.SEALED);
            if (!isValue && !isEnum && !isInterface && (flags & CONSTANTS.TYPE_ATTRIBUTE.SEALED) && !alreadyStatic) {
                out += "sealed ";
            }

            if (isInterface) {
                out += "interface ";
            } else if (isEnum) {
                out += "enum ";
            } else if (isValue) {
                out += "struct ";
            } else {
                out += "class ";
            }

            return out.trim();
        } catch (e) {
            return "/*error*/ class";
        }
    }

    static getMethodAttrs(flags) {
        let modifiers = "";
        const access = flags & CONSTANTS.METHOD_ATTRIBUTE.MEMBER_ACCESS_MASK;

        switch (access) {
            case CONSTANTS.METHOD_ATTRIBUTE.PRIVATE: modifiers += "private "; break;
            case CONSTANTS.METHOD_ATTRIBUTE.PUBLIC: modifiers += "public "; break;
            case CONSTANTS.METHOD_ATTRIBUTE.FAMILY: modifiers += "protected "; break;
            case CONSTANTS.METHOD_ATTRIBUTE.ASSEM:
            case CONSTANTS.METHOD_ATTRIBUTE.FAM_AND_ASSEM: modifiers += "internal "; break;
            case CONSTANTS.METHOD_ATTRIBUTE.FAM_OR_ASSEM: modifiers += "protected internal "; break;
            case CONSTANTS.METHOD_ATTRIBUTE.COMPILER_CONTROLLED: modifiers += "/*compiler controlled*/ private"; break;
        }

        if (flags & CONSTANTS.METHOD_ATTRIBUTE.STATIC) modifiers += "static ";

        if (flags & CONSTANTS.METHOD_ATTRIBUTE.ABSTRACT) {
            modifiers += "abstract ";
            if ((flags & CONSTANTS.METHOD_ATTRIBUTE.VTABLE_LAYOUT_MASK) === CONSTANTS.METHOD_ATTRIBUTE.REUSE_SLOT) {
                modifiers += "override ";
            }
        } else if (flags & CONSTANTS.METHOD_ATTRIBUTE.FINAL) {
            if ((flags & CONSTANTS.METHOD_ATTRIBUTE.VTABLE_LAYOUT_MASK) === CONSTANTS.METHOD_ATTRIBUTE.REUSE_SLOT) {
                modifiers += "sealed override ";
            }
        } else if (flags & CONSTANTS.METHOD_ATTRIBUTE.VIRTUAL) {
            if ((flags & CONSTANTS.METHOD_ATTRIBUTE.VTABLE_LAYOUT_MASK) === CONSTANTS.METHOD_ATTRIBUTE.NEW_SLOT) {
                modifiers += "virtual ";
            } else {
                modifiers += "override ";
            }
        }

        if (flags & CONSTANTS.METHOD_ATTRIBUTE.PINVOKE_IMPL) modifiers += "extern ";

        return modifiers.trim();
    }

    static GetFieldAttrs(field) {
        try {
            let attrsF = IL2CPPCore.FieldGetFlags(field);
            if (attrsF === undefined || attrsF === null) attrsF = 0;

            const access = attrsF & 0x7;
            let result = "";

            switch (access) {
                case CONSTANTS.FIELD_ATTRIBUTE.COMPILER_CONTROLLED: result = "/*compiler controlled*/ private "; break;
                case CONSTANTS.FIELD_ATTRIBUTE.PRIVATE: result = "private "; break;
                case CONSTANTS.FIELD_ATTRIBUTE.FAM_AND_ASSEM: result = "internal "; break;
                case CONSTANTS.FIELD_ATTRIBUTE.ASSEMBLY: result = "internal "; break;
                case CONSTANTS.FIELD_ATTRIBUTE.FAMILY: result = "protected "; break;
                case CONSTANTS.FIELD_ATTRIBUTE.FAM_OR_ASSEM: result = "protected internal "; break;
                case CONSTANTS.FIELD_ATTRIBUTE.PUBLIC: result = "public "; break;
                default: result = `/*unknown access ${access}*/ `;
            }

            if (attrsF & CONSTANTS.FIELD_ATTRIBUTE.LITERAL) {
                result += "const ";
            } else {
                if (attrsF & CONSTANTS.FIELD_ATTRIBUTE.STATIC) {
                    result += "static ";
                }
                if (attrsF & CONSTANTS.FIELD_ATTRIBUTE.INIT_ONLY) {
                    result += "ReadOnly ";
                }
            }

            return result.trim();
        } catch (error) {
            return "/*error*/";
        }
    }
}