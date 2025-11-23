import { FUNCTIONS } from '../config/functions.js';
import { CONSTANTS } from '../config/constants.js';

export class IL2CPPCore {
    static ClassGetFlags(type) {
        if (type.isNull()) return 0;
        try {
            return FUNCTIONS.ClassGet_Flags(type) >>> 0;
        } catch (e) {
            return 0;
        }
    }

    static isRealEnum(type) {
        try {
            const parent = FUNCTIONS.KlassGetParent(type);
            if (parent.isNull()) return false;

            const parentNamePtr = FUNCTIONS.klassGetName(parent);
            if (parentNamePtr.isNull()) return false;

            const parentName = parentNamePtr.readUtf8String();
            return parentName === "Enum";
        } catch (e) {
            return false;
        }
    }

    static FieldGetFlags(field) {
        if (field.isNull()) return 0;
        try {
            return FUNCTIONS.FieldGet_Flags(field) >>> 0;
        } catch (e) {
            return 0;
        }
    }

    static getModuleNameFromKlass(klassPtr) {
        try {
            if (klassPtr.isNull()) return null;
            const imagePtr = FUNCTIONS.KlassGetImage(klassPtr);
            if (imagePtr.isNull()) return null;
            return imagePtr.readUtf8String();
        } catch (e) {
            return null;
        }
    }

    static getExtendsListViaAPI(type) {
        let extendsList = [];
        const isEnum = this.isRealEnum(type);
        const isValue = !!FUNCTIONS.KlassIsValue(type);

        //parents fr
        if (!isEnum && !isValue) {
            try {
                const parent = FUNCTIONS.KlassGetParent(type);
                if (!parent.isNull()) {
                    const parentNamePtr = FUNCTIONS.klassGetName(parent);
                    if (!parentNamePtr.isNull()) {
                        const parentName = parentNamePtr.readUtf8String();
                        if (parentName && !parentName.includes("__StaticArrayInitTypeSize")) {
                            const parentNsPtr = FUNCTIONS.klassGetNamespaze(parent);
                            let fullParentName = parentName;

                            if (!parentNsPtr.isNull()) {
                                const parentNs = parentNsPtr.readUtf8String();
                                if (parentNs && parentNs.length > 0) {
                                    fullParentName = `${parentNs}.${parentName}`;
                                }
                            }
                            extendsList.push(fullParentName);
                        }
                    }
                }
            } catch (e) {}
        }

        //getinterfaces
        try {
            let iterPtr = Memory.alloc(Process.pointerSize);
            iterPtr.writePointer(ptr(0));

            while (true) {
                let interfaceKlass = FUNCTIONS.klassGetInterfaces(type, iterPtr);
                if (interfaceKlass.isNull()) break;

                try {
                    let ifaceNamePtr = FUNCTIONS.klassGetName(interfaceKlass);
                    if (!ifaceNamePtr.isNull()) {
                        let ifaceName = ifaceNamePtr.readUtf8String();
                        if (ifaceName && !ifaceName.includes("__StaticArrayInitTypeSize")) {
                            let ifaceNsPtr = FUNCTIONS.klassGetNamespaze(interfaceKlass);
                            let fullIfaceName = ifaceName;

                            if (!ifaceNsPtr.isNull()) {
                                let ifaceNs = ifaceNsPtr.readUtf8String();
                                if (ifaceNs && ifaceNs.length > 0) {
                                    fullIfaceName = `${ifaceNs}.${ifaceName}`;
                                }
                            }
                            extendsList.push(fullIfaceName);
                        }
                    }
                } catch (e) {}
            }
        } catch (e) {}

        return extendsList;
    }
}