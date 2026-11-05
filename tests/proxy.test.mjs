import test from 'node:test';
import assert from 'node:assert/strict';
import {createHandler} from '../netlify/functions/club.mjs';
const origin='https://laca-example.netlify.app';
const backend='https://pickle-yard-051126.duongdangthanh01.chatgpt.site';
const request=(path,opts={})=>new Request(origin+path,opts);
test('forwards only club API and bearer auth, replacing origin without forwarding cookies',async()=>{
 let received;
 const handler=createHandler({fetcher:async(url,opts)=>{received={url:String(url),opts};return Response.json({people:[]})}});
 const r=await handler(request('/api/club/presence',{method:'POST',headers:{Origin:origin,Authorization:'Bearer player-session',Cookie:'private-browser-cookie=never-forward'},body:'{"x":0,"z":45}'}));
 assert.equal(r.status,200);assert.equal(received.url,backend+'/api/club/presence');assert.equal(received.opts.headers.get('origin'),backend);assert.equal(received.opts.headers.get('authorization'),'Bearer player-session');assert.equal(received.opts.headers.get('cookie'),null);assert.deepEqual(await r.json(),{people:[]});
});
test('supports Netlify rewritten paths and preserves API errors',async()=>{
 const handler=createHandler({fetcher:async()=>Response.json({error:'Phòng đã đủ 4 người.'},{status:409})});
 const r=await handler(request('/.netlify/functions/club/rooms/ABC123/join',{method:'POST',body:'{}'}));assert.equal(r.status,409);assert.match((await r.json()).error,/4/);
});
test('rejects cross-origin writes, unknown routes and oversized bodies before forwarding',async()=>{
 const handler=createHandler({fetcher:async()=>{assert.fail('must not forward invalid request')}});
 assert.equal((await handler(request('/api/club/chat',{method:'POST',headers:{Origin:'https://another.example'},body:'{}'}))).status,403);
 assert.equal((await handler(request('/api/club/signin-with-chatgpt'))).status,404);
 assert.equal((await handler(request('/api/club/session',{method:'POST',body:'x'.repeat(50001)}))).status,413);
 assert.equal((await handler(request('/api/club/chat',{method:'DELETE'}))).status,405);
});
test('returns JSON for upstream login gates, redirects and outages',async()=>{
 for(const response of [new Response('<html>Login</html>',{status:401,headers:{'content-type':'text/html'}}),new Response(null,{status:302,headers:{Location:'/signin-with-chatgpt'}})]){
  const handler=createHandler({fetcher:async()=>response});const r=await handler(request('/api/club/session',{method:'POST',body:'{}'}));assert.equal(r.status,502);assert.ok((await r.json()).error);
 }
 const handler=createHandler({fetcher:async()=>{throw Error('offline')}});assert.equal((await handler(request('/api/club/rooms'))).status,502);
});
