export class TypeMapper {
    static getReadableType(className) {
        const typeMap = {
            "Void": "void",
            "Int32": "int",
            "UInt32": "uint",
            "Int16": "short",
            "UInt16": "ushort",
            "Boolean": "bool",
            "String": "string",
            "Single": "float",
            "Double": "double",
            "Int64": "long",
            "UInt64": "ulong",
            "Byte": "byte",
            "SByte": "sbyte",
            "Char": "char",
            "Object": "object"
        };
        return typeMap[className] || className;
    }
}