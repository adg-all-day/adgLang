import { describe, expect, it } from "bun:test";
import { lexWithGrammar } from "../compiler/frontend/GrammarLexer";
import { Parser } from "../compiler/frontend/Parser";
import { TypeChecker } from "../compiler/middleend/TypeChecker";
import { CodeGenerator } from "../compiler/backend/CodeGenerator";

function generate(source: string) {
  const tokens = lexWithGrammar(source, "test.adg");
  const parser = new Parser(source, "test.adg", tokens);
  const program = parser.parse();
  const typeChecker = new TypeChecker();
  typeChecker.checkProgram(program);
  const codeGenerator = new CodeGenerator();
  return codeGenerator.generate(program);
}

describe("CodeGen - Stack Overflow", () => {
  it("should generate stack depth check", () => {
    const source = `
      frame main() {
        return;
      }
    `;
    const ir = generate(source);

    // Check for runtime calls
    expect(ir).toContain("call void @__adgLang_enter_stack_frame()");
    expect(ir).toContain("call void @__adgLang_exit_stack_frame()");
  });
});
