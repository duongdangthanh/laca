import { stepMatch } from '../pickleball/physics.js';
const json=(data:any,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
const clean=(v:unknown,n:number)=>String(v??'').trim().slice(0,n);
const num=(v:unknown,lo:number,hi:number)=>Math.max(lo,Math.min(hi,Number(v)||0));
async function hash(s:string){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))].map(v=>v.toString(16).padStart(2,'0')).join('')}
function atCourt(me:any,n:number){const x=[-26,-10,10,26][(n-1)%4],z=n<5?-15:15;return Math.abs(me.x-x)<7&&Math.abs(me.z-z)<11.5}
function atCoffee(me:any){return Math.abs(me.x+45)<8&&Math.abs(me.z+31)<5.5}
function seed(){return{v:1,seq:0,players:[{x:-1.6,z:4.7},{x:1.6,z:4.7},{x:-1.6,z:-4.7},{x:1.6,z:-4.7}],score:[0,0],serve:0,ball:{x:-1.6,y:1,z:4.2,vx:0,vy:0,vz:0,bounces:0,lastSide:1,lastHit:0},phase:'serve',hits:[0,0,0,0],winner:null}}
export async function handleClub(req:Request,db:D1Database):Promise<Response>{try{
 if(!db)return json({error:'Máy chủ chưa sẵn sàng.'},503);
 const url=new URL(req.url),path=url.pathname.replace('/api/club/','').split('/'),now=Date.now();
 if(req.method==='POST'){const origin=req.headers.get('origin');if(origin&&origin!==url.origin)return json({error:'Nguồn yêu cầu không hợp lệ.'},403);if(Number(req.headers.get('content-length')||0)>50000)return json({error:'Yêu cầu quá dài.'},413)}
 let data:any={};if(req.method==='POST'){try{data=await req.json()}catch{return json({error:'Dữ liệu không hợp lệ.'},400)}}
 if(path[0]==='session'&&req.method==='POST'){
  const token=crypto.randomUUID()+crypto.randomUUID(),id=crypto.randomUUID(),name=clean(data.name,20)||'Thành viên Laca',color=/^#[0-9a-f]{6}$/i.test(data.color)?data.color:'#f6076d';
  await db.prepare('INSERT INTO club_members(id,token_hash,name,color,x,z,sitting,updated) VALUES(?,?,?,?,0,45,0,?)').bind(id,await hash(token),name,color,now).run();return json({id,token,name,color});
 }
 const token=req.headers.get('authorization')?.replace(/^Bearer /,'');if(!token||token.length>150)return json({error:'Vui lòng kết nối lại sân.'},401);
 const me:any=await db.prepare('SELECT * FROM club_members WHERE token_hash=?').bind(await hash(token)).first();if(!me)return json({error:'Phiên sân đã hết hạn.'},401);
 if(path[0]==='presence'&&req.method==='POST'){
  const name=clean(data.name,20)||me.name,color=/^#[0-9a-f]{6}$/i.test(data.color)?data.color:me.color;
  await db.prepare('UPDATE club_members SET name=?,color=?,x=?,z=?,sitting=?,updated=? WHERE id=?').bind(name,color,num(data.x,-54,54),num(data.z,-54,54),data.sitting?1:0,now,me.id).run();
  const people=await db.prepare('SELECT id,name,color,x,z,sitting,cup FROM club_members WHERE updated>? AND id<>? LIMIT 60').bind(now-15000,me.id).all();
  return json({people:people.results,self:{cup:me.cup},serverTime:now});
 }
 if(path[0]==='chat'){
  if(req.method==='POST'){if(!me.sitting)return json({error:'Ngồi xuống ghế để trò chuyện nhé.'},409);const body=clean(data.body,240);if(!body)return json({error:'Nhập lời nhắn trước nhé.'},400);const recent:any=await db.prepare('SELECT created FROM club_messages WHERE member=? ORDER BY id DESC LIMIT 1').bind(me.id).first();if(recent&&now-recent.created<800)return json({error:'Chờ một chút trước lời nhắn tiếp theo.'},429);await db.prepare('INSERT INTO club_messages(member,name,body,x,z,created) VALUES(?,?,?,?,?,?)').bind(me.id,me.name,body,me.x,me.z,now).run()}
  const list=await db.prepare('SELECT id,member,name,body,created FROM club_messages WHERE created>? AND ABS(x-?)<20 AND ABS(z-?)<20 ORDER BY id DESC LIMIT 40').bind(now-30*60*1000,me.x,me.z).all();return json({messages:list.results.reverse()});
 }
 if(path[0]==='orders'){
  if(req.method==='POST'&&path[1]==='drink'){if(!me.sitting)return json({error:'Ngồi xuống để thưởng thức đồ uống nhé.'},409);if(!me.cup)return json({error:'Bạn chưa có đồ uống.'},409);await db.prepare('UPDATE club_members SET cup=NULL WHERE id=?').bind(me.id).run();return json({finished:true})}
  if(req.method==='POST'&&path[1]==='collect'){if(!atCoffee(me))return json({error:'Quay lại quầy cà phê để nhận đồ uống.'},409);let o:any=await db.prepare('SELECT * FROM club_orders WHERE id=? AND member=?').bind(clean(data.id,50),me.id).first();if(!o)return json({error:'Không tìm thấy đơn.'},404);if(o.ready>now)return json({error:'Đồ uống đang pha, đợi một chút nhé.'},409);await db.batch([db.prepare("UPDATE club_orders SET status='collected' WHERE id=?").bind(o.id),db.prepare('UPDATE club_members SET cup=? WHERE id=?').bind(o.drink,me.id)]);return json({cup:o.drink})}
  if(req.method==='POST'){
   const drink=clean(data.drink,30);if(!['Cà phê sữa đá','Americano đá','Trà đào','Nước lọc'].includes(drink))return json({error:'Đồ uống không có trong menu.'},400);
   if(!atCoffee(me))return json({error:'Ghé Laca Coffee để gọi đồ uống nhé.'},409);
   const pending:any=await db.prepare("SELECT id FROM club_orders WHERE member=? AND status='preparing' LIMIT 1").bind(me.id).first();if(pending)return json({error:'Bạn đang có một đồ uống chờ nhận.'},409);
   await db.prepare('INSERT INTO club_orders(id,member,drink,status,ready,created) VALUES(?,?,?,?,?,?)').bind(crypto.randomUUID(),me.id,drink,'preparing',now+5000,now).run();
  }
  const orders=await db.prepare('SELECT id,drink,status,ready,created FROM club_orders WHERE member=? ORDER BY created DESC LIMIT 6').bind(me.id).all();return json({orders:orders.results,now});
 }
 if(path[0]==='rooms'){
  const code=clean(path[1],8).toUpperCase();
  if(!code){if(req.method==='GET'){const list=await db.prepare("SELECT r.code,r.court,r.status,r.created,COUNT(s.id) AS count FROM club_rooms r LEFT JOIN club_seats s ON r.code=s.room AND s.updated>? WHERE r.updated>? AND r.status IN ('waiting','playing') GROUP BY r.code HAVING COUNT(s.id)>0 ORDER BY r.created DESC LIMIT 12").bind(now-20000,now-120000).all();return json({rooms:list.results})}
   await db.prepare('DELETE FROM club_seats WHERE updated<?').bind(now-20000).run();const existing=await db.prepare('SELECT room FROM club_seats WHERE member=?').bind(me.id).first();if(existing)return json({error:'Rời phòng hiện tại trước khi tạo phòng khác.'},409);
   const court=Math.round(num(data.court,1,8));if(!atCourt(me,court))return json({error:'Đến sân '+court+' trước khi tạo phòng.'},409);const occupied=await db.prepare("SELECT code FROM club_rooms WHERE court=? AND updated>? AND status IN ('waiting','playing')").bind(court,now-20000).first();if(occupied)return json({error:'Sân này đang có phòng. Chọn sân khác nhé.'},409);
   const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',bytes=crypto.getRandomValues(new Uint8Array(6));const roomCode=[...bytes].map(b=>alphabet[b%alphabet.length]).join('');
   await db.batch([db.prepare("INSERT INTO club_rooms(code,host,court,status,updated,created) VALUES(?,?,?,'waiting',?,?)").bind(roomCode,me.id,court,now,now),db.prepare('INSERT INTO club_seats(id,room,seat,member,input,updated) VALUES(?,?,0,?,?,?)').bind(roomCode+':0',roomCode,me.id,'{}',now)]);return json({code:roomCode});
  }
  let room:any=await db.prepare('SELECT * FROM club_rooms WHERE code=?').bind(code).first();if(!room)return json({error:'Không tìm thấy phòng này.'},404);
  const action=path[2];
  if(req.method==='POST'&&action==='join'){if(!atCourt(me,room.court))return json({error:'Đến sân '+room.court+' rồi bấm E để vào phòng.'},409);
   await db.prepare('DELETE FROM club_seats WHERE updated<?').bind(now-20000).run();
   const already:any=await db.prepare('SELECT * FROM club_seats WHERE member=?').bind(me.id).first();if(already&&already.room!==code)return json({error:'Bạn đang ở một phòng khác. Hãy rời phòng đó trước.'},409);
   if(!already){if(room.status!=='waiting')return json({error:'Trận đã bắt đầu. Hãy tạo phòng mới.'},409);let r=await db.prepare("INSERT OR IGNORE INTO club_seats(id,room,seat,member,input,updated) SELECT ? || ':' || n,?,n,?,'{}',? FROM (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3) WHERE NOT EXISTS(SELECT 1 FROM club_seats WHERE room=? AND seat=n) LIMIT 1").bind(code,code,me.id,now,code).run();if(!r.meta.changes)return json({error:'Phòng đã đủ 4 người.'},409)}
  }
  let mySeat:any=await db.prepare('SELECT * FROM club_seats WHERE room=? AND member=?').bind(code,me.id).first();
  if(req.method==='POST'&&action==='leave'){
   await db.prepare('DELETE FROM club_seats WHERE room=? AND member=?').bind(code,me.id).run();if(room.status==='playing')await db.prepare("UPDATE club_rooms SET status='waiting',state=NULL,updated=? WHERE code=?").bind(now,code).run();let next:any=await db.prepare('SELECT member FROM club_seats WHERE room=? ORDER BY seat LIMIT 1').bind(code).first();if(!next)await db.prepare("UPDATE club_rooms SET host='',status='closed',updated=? WHERE code=?").bind(now,code).run();else if(room.host===me.id)await db.prepare('UPDATE club_rooms SET host=?,updated=? WHERE code=?').bind(next.member,now,code).run();return json({left:true});
  }
  if(mySeat){await db.prepare('UPDATE club_seats SET updated=? WHERE id=?').bind(now,mySeat.id).run();await db.prepare('UPDATE club_rooms SET updated=? WHERE code=?').bind(now,code).run()}
  let players=await db.prepare('SELECT s.seat,s.member,s.input,s.updated,m.name,m.color FROM club_seats s JOIN club_members m ON m.id=s.member WHERE s.room=? AND s.updated>? ORDER BY s.seat').bind(code,now-20000).all<any>();
  if(room.host&&!players.results.some((p:any)=>p.member===room.host)&&players.results.length&&mySeat){await db.prepare('UPDATE club_rooms SET host=? WHERE code=? AND host=?').bind(players.results[0].member,code,room.host).run();room.host=players.results[0].member}
  if(req.method==='POST'&&action==='start'){
   if(room.host!==me.id)return json({error:'Chủ phòng sẽ bắt đầu trận.'},403);if(players.results.length!==4)return json({error:'Cần đủ 4 người để bắt đầu đánh đôi.'},409);await db.batch([db.prepare("UPDATE club_seats SET input='{}' WHERE room=?").bind(code),db.prepare("UPDATE club_rooms SET status='playing',state=? WHERE code=?").bind(JSON.stringify({...seed(),lastTick:now}),code)]);room.status='playing';room.state=JSON.stringify({...seed(),lastTick:now});
  }
  if(req.method==='POST'&&action==='input'){
   if(!mySeat)return json({error:'Bạn chưa tham gia phòng.'},403);const input={dx:num(data.dx,-1,1),dz:num(data.dz,-1,1),hit:Math.max(0,Math.floor(num(data.hit,0,1e8))),aim:num(data.aim,-1,1),at:now};await db.prepare('UPDATE club_seats SET input=? WHERE id=?').bind(JSON.stringify(input),mySeat.id).run();mySeat.input=JSON.stringify(input);players.results.forEach((p:any)=>{if(p.member===me.id)p.input=mySeat.input});
  }
  if(req.method==='POST'&&action==='state')return json({error:'Trạng thái trận do máy chủ điều khiển.'},403);
  // Losing a player pauses the game; it cannot silently become an uneven match.
  if(room.status==='playing'&&players.results.length<4){room.status='waiting';room.state=null;await db.prepare("UPDATE club_rooms SET status='waiting',state=NULL WHERE code=?").bind(code).run()}
  // Advance from server time with optimistic compare-and-swap. Every participant can
  // drive ticks; simulation never depends on a host keeping a browser tab visible.
  if(room.status==='playing'&&room.state&&players.results.length===4){
   const before=room.state,st=JSON.parse(before);let elapsed=Math.max(0,Math.min(2000,now-(st.lastTick||now)));
   const inputs=Array.from({length:4},(_,i)=>{const p=players.results.find((p:any)=>p.seat===i);const input=JSON.parse(p?.input||'{}');return now-(input.at||0)>2500?{...input,dx:0,dz:0}:input});
   let cursor=now-elapsed;while(elapsed>0){const ms=Math.min(20,elapsed);cursor+=ms;stepMatch(st,inputs,ms/1000,cursor);elapsed-=ms}st.lastTick=now;
   const next=JSON.stringify(st),changed=await db.prepare("UPDATE club_rooms SET state=? WHERE code=? AND state=? AND status='playing'").bind(next,code,before).run();
   if(changed.meta.changes)room.state=next;else{const latest:any=await db.prepare('SELECT state,status FROM club_rooms WHERE code=?').bind(code).first();room.state=latest?.state;room.status=latest?.status||room.status}
  }
  return json({code:room.code,court:room.court,status:room.status,host:room.host,seat:mySeat?.seat??null,players:players.results.map((p:any)=>({...p,input:JSON.parse(p.input||'{}')})),state:room.state?JSON.parse(room.state):null});
 }
 return json({error:'Không tìm thấy hoạt động.'},404);
 }catch(e){console.error('club-api',e instanceof Error?e.message:e);return json({error:'Sân đang kết nối lại. Vui lòng thử lại.'},500)}}
