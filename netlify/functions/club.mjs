const DEFAULT_ORIGIN='https://pickle-yard-051126.duongdangthanh01.chatgpt.site';
const error=(message,status)=>Response.json({error:message},{status,headers:{'Cache-Control':'no-store'}});
// Keep the browser on Netlify. Only club API calls are forwarded to the existing
// public game server; no ChatGPT cookies or platform credentials are required.
export function createHandler({fetcher=fetch,backendOrigin=process.env.LACA_API_ORIGIN||DEFAULT_ORIGIN}={}){
  const backend=new URL(backendOrigin);
  if(backend.protocol!=='https:')throw new Error('LACA_API_ORIGIN must be an HTTPS origin');
  return async function handler(request){
    const url=new URL(request.url);
    if(!['GET','POST'].includes(request.method))return error('Phương thức không được hỗ trợ.',405);
    const origin=request.headers.get('origin');
    if(origin&&origin!==url.origin)return error('Nguồn yêu cầu không hợp lệ.',403);
    let suffix;
    if(url.pathname.startsWith('/api/club/'))suffix=url.pathname.slice('/api/club/'.length);
    else if(url.pathname.startsWith('/.netlify/functions/club/'))suffix=url.pathname.slice('/.netlify/functions/club/'.length);
    else return error('Không tìm thấy hoạt động.',404);
    if(!/^(session|presence|chat|orders(?:\/(?:collect|drink))?|rooms(?:\/[A-Z0-9]{6}(?:\/(?:join|leave|start|input|state))?)?)$/.test(suffix))return error('Không tìm thấy hoạt động.',404);
    let body;
    if(request.method==='POST'){
      if(Number(request.headers.get('content-length')||0)>50000)return error('Yêu cầu quá dài.',413);
      body=await request.text();if(new TextEncoder().encode(body).length>50000)return error('Yêu cầu quá dài.',413);
    }
    const target=new URL('/api/club/'+suffix,backend);
    target.search=url.search;
    const headers=new Headers({Accept:'application/json','Content-Type':'application/json',Origin:backend.origin});
    const authorization=request.headers.get('authorization');if(authorization)headers.set('Authorization',authorization);
    try{
      const upstream=await fetcher(target,{method:request.method,headers,body,redirect:'manual',signal:AbortSignal.timeout(15000)});
      if(upstream.status>=300&&upstream.status<400)return error('Máy chủ sân đang yêu cầu đăng nhập. Vui lòng kiểm tra quyền public của backend.',502);
      const contentType=upstream.headers.get('content-type')||'';
      if(!contentType.includes('application/json'))return error('Máy chủ sân chưa trả về dữ liệu. Vui lòng thử lại.',502);
      return new Response(await upstream.text(),{status:upstream.status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
    }catch{return error('Chưa kết nối được máy chủ sân. Vui lòng thử lại.',502)}
  };
}
export default createHandler();
