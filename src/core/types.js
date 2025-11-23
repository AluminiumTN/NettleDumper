import { FUNCTIONS } from '../config/functions.js';
import { TypeMapper } from '../utils/typeMapper.js';

export class TypeResolver {
    static resolveGenericType(typePtr) {
        try {
            if (typePtr.isNull()) return "null_type";

            let fullNamePtr = FUNCTIONS.TypeGetName(typePtr);
            if (!fullNamePtr.isNull()) {
                let fullName = fullNamePtr.readUtf8String();
                if (fullName && fullName.length > 0) {
                    let fullAngleMatch = fullName.match(/^(.+?)<(.+)>$/);
                    if (fullAngleMatch) {
                        let baseName = fullAngleMatch[1].split('.').pop();
                        let argsStr = fullAngleMatch[2];
                        let args = argsStr.split(',').map(s => {
                            let trimmed = s.trim();
                            let simpleName = trimmed.split('.').pop();
                            return TypeMapper.getReadableType(simpleName);
                        });
                        return `${TypeMapper.getReadableType(baseName)}<${args.join(', ')}>`;
                    }

                    let bracketMatch = fullName.match(/^(.+?)`(\d+)\[(.+)\]$/);
                    if (bracketMatch) {
                        let baseName = bracketMatch[1].split('.').pop();
                        let argsStr = bracketMatch[3];
                        let args = argsStr.split(',').map(s => {
                            let trimmed = s.trim();
                            let simpleName = trimmed.split('.').pop();
                            return TypeMapper.getReadableType(simpleName);
                        });
                        return `${TypeMapper.getReadableType(baseName)}<${args.join(', ')}>`;
                    }

                    let backtickMatch = fullName.match(/^(.+?)`(\d+)$/);
                    if (backtickMatch) {
                        let baseName = backtickMatch[1].split('.').pop();
                        return `${TypeMapper.getReadableType(baseName)}`;
                    }

                    let simpleName = fullName.split('.').pop();
                    return TypeMapper.getReadableType(simpleName);
                }
            }

            const klass = FUNCTIONS.klassFromType(typePtr);
            if (!klass.isNull()) {
                const namePtr = FUNCTIONS.klassGetName(klass);
                if (!namePtr.isNull()) {
                    const name = namePtr.readUtf8String();
                    if (name) return TypeMapper.getReadableType(name);
                }
            }

            return "UnresolvedType";
        } catch (error) {
            return "ErrorResolvingGeneric";
        }
    }
}