import { FUNCTIONS } from '../config/functions.js';
import { OFFSETS } from '../config/offsets.js';
import { CONSTANTS } from '../config/constants.js';
import { TypeResolver } from '../core/types.js';

export class PropertyDumper {
    static dumpProperties(type) {
        let iterPtr = Memory.alloc(Process.pointerSize);
        iterPtr.writePointer(ptr(0));
        let foundAnyProps = false;

        while (true) {
            let propertyInfoPtr = null;

            try {
                propertyInfoPtr = FUNCTIONS.KlassGetProps(type, iterPtr);
                if (propertyInfoPtr.isNull()) break;
            } catch (e) {
                break;
            }

            if (!foundAnyProps) {
                console.log("\t// Property:");
                foundAnyProps = true;
            }

            try {
                let propName = "error_in_prop_name";
                let propTypeStr = "error_in_type";
                let visibility = "public";
                let accessors = "";

                try {
                    let encName = propertyInfoPtr.add(OFFSETS.PROPERTY.NAME).readU64();
                    let decName = encName.xor(OFFSETS.PROPERTY.NAME_DECRYPT_KEY);
                    let actualNamePtr = ptr(decName.toString());
                    if (!actualNamePtr.isNull()) {
                        propName = actualNamePtr.readUtf8String() || "unnamed_property";
                    }
                } catch (e) {}

                let getterMethodPtr = ptr(0), setterMethodPtr = ptr(0);

                try {
                    let encGetter = propertyInfoPtr.add(OFFSETS.PROPERTY.GETTER).readU64();
                    getterMethodPtr = ptr(encGetter.sub(OFFSETS.PROPERTY.GETTER_DECRYPT_KEY).toString());
                } catch (e) {}

                try {
                    let encSetter = propertyInfoPtr.add(OFFSETS.PROPERTY.SETTER).readU64();
                    setterMethodPtr = ptr(encSetter.sub(OFFSETS.PROPERTY.SETTER_DECRYPT_KEY).toString());
                } catch (e) {}

                try {
                    if (!getterMethodPtr.isNull()) {
                        let retType = FUNCTIONS.methodGetReturnType(getterMethodPtr);
                        if (!retType.isNull()) {
                            propTypeStr = TypeResolver.resolveGenericType(retType);
                        }
                    }
                } catch (e) {}

                try {
                    if (!getterMethodPtr.isNull()) {
                        let mFlags = getterMethodPtr.add(OFFSETS.METHOD.FLAGS).readU32();
                        const access = mFlags & CONSTANTS.METHOD_ATTRIBUTE.MEMBER_ACCESS_MASK;

                        switch (access) {
                            case CONSTANTS.METHOD_ATTRIBUTE.PRIVATE: visibility = "private"; break;
                            case CONSTANTS.METHOD_ATTRIBUTE.PUBLIC: visibility = "public"; break;
                            case CONSTANTS.METHOD_ATTRIBUTE.FAMILY: visibility = "protected"; break;
                            case CONSTANTS.METHOD_ATTRIBUTE.ASSEM: visibility = "internal"; break;
                            default: visibility = "public";
                        }
                    } else if (!setterMethodPtr.isNull()) {
                        let mFlags = setterMethodPtr.add(OFFSETS.METHOD.FLAGS).readU32();
                        const access = mFlags & CONSTANTS.METHOD_ATTRIBUTE.MEMBER_ACCESS_MASK;

                        switch (access) {
                            case CONSTANTS.METHOD_ATTRIBUTE.PRIVATE: visibility = "private"; break;
                            case CONSTANTS.METHOD_ATTRIBUTE.PUBLIC: visibility = "public"; break;
                            case CONSTANTS.METHOD_ATTRIBUTE.FAMILY: visibility = "protected"; break;
                            case CONSTANTS.METHOD_ATTRIBUTE.ASSEM: visibility = "internal"; break;
                            default: visibility = "public";
                        }
                    }
                } catch (e) {}

                if (!getterMethodPtr.isNull()) accessors += " get;";
                if (!setterMethodPtr.isNull()) accessors += " set;";

                console.log(`\t${visibility} ${propTypeStr} ${propName} {${accessors}}`);
            } catch (propError) {}
        }

        if (foundAnyProps) console.log("");
    }
}