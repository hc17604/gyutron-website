/** Vendor the ISO flags from a locally extracted, integrity-checked flag-icons 7.6.0 npm package. */
import {readFile,mkdir,writeFile,copyFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=fileURLToPath(new URL('../',import.meta.url)),source=resolve(process.argv[2]||'');
if(!process.argv[2])throw Error('Pass the extracted flag-icons package directory.');
const pkg=JSON.parse(await readFile(join(source,'package.json'),'utf8'));
if(pkg.name!=='flag-icons'||pkg.version!=='7.6.0'||pkg.license!=='MIT')throw Error('Unexpected flag source.');
const countries=JSON.parse(await readFile(join(source,'country.json'),'utf8')).filter(c=>c.iso&&/^[a-z]{2}$/.test(c.code));
const target=join(root,'public/workspace-assets/flags');await mkdir(target,{recursive:true});
const names={},hashes={};
for(const c of countries){const bytes=await readFile(join(source,'flags/4x3',c.code+'.svg'));const svg=bytes.toString('utf8');if(!svg.includes('<svg')||/<(?:script|image|foreignObject)\b|\son\w+\s*=|(?:href|xlink:href)\s*=\s*["'](?!#)/i.test(svg))throw Error('Unsafe flag: '+c.code);await writeFile(join(target,c.code+'.svg'),bytes);names[c.code.toUpperCase()]=c.name;hashes[c.code+'.svg']=createHash('sha256').update(bytes).digest('hex');}
await copyFile(join(source,'LICENSE'),join(target,'LICENSE.txt'));
await writeFile(join(target,'manifest.json'),JSON.stringify({package:'flag-icons',version:pkg.version,license:pkg.license,source:'https://github.com/lipis/flag-icons',upstream_integrity:'sha512-hir/PsXwr0EESyizKrXJzmkzpLIMf+1vlNKLqAfvdh+bsU94a7LYWTiubkHKqptGoCPzOUGcm6c4PfC9/BaGSQ==',flags:hashes},null,2)+'\n');
await writeFile(join(root,'src/admin/country-data.mjs'),'// ISO records from flag-icons 7.6.0, MIT; see public/workspace-assets/flags/LICENSE.txt.\nexport const COUNTRY_NAMES = Object.freeze('+JSON.stringify(names,null,2)+');\n');
console.log(JSON.stringify({version:pkg.version,flags:countries.length,license:pkg.license}));
