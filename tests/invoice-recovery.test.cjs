const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const html=fs.readFileSync(__dirname+'/../docs/index.html','utf8');
const saveCode=html.slice(html.indexOf('const zahnPendingInvoiceKey='),html.indexOf('function saved()'));
const restoreCode=html.slice(html.indexOf('function zahnConfirmJsonRestore()'),html.indexOf('async function cloudBackup()'));
function app(storage=new Map(),server=new Map()){
 const els=new Proxy({}, {get:(o,k)=>o[k]??=( {value:({date:'2026-11-16',customer:'Test',phone:'',payment:'Cash',discount:'0'})[k]||'',textContent:'',innerHTML:''})});
 let calls=[],failResponse=false,failStore=false,user='owner';
 const context={console,JSON,Number,Date,Set,Error,crypto:{randomUUID:()=>require('node:crypto').randomUUID()},navigator:{onLine:true},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>{if(failStore&&k==='invoices')throw Error('storage full');storage.set(k,v)},removeItem:k=>storage.delete(k)},$:id=>els[id],rows:[{name:'Test',ml:50,qty:1,price:100}],total:()=>true,money:n=>Math.round(n*100)/100,subtotalAmount:()=>100,discountAmount:()=>0,load:()=>JSON.parse(storage.get('invoices')||'[]'),store:x=>{context.localStorage.setItem('invoices',JSON.stringify(x))},loadDayCloses:()=>JSON.parse(storage.get('days')||'{}'),zahnScheduleSync:()=>{},addItem:()=>{},esc:String,confirm:()=>true,closeKey:'days',zahnSyncQueueKey:'queue',zahnRestorePreview:null,invoiceCloud:{auth:{getUser:async()=>({data:{user:{id:user}}})},rpc:async(name,p)=>{calls.push(p);if(!server.has(p.p_request_id))server.set(p.p_request_id,'ZHN-'+(server.size+1));if(failResponse){failResponse=false;throw Error('response lost')}return {data:server.get(p.p_request_id)}}}};
 vm.createContext(context);vm.runInContext(saveCode+restoreCode,context);
 return {c:context,els,calls,storage,server,setFailResponse:()=>failResponse=true,setFailStore:v=>failStore=v,setUser:v=>user=v};
}
test('lost response, reload, offline retry, then recovery produces one bill',async()=>{
 let a=app();a.setFailResponse();await a.c.save();assert.equal(a.server.size,1);assert.equal(a.c.load().length,0);
 const id=a.calls[0].p_request_id;a=app(a.storage,a.server);a.c.navigator.onLine=false;await a.c.save();assert.equal(a.calls.length,0);assert.equal(a.c.load().length,0);
 a.c.navigator.onLine=true;await a.c.save();assert.equal(a.calls[0].p_request_id,id);assert.equal(a.server.size,1);assert.equal(a.c.load().length,1);assert.equal(a.storage.has('zahn_pending_invoice_v1'),false);
 a.c.rows=[{name:'Next',ml:50,qty:1,price:100}];await a.c.save();assert.equal(a.server.size,2);
});
test('pending bill cannot be retried under another account',async()=>{const a=app();a.setFailResponse();await a.c.save();a.setUser('different');await a.c.save();assert.equal(a.calls.length,1);assert.match(a.els.msg.textContent,/account/)});
test('local storage failure after server save retains retry identity',async()=>{const a=app();a.setFailStore(true);await a.c.save();assert.equal(a.server.size,1);a.setFailStore(false);await a.c.save();assert.equal(a.server.size,1);assert.equal(a.c.load().length,1)});
test('double tap submits only once',async()=>{const a=app();await Promise.all([a.c.save(),a.c.save()]);assert.equal(a.calls.length,1)});
test('offline save remains a single local provisional invoice',async()=>{const a=app();a.c.navigator.onLine=false;await a.c.save();assert.equal(a.calls.length,0);assert.match(a.c.load()[0].id,/^ZHN-OFF-/)});
test('JSON restore queues missing closed day and preserves existing and pending reopen',()=>{
 const a=app();a.storage.set('days',JSON.stringify({'2026-11-14':{total:10}}));a.storage.set('zahn_sync_day_ops_v1',JSON.stringify({'2026-11-15':{action:'reopen'}}));
 a.c.zahnRestorePreview={invoices:[],dayCloses:{'2026-11-14':{total:99},'2026-11-15':{total:20},'2026-11-16':{total:30}}};
 a.c.zahnConfirmJsonRestore();const days=a.c.loadDayCloses(),q=JSON.parse(a.storage.get('queue'));assert.equal(days['2026-11-14'].total,10);assert.equal(days['2026-11-15'],undefined);assert.equal(q['2026-11-16'].action,'restore');assert.equal(q['2026-11-16'].payload.total,30);assert.equal(q['2026-11-15'].action,'reopen');
});

test('restored day uploads and survives repeated sync on an initialized device',async()=>{
 const a=app(),remote=new Map();a.c.zahnSyncBusy=false;a.c.zahnSyncUser=null;a.c.zahnSyncStatus=()=>{};a.c.zahnQueueDay=()=>{};
 a.storage.set('zahn_sync_initialized_owner','1');a.storage.set('days',JSON.stringify({'2026-11-16':{total:30}}));a.storage.set('queue',JSON.stringify({'2026-11-16':{action:'restore',payload:{total:30}}}));
 for(const id of ['saved','reports','close'])a.els[id].classList={contains:()=>true};
 a.c.invoiceCloud.from=table=>({
  upsert:async(row,opts)=>{assert.equal(opts.ignoreDuplicates,true);if(!remote.has(row.close_date))remote.set(row.close_date,row.payload);return {}},
  select:()=>table==='zahn_invoice_records'?{order:()=>({range:async()=>({data:[]})})}:Promise.resolve({data:[...remote].map(([close_date,payload])=>({close_date,payload}))})
 });
 const sync=html.slice(html.indexOf('async function zahnAutoSync(){'),html.indexOf("window.addEventListener('online'"));vm.runInContext(sync,a.c);
 await a.c.zahnAutoSync();assert.equal(remote.get('2026-11-16').total,30);assert.deepEqual(JSON.parse(a.storage.get('queue')),{});
 await a.c.zahnAutoSync();assert.equal(a.c.loadDayCloses()['2026-11-16'].total,30);
});
