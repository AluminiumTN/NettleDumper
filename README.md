# NettleDumper - Zero Zenless Zone 


> [!WARNING]
> **Notice about Game Offsets**

## Why Offsets Are Not Included

**This repository does not contain game-specific offsets for Zenless Zero Zero.** Here's why:

After witnessing the situation with Genshin Impact, where open-sourcing similar projects led to an explosion of:
- **Soooo much ^kebi paste cheats** from developers who don't understand the code and only download old sources and updates it.
- **Exit scam "cheat" sellers** particularly from Indonesian and other communities

I've decided to keep offsets private to prevent Zenless Zone Zone from becoming another mainstream flooded with paste developers and scammers.

### 1. Installing
#### Firstly you need to install Frida and Node!
```bash
npm install
```


### 2. Launch

```bash
npm run dump > dump.cs
```

## Usage

### 1: NPM scripts

```bash
# Compile
npm run build

# Launch dumper (spawn)
npm run dump > dump.cs

# Attach to game
npm run dump:attach > dump.cs
```


### 2: Manually

```bash
# 1: Compile
frida-compile src/index.js -o dist/dump.js

# 2: Launcg
frida -f "urs\path-to\ZoneZenlessZero.exe" -l dist/dump.js > dump.cs
```

## Settings

### Some settings for load game modules and some timeouts

 `src/config/functions.js`:

```javascript
const CONFIG = {
    MODULE_NAME: "GameAssembly.dll",
    MODULE_LOAD_TIMEOUT: 10000,  // module loading timeout
    ADDITIONAL_DELAY: 7000,      // timeout after loading
};
```

### Change when dumper stop dump classes

`src/index.js`:

```javascript
ClassDumper.dumpClasses(999999);
```

### Change path to game

In `package.json`:

```json
"dump": "npm run build && frida -f \"urs\\path-to\\game.exe\" -l dist/dump.js"
```

### API's location

In `src/config/functions.js` update offsets after game update!!:

```javascript
FUNCTIONS = {
    getTypeInfo: new NativeFunction(basePtr.add(0x111111),'pointer', ['int']),
}
```



## dump.cs format

```csharp
// Module: Assembly-CSharp.dll
// TypeDefinitionIndex: 0
// Namespace: RPG.GameCore
// Fullname: RPG.GameCore.PlayerController
public class PlayerController 
{
    // Fields:

    private int health; // Offset: 0x10
    private float speed; // Offset: 0x14

    // Property:
    public bool IsAlive { get; }

    // Methods:

    // RVA: 0x12AB340
    public void Attack(int damage);
}
```

## References

- [GracefulDumper](https://github.com/thexeondev/GracefulDumper)
- [libil2cpp](https://github.com/MlgmXyysd/libil2cpp)
- [EclipseDumper](https://github.com/Yoshk4e/EclipseeDumper)
- [IL2CPPRuntimeDumper](https://github.com/lilmayofuksu/Il2CppRuntimeDumper)
- some old dumper version from [@how_to_6a756d70](https://discord.com/channels/@me/1442939841573687387)


