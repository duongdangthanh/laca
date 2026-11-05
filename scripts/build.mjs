import {cp, mkdir, rm} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
const out=path.join(root,'dist');
await rm(out,{recursive:true,force:true});await mkdir(out,{recursive:true});
for(const file of ['index.html','script.js','styles.css','seed-data.js','assets','pickleball'])await cp(path.join(root,file),path.join(out,file),{recursive:true});
console.log('Built existing Laca website at / and 3D club at /pickleball/');
