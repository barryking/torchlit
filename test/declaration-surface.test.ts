// @vitest-environment node

import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

describe('tour-service declarations', () => {
  it('do not reference lit', () => {
    const configPath = resolve(process.cwd(), 'tsconfig.json');
    const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
    const parsed = ts.parseJsonConfigFileContent(
      configFile.config,
      ts.sys,
      process.cwd(),
    );
    const outDir = mkdtempSync(join(tmpdir(), 'torchlit-dts-'));

    try {
      const program = ts.createProgram({
        rootNames: [resolve(process.cwd(), 'src/tour-service.ts')],
        options: {
          ...parsed.options,
          declaration: true,
          emitDeclarationOnly: true,
          noEmit: false,
          outDir,
        },
      });
      const emitResult = program.emit();
      const diagnostics = ts
        .getPreEmitDiagnostics(program)
        .concat(emitResult.diagnostics);

      expect(diagnostics).toHaveLength(0);

      const declaration = readFileSync(join(outDir, 'tour-service.d.ts'), 'utf8');
      expect(declaration).not.toMatch(/from ['"]lit(?:\/|['"])/);
    } finally {
      rmSync(outDir, { recursive: true, force: true });
    }
  });
});
