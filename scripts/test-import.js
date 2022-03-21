const { spawnSync } = require('child_process');
const { mkdtempSync, writeFileSync, mkdirSync, readFileSync } = require('fs');
const { tmpdir } = require('os');
const { join, resolve, relative } = require('path');

const { parse } = require('@babel/parser');

function getExports(filename) {
  const ast = parse(readFileSync(`${__dirname}/../${filename}`, `utf8`), {
    plugins: [`typescript`],
    sourceType: 'module',
    sourceFilename: filename,
  });
  const exports = { value: [], type: [] };
  for (const statement of ast.program.body) {
    switch (statement.type) {
      case 'ExpressionStatement':
      case 'ImportDeclaration':
        break;
      case 'ExportNamedDeclaration':
        for (const specifier of statement.specifiers) {
          const exportKind =
            specifier.exportKind === 'type' ? 'type' : statement.exportKind ?? 'value';
          exports[exportKind].push(specifier.exported.name);
        }
        break;
      default:
        console.log(statement);
        process.exit(1);
    }
  }
  return { filename, value: new Set(exports.value), type: new Set(exports.type) };
}

let foundMissingExport = false;
function compare(a, b, exportKind) {
  for (const e of a[exportKind]) {
    if (!b[exportKind].has(e)) {
      console.error(
        `${exportKind} export ${JSON.stringify(e)} is in ${a.filename} but not ${b.filename}`,
      );
      foundMissingExport = true;
    }
  }
}
const readOnlyExports = getExports(`src/readonly.ts`);
const mutableExports = getExports(`src/index.ts`);

compare(mutableExports, readOnlyExports, `value`);
compare(mutableExports, readOnlyExports, `type`);
compare(readOnlyExports, mutableExports, `value`);
compare(readOnlyExports, mutableExports, `type`);

if (foundMissingExport) {
  process.exit(1);
}

console.info(`$ npm pack`);
inheritExit(spawnSync(`npm`, [`pack`], { cwd: join(__dirname, `..`), stdio: `inherit` }));

const OUTPUTS = [
  {
    name: `test.cjs`,
    header: [
      `const assert = require('assert');`,
      `const t = require('funtypes');`,
      `const r = require('funtypes/readonly');`,
    ],
  },
  {
    name: `test.mjs`,
    header: [
      `import assert from 'assert';`,
      `import * as t from 'funtypes';`,
      `import * as r from 'funtypes/readonly';`,
    ],
  },
];

const assertions = [
  ...[`Readonly`, `Object`, `Record`].flatMap(n => [
    `assert(typeof t.${n} === 'function');`,
    `assert(typeof r.${n} === 'function');`,
  ]),
  ...[...mutableExports.value]
    .sort()
    .map(n => `assert(t.${n} !== undefined && typeof t.${n} === typeof r.${n});`),
  `assert(t.Object({}).isReadonly === false)`,
  `assert(r.Object({}).isReadonly === true)`,
];

const dir = mkdtempSync(join(tmpdir(), `funtypes`));
for (const { name, header } of OUTPUTS) {
  writeFileSync(
    join(dir, name),
    [...header, ``, ...assertions, ``, `console.log("✅ ${name} Import Tests Passed")`, ``].join(
      `\n`,
    ),
  );
}

mkdirSync(join(dir, `src`));
writeFileSync(
  join(dir, `src`, `test.ts`),
  [
    `const assert = require('assert');`,
    `import * as t from 'funtypes';`,
    `import * as r from 'funtypes/readonly';`,
    ``,
    `const schemaA = t.Object({value: t.String});`,
    `const schemaB = r.Object({value: t.String});`,
    ``,
    `const valueA = schemaA.parse({value: 'hello world'});`,
    `valueA.value = 'updated value';`,
    ``,
    `const valueB = schemaB.parse({value: 'hello world'});`,
    `// @ts-expect-error - valueB.value is readonly`,
    `valueB.value = 'updated value';`,
    ``,
    `valueA.value = valueB.value`,
    ``,
    ...assertions,
    ``,
    `console.log("✅ TypeScript Import Tests Passed")`,
    ``,
  ].join(`\n`),
);

writeFileSync(
  join(dir, `tsconfig.json`),
  JSON.stringify({
    compilerOptions: {
      module: 'CommonJS',
      outDir: 'lib',
      noImplicitAny: true,
      skipLibCheck: false,
      strict: true,
      isolatedModules: true,
    },
    include: ['src'],
  }) + `\n`,
);

writeFileSync(
  join(dir, `package.json`),
  JSON.stringify({
    name: 'funtypes-test-import',
    private: true,
    dependencies: {
      '@types/node': '^17.0.21',
      typescript: '4.0.2',
    },
    scripts: {
      typecheck: 'tsc --build',
    },
  }) + `\n`,
);

console.info(`$ npm install`);
inheritExit(spawnSync(`npm`, [`install`], { cwd: dir, stdio: `inherit` }));

const packPath = relative(
  join(dir, `package.json`),
  resolve(join(__dirname, `..`, `funtypes-0.0.0.tgz`)),
);
console.info(`$ npm install ${packPath}`);
inheritExit(spawnSync(`npm`, [`install`, packPath], { cwd: dir, stdio: `inherit` }));

for (const { name } of OUTPUTS) {
  console.info(`$ node ${join(dir, name)}`);
  inheritExit(spawnSync(`node`, [join(dir, name)], { cwd: dir, stdio: `inherit` }));
}

console.info(`$ npm run typecheck`);
inheritExit(spawnSync(`npm`, [`run`, `typecheck`], { cwd: dir, stdio: `inherit` }));
console.info(`$ node lib/test.js`);
inheritExit(spawnSync(`node`, [`lib/test.js`], { cwd: dir, stdio: `inherit` }));

function inheritExit(proc) {
  if (proc.status !== 0) process.exit(proc.status);
}
