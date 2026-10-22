import {build} from 'esbuild';
import {writeFileSync,mkdirSync} from 'node:fs';
const result=await build({stdin:{contents:"import {bundledContent} from './src/content/catalog'; import {parseCurriculum} from './src/content/model'; console.log(JSON.stringify(parseCurriculum(bundledContent)));",resolveDir:process.cwd()},bundle:true,platform:'node',format:'esm',write:false});
mkdirSync('output/content',{recursive:true});
writeFileSync('output/content/export.mjs',result.outputFiles[0].text);
