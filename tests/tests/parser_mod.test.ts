import { describe, expect, it } from "bun:test";
import { runBpl } from "./runtime_utils";
import * as path from "path";

describe("Parser Module", () => {
  it("should compile the Parser module definitions", () => {
    const srcDir = path.resolve(process.cwd(), "src");
    const parserPath = path.join(srcDir, "parser.adg");
    const scannerPath = path.join(srcDir, "scanner.adg");
    const sourceReaderPath = path.join(srcDir, "source_reader.adg");
    const tokenPath = path.join(srcDir, "token.adg");
    const libDir = path.resolve(process.cwd(), "lib");
    const arenaPath = path.join(libDir, "memory", "arena_allocator.adg");

    const program = `
        import [Parser] from "${parserPath}";
        import [Scanner] from "${scannerPath}";
        import [SourceManager] from "${sourceReaderPath}";
        import [SourceFile] from "${sourceReaderPath}";
        import [DiagnosticReporter] from "std/diagnostics.adg";
        import [ArenaAllocator] from "${arenaPath}";

        frame main() ret int {
           # Setup dependencies
           local sm: SourceManager = SourceManager.new();
           local idx: int = sm.addFile("test.adg", "frame x;");
           local sf: *SourceFile = sm.getFile(idx);
           
           local reporter: DiagnosticReporter = DiagnosticReporter.new();
           local arena: ArenaAllocator;
           arena.init(cast<ulong>(1024));
           
           local scanner: Scanner = Scanner.new(sf, &reporter);
           local parser: Parser = Parser.new(scanner, &reporter, &arena);
           
           parser.init();
           # parser.synchronize();
           
           return 0;
        }
    `;

    const result = runBpl(program, "parser_mod_test");
    if (result.exitCode !== 0) {
      console.error(result.stderr);
    }
    expect(result.exitCode).toBe(0);
  });
});
