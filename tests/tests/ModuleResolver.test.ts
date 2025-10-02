import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

import { ModuleResolver } from "../compiler/middleend/ModuleResolver";

describe("ModuleResolver", () => {
  // Create temp directory for test files
  const tempDir = path.join(os.tmpdir(), `adgLang-test-${Date.now()}`);

  beforeAll(() => {
    fs.mkdirSync(tempDir, { recursive: true });

    // Create dummy errors.adg for implicit imports
    fs.writeFileSync(
      path.join(tempDir, "errors.adg"),
      `
      struct Error {
        message: string,
      }
      export [Error];
      `,
    );
  });

  afterAll(() => {
    // Clean up
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("should resolve a single module without imports", () => {
    const mainPath = path.join(tempDir, "main.adg");
    fs.writeFileSync(
      mainPath,
      `
      frame main() ret int {
        return 0;
      }
    `,
    );

    const resolver = new ModuleResolver({ stdLibPath: tempDir });
    const modules = resolver.resolveModules(mainPath);

    // Expect 2 modules: errors.adg (implicit) and main.adg
    expect(modules.length).toBe(2);
    expect(path.basename(modules[0]!.path)).toBe("errors.adg");
    expect(modules[1]!.path).toBe(mainPath);
    // main depends on errors.adg
    expect(modules[1]!.dependencies.size).toBe(1);
  });

  it("should resolve modules with linear dependencies", () => {
    // Create module A (no dependencies)
    const moduleAPath = path.join(tempDir, "moduleA.adg");
    fs.writeFileSync(
      moduleAPath,
      `
      struct Point {
        x: int,
        y: int,
      }
    `,
    );

    // Create module B (depends on A)
    const moduleBPath = path.join(tempDir, "moduleB.adg");
    fs.writeFileSync(
      moduleBPath,
      `
      import [Point] from "./moduleA.adg";
      
      frame usePoint() ret int {
        local p: Point;
        return 0;
      }
    `,
    );

    // Create main (depends on B)
    const mainPath = path.join(tempDir, "main2.adg");
    fs.writeFileSync(
      mainPath,
      `
      import [usePoint] from "./moduleB.adg";
      
      frame main() ret int {
        return usePoint();
      }
    `,
    );

    const resolver = new ModuleResolver({ stdLibPath: tempDir });
    const modules = resolver.resolveModules(mainPath);

    // Should be in order: errors.adg, A, B, main
    expect(modules.length).toBe(4);
    expect(path.basename(modules[0]!.path)).toBe("errors.adg");
    expect(path.basename(modules[1]!.path)).toBe("moduleA.adg");
    expect(path.basename(modules[2]!.path)).toBe("moduleB.adg");
    expect(path.basename(modules[3]!.path)).toBe("main2.adg");
  });

  it("should detect circular dependencies", () => {
    // Create module C that imports D
    const moduleCPath = path.join(tempDir, "moduleC.adg");
    fs.writeFileSync(
      moduleCPath,
      `
      import [funcD] from "./moduleD.adg";
      
      frame funcC() ret int {
        return funcD();
      }
    `,
    );

    // Create module D that imports C (circular!)
    const moduleDPath = path.join(tempDir, "moduleD.adg");
    fs.writeFileSync(
      moduleDPath,
      `
      import [funcC] from "./moduleC.adg";
      
      frame funcD() ret int {
        return funcC();
      }
    `,
    );

    const resolver = new ModuleResolver();

    expect(() => {
      resolver.resolveModules(moduleCPath);
    }).toThrow(/[Cc]ircular/);
  });

  it("should handle diamond dependencies", () => {
    // Common module
    const commonPath = path.join(tempDir, "common.adg");
    fs.writeFileSync(
      commonPath,
      `
      struct Data {
        value: int,
      }
    `,
    );

    // Left branch
    const leftPath = path.join(tempDir, "left.adg");
    fs.writeFileSync(
      leftPath,
      `
      import [Data] from "./common.adg";
      
      frame useLeft(d: Data) ret int {
        return d.value;
      }
    `,
    );

    // Right branch
    const rightPath = path.join(tempDir, "right.adg");
    fs.writeFileSync(
      rightPath,
      `
      import [Data] from "./common.adg";
      
      frame useRight(d: Data) ret int {
        return d.value * 2;
      }
    `,
    );

    // Main imports both
    const mainPath = path.join(tempDir, "diamond_main.adg");
    fs.writeFileSync(
      mainPath,
      `
      import [useLeft] from "./left.adg";
      import [useRight] from "./right.adg";
      import [Data] from "./common.adg";
      
      frame main() ret int {
        local d: Data;
        return useLeft(d) + useRight(d);
      }
    `,
    );

    const resolver = new ModuleResolver({ stdLibPath: tempDir });
    const modules = resolver.resolveModules(mainPath);

    // Common should appear first, then left and right, then main
    // Plus errors.adg at the very beginning
    expect(modules.length).toBe(5);
    expect(path.basename(modules[0]!.path)).toBe("errors.adg");
    expect(path.basename(modules[1]!.path)).toBe("common.adg");
    // Left and right can be in either order
    const lastModule = path.basename(modules[modules.length - 1]!.path);
    expect(lastModule).toBe("diamond_main.adg");
  });

  it("should fail on missing module", () => {
    const mainPath = path.join(tempDir, "missing_import.adg");
    fs.writeFileSync(
      mainPath,
      `
      import [Something] from "./does_not_exist.adg";
      
      frame main() ret int {
        return 0;
      }
    `,
    );

    const resolver = new ModuleResolver();

    expect(() => {
      resolver.resolveModules(mainPath);
    }).toThrow();
  });
});
