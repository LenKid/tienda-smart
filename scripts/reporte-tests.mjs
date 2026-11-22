// Corre todas las pruebas de /tests y genera docs/resultados-tests.md
// Uso: npm run test:reporte
import { run } from 'node:test';
import { mkdir, writeFile } from 'node:fs/promises';
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const carpetaTests = path.join(raiz, 'tests');
const salida = path.join(raiz, 'docs', 'resultados-tests.md');

const archivos = readdirSync(carpetaTests)
  .filter((f) => f.endsWith('.test.mjs'))
  .sort()
  .map((f) => path.join(carpetaTests, f));

// Node < 24 necesita la bandera para importar archivos .ts
const mayor = Number(process.versions.node.split('.')[0]);
const execArgv = ['--experimental-test-module-mocks'];
if (mayor < 24) execArgv.push('--experimental-strip-types');

const inicio = Date.now();
const resultados = [];

for await (const evento of run({ files: archivos, concurrency: 1, execArgv })) {
  if (evento.type !== 'test:pass' && evento.type !== 'test:fail') continue;
  const d = evento.data;
  if (d.details?.type === 'suite') continue;
  const error = d.details?.error;
  resultados.push({
    archivo: path.basename(d.file ?? 'desconocido'),
    nombre: d.name,
    ok: evento.type === 'test:pass',
    omitida: Boolean(d.skip || d.todo),
    ms: d.details?.duration_ms ?? 0,
    mensaje: error ? String(error.cause?.message ?? error.message ?? error) : '',
  });
}

const duracion = ((Date.now() - inicio) / 1000).toFixed(1);
const total = resultados.length;
const pasaron = resultados.filter((r) => r.ok).length;
const fallaron = total - pasaron;
const fecha = new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' });
const limpiar = (t) => t.replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');

let md = `# Resultados de pruebas — TiendaSmart\n\n`;
md += `- **Fecha:** ${fecha}\n- **Node:** ${process.versions.node}\n- **Duración total:** ${duracion} s\n\n`;
md += `## Resumen\n\n| Total | ✅ Pasaron | ❌ Fallaron |\n|---|---|---|\n| ${total} | ${pasaron} | ${fallaron} |\n\n`;
md += fallaron === 0 ? `**Estado general: TODAS LAS PRUEBAS PASARON ✅**\n\n` : `**Estado general: HAY PRUEBAS FALLIDAS ❌**\n\n`;

for (const archivo of [...new Set(resultados.map((r) => r.archivo))]) {
  const filas = resultados.filter((r) => r.archivo === archivo);
  md += `## ${archivo}\n\n| Estado | Prueba | Tiempo (ms) |\n|---|---|---|\n`;
  for (const r of filas) {
    md += `| ${r.ok ? '✅' : '❌'} | ${limpiar(r.nombre)} | ${r.ms.toFixed(1)} |\n`;
  }
  md += `\n`;
}

const fallidas = resultados.filter((r) => !r.ok);
if (fallidas.length > 0) {
  md += `## Detalle de fallos\n\n`;
  for (const r of fallidas) {
    md += `### ${r.nombre}\n\nArchivo: \`${r.archivo}\`\n\n\`\`\`\n${r.mensaje.trim()}\n\`\`\`\n\n`;
  }
}

await mkdir(path.dirname(salida), { recursive: true });
await writeFile(salida, md, 'utf8');

console.log(`Pruebas: ${pasaron}/${total} pasaron. Reporte: ${path.relative(raiz, salida)}`);
process.exitCode = fallaron > 0 ? 1 : 0;
