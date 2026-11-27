var Ze=Object.create;var ke=Object.defineProperty;var Qe=Object.getOwnPropertyDescriptor;var Xe=Object.getOwnPropertyNames;var qe=Object.getPrototypeOf,ea=Object.prototype.hasOwnProperty;var aa=(e,a)=>()=>(a||e((a={exports:{}}).exports,a),a.exports);var ta=(e,a,t,o)=>{if(a&&typeof a=="object"||typeof a=="function")for(let n of Xe(a))!ea.call(e,n)&&n!==t&&ke(e,n,{get:()=>a[n],enumerable:!(o=Qe(a,n))||o.enumerable});return e};var na=(e,a,t)=>(t=e!=null?Ze(qe(e)):{},ta(a||!e||!e.__esModule?ke(t,"default",{value:e,enumerable:!0}):t,e));var Ne=aa((ue,Ae)=>{"use strict";(function(e){function t(u){let d=new Uint32Array([1116352408,1899447441,3049323471,3921009573,961987163,1508970993,2453635748,2870763221,3624381080,310598401,607225278,1426881987,1925078388,2162078206,2614888103,3248222580,3835390401,4022224774,264347078,604807628,770255983,1249150122,1555081692,1996064986,2554220882,2821834349,2952996808,3210313671,3336571891,3584528711,113926993,338241895,666307205,773529912,1294757372,1396182291,1695183700,1986661051,2177026350,2456956037,2730485921,2820302411,3259730800,3345764771,3516065817,3600352804,4094571909,275423344,430227734,506948616,659060556,883997877,958139571,1322822218,1537002063,1747873779,1955562222,2024104815,2227730452,2361852424,2428436474,2756734187,3204031479,3329325298]),b=1779033703,g=3144134277,v=1013904242,w=2773480762,f=1359893119,x=2600822924,N=528734635,E=1541459225,C=new Uint32Array(64);function k(W){let Y=0,T=W.length;for(;T>=64;){let L=b,j=g,K=v,Z=w,A=f,U=x,O=N,ee=E,H,B,ae,te,re;for(B=0;B<16;B++)ae=Y+B*4,C[B]=(W[ae]&255)<<24|(W[ae+1]&255)<<16|(W[ae+2]&255)<<8|W[ae+3]&255;for(B=16;B<64;B++)H=C[B-2],te=(H>>>17|H<<15)^(H>>>19|H<<13)^H>>>10,H=C[B-15],re=(H>>>7|H<<25)^(H>>>18|H<<14)^H>>>3,C[B]=(te+C[B-7]|0)+(re+C[B-16]|0)|0;for(B=0;B<64;B++)te=(((A>>>6|A<<26)^(A>>>11|A<<21)^(A>>>25|A<<7))+(A&U^~A&O)|0)+(ee+(d[B]+C[B]|0)|0)|0,re=((L>>>2|L<<30)^(L>>>13|L<<19)^(L>>>22|L<<10))+(L&j^L&K^j&K)|0,ee=O,O=U,U=A,A=Z+te|0,Z=K,K=j,j=L,L=te+re|0;b=b+L|0,g=g+j|0,v=v+K|0,w=w+Z|0,f=f+A|0,x=x+U|0,N=N+O|0,E=E+ee|0,Y+=64,T-=64}}k(u);let $,z=u.length%64,I=u.length/536870912|0,M=u.length<<3,F=z<56?56:120,R=u.slice(u.length-z,u.length);for(R.push(128),$=z+1;$<F;$++)R.push(0);return R.push(I>>>24&255),R.push(I>>>16&255),R.push(I>>>8&255),R.push(I>>>0&255),R.push(M>>>24&255),R.push(M>>>16&255),R.push(M>>>8&255),R.push(M>>>0&255),k(R),[b>>>24&255,b>>>16&255,b>>>8&255,b>>>0&255,g>>>24&255,g>>>16&255,g>>>8&255,g>>>0&255,v>>>24&255,v>>>16&255,v>>>8&255,v>>>0&255,w>>>24&255,w>>>16&255,w>>>8&255,w>>>0&255,f>>>24&255,f>>>16&255,f>>>8&255,f>>>0&255,x>>>24&255,x>>>16&255,x>>>8&255,x>>>0&255,N>>>24&255,N>>>16&255,N>>>8&255,N>>>0&255,E>>>24&255,E>>>16&255,E>>>8&255,E>>>0&255]}function o(u,d,b){u=u.length<=64?u:t(u);let g=64+d.length+4,v=new Array(g),w=new Array(64),f,x=[];for(f=0;f<64;f++)v[f]=54;for(f=0;f<u.length;f++)v[f]^=u[f];for(f=0;f<d.length;f++)v[64+f]=d[f];for(f=g-4;f<g;f++)v[f]=0;for(f=0;f<64;f++)w[f]=92;for(f=0;f<u.length;f++)w[f]^=u[f];function N(){for(let E=g-1;E>=g-4;E--){if(v[E]++,v[E]<=255)return;v[E]=0}}for(;b>=32;)N(),x=x.concat(t(w.concat(t(v)))),b-=32;return b>0&&(N(),x=x.concat(t(w.concat(t(v))).slice(0,b))),x}function n(u,d,b,g,v){let w;for(c(u,(2*b-1)*16,v,0,16),w=0;w<2*b;w++)i(u,w*16,v,16),s(v,g),c(v,0,u,d+w*16,16);for(w=0;w<b;w++)c(u,d+w*2*16,u,w*16,16);for(w=0;w<b;w++)c(u,d+(w*2+1)*16,u,(w+b)*16,16)}function r(u,d){return u<<d|u>>>32-d}function s(u,d){c(u,0,d,0,16);for(let b=8;b>0;b-=2)d[4]^=r(d[0]+d[12],7),d[8]^=r(d[4]+d[0],9),d[12]^=r(d[8]+d[4],13),d[0]^=r(d[12]+d[8],18),d[9]^=r(d[5]+d[1],7),d[13]^=r(d[9]+d[5],9),d[1]^=r(d[13]+d[9],13),d[5]^=r(d[1]+d[13],18),d[14]^=r(d[10]+d[6],7),d[2]^=r(d[14]+d[10],9),d[6]^=r(d[2]+d[14],13),d[10]^=r(d[6]+d[2],18),d[3]^=r(d[15]+d[11],7),d[7]^=r(d[3]+d[15],9),d[11]^=r(d[7]+d[3],13),d[15]^=r(d[11]+d[7],18),d[1]^=r(d[0]+d[3],7),d[2]^=r(d[1]+d[0],9),d[3]^=r(d[2]+d[1],13),d[0]^=r(d[3]+d[2],18),d[6]^=r(d[5]+d[4],7),d[7]^=r(d[6]+d[5],9),d[4]^=r(d[7]+d[6],13),d[5]^=r(d[4]+d[7],18),d[11]^=r(d[10]+d[9],7),d[8]^=r(d[11]+d[10],9),d[9]^=r(d[8]+d[11],13),d[10]^=r(d[9]+d[8],18),d[12]^=r(d[15]+d[14],7),d[13]^=r(d[12]+d[15],9),d[14]^=r(d[13]+d[12],13),d[15]^=r(d[14]+d[13],18);for(let b=0;b<16;++b)u[b]+=d[b]}function i(u,d,b,g){for(let v=0;v<g;v++)b[v]^=u[d+v]}function c(u,d,b,g,v){for(;v--;)b[g++]=u[d++]}function l(u){if(!u||typeof u.length!="number")return!1;for(let d=0;d<u.length;d++){let b=u[d];if(typeof b!="number"||b%1||b<0||b>=256)return!1}return!0}function m(u,d){if(typeof u!="number"||u%1)throw new Error("invalid "+d);return u}function h(u,d,b,g,v,w,f){if(b=m(b,"N"),g=m(g,"r"),v=m(v,"p"),w=m(w,"dkLen"),b===0||(b&b-1)!==0)throw new Error("N must be power of 2");if(b>2147483647/128/g)throw new Error("N too large");if(g>2147483647/128/v)throw new Error("r too large");if(!l(u))throw new Error("password must be an array or buffer");if(u=Array.prototype.slice.call(u),!l(d))throw new Error("salt must be an array or buffer");d=Array.prototype.slice.call(d);let x=o(u,d,v*128*g),N=new Uint32Array(v*32*g);for(let A=0;A<N.length;A++){let U=A*4;N[A]=(x[U+3]&255)<<24|(x[U+2]&255)<<16|(x[U+1]&255)<<8|(x[U+0]&255)<<0}let E=new Uint32Array(64*g),C=new Uint32Array(32*g*b),k=32*g,$=new Uint32Array(16),z=new Uint32Array(16),I=v*b*2,M=0,F=null,R=!1,W=0,Y=0,T,L,j=f?parseInt(1e3/g):4294967295,K=typeof setImmediate<"u"?setImmediate:setTimeout,Z=function(){if(R)return f(new Error("cancelled"),M/I);let A;switch(W){case 0:L=Y*32*g,c(N,L,E,0,k),W=1,T=0;case 1:A=b-T,A>j&&(A=j);for(let O=0;O<A;O++)c(E,0,C,(T+O)*k,k),n(E,k,g,$,z);if(T+=A,M+=A,f){let O=parseInt(1e3*M/I);if(O!==F){if(R=f(null,M/I),R)break;F=O}}if(T<b)break;T=0,W=2;case 2:A=b-T,A>j&&(A=j);for(let O=0;O<A;O++){let ee=(2*g-1)*16,H=E[ee]&b-1;i(C,H*k,E,k),n(E,k,g,$,z)}if(T+=A,M+=A,f){let O=parseInt(1e3*M/I);if(O!==F){if(R=f(null,M/I),R)break;F=O}}if(T<b)break;if(c(E,0,N,L,k),Y++,Y<v){W=0;break}x=[];for(let O=0;O<N.length;O++)x.push(N[O]>>0&255),x.push(N[O]>>8&255),x.push(N[O]>>16&255),x.push(N[O]>>24&255);let U=o(u,x,w);return f&&f(null,1,U),U}f&&K(Z)};if(!f)for(;;){let A=Z();if(A!=null)return A}Z()}let _={scrypt:function(u,d,b,g,v,w,f){return new Promise(function(x,N){let E=0;f&&f(0),h(u,d,b,g,v,w,function(C,k,$){if(C)N(C);else if($)f&&E!==1&&f(1),x(new Uint8Array($));else if(f&&k!==E)return E=k,f(k)})})},syncScrypt:function(u,d,b,g,v,w){return new Uint8Array(h(u,d,b,g,v,w))}};typeof ue<"u"?Ae.exports=_:typeof define=="function"&&define.amd?define(_):e&&(e.scrypt&&(e._scrypt=e.scrypt),e.scrypt=_)})(ue)});var Te=na(Ne(),1),{scrypt:oa}=Te.default,ie=new TextEncoder,he=31e4;function De(e){return Array.from(e,a=>a.toString(16).padStart(2,"0")).join("")}function se(e){if(typeof e!="string"||e.length%2!==0||!/^[0-9a-f]+$/i.test(e))throw new Error("Hash hexadecimal inv\xE1lido.");return new Uint8Array(e.match(/.{2}/g).map(a=>parseInt(a,16)))}function be(e,a){if(e.length!==a.length)return!1;let t=0;for(let o=0;o<e.length;o++)t|=e[o]^a[o];return t===0}async function fe(e,a,t,o,n="SHA-256"){let r=await crypto.subtle.importKey("raw",ie.encode(e),"PBKDF2",!1,["deriveBits"]),s=await crypto.subtle.deriveBits({name:"PBKDF2",hash:n,salt:a,iterations:t},r,o*8);return new Uint8Array(s)}async function J(e){if(typeof e!="string"||!e)throw new Error("A senha n\xE3o pode ser vazia.");let a=crypto.getRandomValues(new Uint8Array(16)),t=await fe(e,a,he,32);return"pbkdf2_sha256$"+he+"$"+De(a)+"$"+De(t)}async function ge(e,a){if(typeof e!="string"||typeof a!="string"||!a)return!1;try{let t=e.split("$");if(t[0]==="pbkdf2_sha256"&&t.length===4){let o=Number(t[1]),n=se(t[2]),r=se(t[3]);return!Number.isSafeInteger(o)||o<1||o>2e6||r.length<16?!1:be(await fe(a,n,o,r.length),r)}if(t.length===3&&t[0].startsWith("pbkdf2:")){let[,o,n]=t[0].split(":"),r=Number(n),i={sha256:"SHA-256",sha1:"SHA-1"}[o];if(!i||!Number.isSafeInteger(r)||r<1||r>2e6)return!1;let c=se(t[2]);return be(await fe(a,ie.encode(t[1]),r,c.length,i),c)}if(t.length===3&&t[0].startsWith("scrypt:")){let[,o,n,r]=t[0].split(":"),s=Number(o),i=Number(n),c=Number(r);if(!Number.isSafeInteger(s)||s<2||(s&s-1)!==0||!Number.isSafeInteger(i)||i<1||i>32||!Number.isSafeInteger(c)||c<1||c>16||s>131072)return!1;let l=se(t[2]),m=await oa(ie.encode(a),ie.encode(t[1]),s,i,c,l.length);return be(m,l)}}catch{return!1}return!1}function ve(e){return typeof e!="string"||!e.startsWith("pbkdf2_sha256$"+he+"$")}var y=(e,a=200)=>new Response(JSON.stringify(e),{status:a,headers:{"content-type":"application/json; charset=utf-8"}});function le(e){return String(e??"").replace(/\D/g,"")}function _e(e){return String(e??"").trim().split(/\s+/).filter(Boolean).map(a=>a.length<=2?a[0]+"*".repeat(Math.max(0,a.length-1)):a.slice(0,2)+"*".repeat(Math.min(a.length-2,5))).join(" ")}function Ce(e){if(typeof e!="string"||!/^\d{4}-\d{2}-\d{2}$/.test(e))return null;let[a,t,o]=e.split("-").map(Number),n=new Date(Date.UTC(a,t-1,o));return n.getUTCFullYear()!==a||n.getUTCMonth()!==t-1||n.getUTCDate()!==o?null:{value:e,weekday:(n.getUTCDay()+6)%7}}function P(e){if(typeof e!="string"||!/^([01]\d|2[0-3]):[0-5]\d$/.test(e))return null;let[a,t]=e.split(":").map(Number);return a*60+t}function de(e){return String(Math.floor(e/60)).padStart(2,"0")+":"+String(e%60).padStart(2,"0")}function ce(e,a){return e+"T"+de(a)+":00"}function Oe(e,a,t,o){return e<o&&a>t}async function G(e,a){return e.DB.prepare("SELECT id,name,slug,whatsapp,logo_data,brand_color,theme FROM barbershops WHERE slug=?").bind(a).first()}async function Re(e,a,t){return e.DB.prepare("SELECT id,name,description,price_cents,duration_minutes FROM services WHERE id=? AND barbershop_id=? AND is_active=1").bind(t,a).first()}async function Le(e,a,t){return e.DB.prepare("SELECT id,name,role,commission_percent FROM users WHERE id=? AND barbershop_id=? AND is_active=1 AND (role='barber' OR (role='owner' AND can_serve=1))").bind(t,a).first()}async function $e(e,a,t,o){let[n,r,s]=await Promise.all([e.DB.prepare("SELECT is_open,open_time,close_time,break_start,break_end FROM business_hours WHERE barbershop_id=? AND weekday=?").bind(a,o).first(),e.DB.prepare("SELECT is_open,open_time,close_time,break_start,break_end FROM staff_hours WHERE barbershop_id=? AND user_id=? AND weekday=?").bind(a,t,o).first(),e.DB.prepare("SELECT break_start,break_end FROM staff_breaks WHERE barbershop_id=? AND user_id=? AND weekday=?").bind(a,t,o).first()]);return{business:n,personal:r,staffBreak:s,effective:r||n}}function ye(e,a){return!e&&!a?!0:P(e)!==null&&P(a)!==null&&P(a)>P(e)}async function ra(e,a){let t=await G(e,a);if(!t)return y({error:"Barbearia n\xE3o encontrada."},404);let[o,n]=await Promise.all([e.DB.prepare("SELECT id,name,description,price_cents,duration_minutes FROM services WHERE barbershop_id=? AND is_active=1 ORDER BY name COLLATE NOCASE").bind(t.id).all(),e.DB.prepare("SELECT id,name,role FROM users WHERE barbershop_id=? AND is_active=1 AND (role='barber' OR (role='owner' AND can_serve=1)) ORDER BY name COLLATE NOCASE").bind(t.id).all()]);return y({shop:t,services:o.results||[],staff:n.results||[],barbers:n.results||[],whatsapp:t.whatsapp,logo_data:t.logo_data,brand_color:t.brand_color,theme:t.theme})}async function sa(e,a){let t=await G(e,a);if(!t)return y({error:"Barbearia n\xE3o encontrada."},404);let o=await e.DB.prepare("SELECT weekday,is_open,open_time,close_time,break_start,break_end FROM business_hours WHERE barbershop_id=? ORDER BY weekday").bind(t.id).all(),n=new Map((o.results||[]).map(s=>[s.weekday,{weekday:s.weekday,is_open:!!s.is_open,open_time:s.open_time,close_time:s.close_time,break_start:s.break_start,break_end:s.break_end}])),r=Array.from({length:7},(s,i)=>n.get(i)||{weekday:i,is_open:!1,open_time:null,close_time:null,break_start:null,break_end:null});return y({barbershop:{name:t.name,slug:t.slug},days:r,weekday_reference:"0=segunda-feira, 6=domingo"})}async function ia(e,a,t){let o=await e.json().catch(()=>null);if(!o||typeof o!="object")return y({error:"Envie nome e telefone em formato JSON."},400);let n=String(o.name||"").trim(),r=le(o.phone);if(!n||n.length>120)return y({error:"Informe um nome de at\xE9 120 caracteres."},400);if(r.length<10||r.length>13)return y({error:"Informe um telefone v\xE1lido com DDD."},400);let s=await G(a,t);if(!s)return y({error:"Barbearia n\xE3o encontrada."},404);let i=await a.DB.prepare("SELECT id,name FROM customers WHERE barbershop_id=? AND phone=?").bind(s.id,r).first();if(i)return y({message:"Este telefone j\xE1 possui cadastro. Selecione o cadastro encontrado.",customer:{id:i.id,display_name:_e(i.name)},already_registered:!0});try{let c=await a.DB.prepare("INSERT INTO customers(barbershop_id,name,phone,phone_last4) VALUES(?,?,?,?)").bind(s.id,n,r,r.slice(-4)).run();return y({message:"Cadastro realizado com sucesso.",customer:{id:c.meta.last_row_id,display_name:_e(n)},already_registered:!1},201)}catch(c){let l=await a.DB.prepare("SELECT id,name FROM customers WHERE barbershop_id=? AND phone=?").bind(s.id,r).first();if(l)return y({message:"Este telefone j\xE1 possui cadastro. Selecione o cadastro encontrado.",customer:{id:l.id,display_name:_e(l.name)},already_registered:!0});throw c}}async function da(e,a,t){let o=await e.json().catch(()=>null);if(!o||typeof o!="object")return y({error:"Envie os quatro n\xFAmeros em formato JSON."},400);let n=le(o.phone_last4);if(n.length!==4)return y({error:"Informe exatamente os quatro \xFAltimos n\xFAmeros do telefone."},400);let r=await G(a,t);if(!r)return y({error:"Barbearia n\xE3o encontrada."},404);let i=((await a.DB.prepare("SELECT id,name FROM customers WHERE barbershop_id=? AND phone_last4=? ORDER BY name COLLATE NOCASE LIMIT 10").bind(r.id,n).all()).results||[]).map(c=>({id:c.id,display_name:c.name}));return y({matches:i,count:i.length,message:i.length?"Escolha seu cadastro ou informe outro telefone.":"Nenhum cadastro encontrado. Voc\xEA pode fazer um novo cadastro."})}async function ca(e,a,t){let o=await e.json().catch(()=>null);if(!o||typeof o!="object")return y({error:"Envie os dados em formato JSON."},400);let n=le(o.phone_last4),r=Number(o.customer_id);if(n.length!==4||!Number.isSafeInteger(r)||r<1)return y({error:"Informe o cadastro e os quatro \xFAltimos n\xFAmeros."},400);let s=await G(a,t);if(!s)return y({error:"Barbearia n\xE3o encontrada."},404);let i=await a.DB.prepare("SELECT id,name FROM customers WHERE id=? AND barbershop_id=? AND phone_last4=?").bind(r,s.id,n).first();return i?y({message:"Cadastro selecionado.",customer:{id:i.id,display_name:i.name},identity_verified:!1}):y({error:"Cadastro n\xE3o encontrado para esses n\xFAmeros."},404)}async function la(e,a,t){let o=await G(e,a);if(!o)return y({error:"Barbearia n\xE3o encontrada."},404);let n=Number(t.searchParams.get("service_id")),r=Number(t.searchParams.get("barber_id")),s=Ce(t.searchParams.get("date"));if(!Number.isSafeInteger(n)||n<1||!Number.isSafeInteger(r)||r<1||!s)return y({error:"Informe service_id, barber_id e date (AAAA-MM-DD)."},400);let[i,c]=await Promise.all([Re(e,o.id,n),Le(e,o.id,r)]);if(!i||!c)return y({error:"Servi\xE7o ou barbeiro indispon\xEDvel."},404);let l=await $e(e,o.id,r,s.weekday),{business:m,personal:h,staffBreak:_,effective:u}=l;if(!m||!m.is_open||!u||!u.is_open)return y({date:s.value,slots:[]});let d=P(u.open_time),b=P(u.close_time),g=P(m.open_time),v=P(m.close_time);if([d,b,g,v].some(k=>k===null)||!ye(m.break_start,m.break_end)||!ye(h?.break_start,h?.break_end)||!ye(_?.break_start,_?.break_end))return y({error:"Os hor\xE1rios de funcionamento est\xE3o configurados incorretamente."},500);let[w,f]=await Promise.all([e.DB.prepare("SELECT starts_at,ends_at FROM time_blocks WHERE barbershop_id=? AND (barber_id IS NULL OR barber_id=?) AND starts_at<? AND ends_at>?").bind(o.id,r,s.value+"T23:59:59",s.value+"T00:00:00").all(),e.DB.prepare("SELECT starts_at,ends_at FROM appointments WHERE barbershop_id=? AND barber_id=? AND status='scheduled' AND starts_at<? AND ends_at>?").bind(o.id,r,s.value+"T23:59:59",s.value+"T00:00:00").all()]),x=[...w.results||[],...f.results||[]],N=[[m.break_start,m.break_end],[u.break_start,u.break_end],[_?.break_start,_?.break_end]].filter(([k,$])=>k&&$).map(([k,$])=>[P(k),P($)]),E=[],C=Number(i.duration_minutes);if(!Number.isSafeInteger(C)||C<1||C>1440)return y({error:"A dura\xE7\xE3o do servi\xE7o est\xE1 configurada incorretamente."},500);for(let k=d;k+C<=b;k+=15){let $=k+C;if(k<g||$>v||N.some(([M,F])=>Oe(k,$,M,F)))continue;let z=ce(s.value,k),I=ce(s.value,$);x.some(M=>M.starts_at<I&&M.ends_at>z)||E.push(de(k))}return y({date:s.value,slots:E})}async function pa(e,a,t){let o=await e.json().catch(()=>null);if(!o||typeof o!="object")return y({error:"Envie os dados do agendamento em JSON."},400);let n=Number(o.customer_id),r=Number(o.service_id),s=Number(o.barber_id),i=o.starts_at,c=typeof i=="string"&&i.match(/^(\d{4}-\d{2}-\d{2})T([01]\d|2[0-3]):([0-5]\d)$/),l=c&&Ce(c[1]);if(!Number.isSafeInteger(n)||n<1||!Number.isSafeInteger(r)||r<1||!Number.isSafeInteger(s)||s<1||!l)return y({error:"Informe cliente, servi\xE7o, barbeiro e data/hora v\xE1lidos."},400);let m=Number(c[2])*60+Number(c[3]),h=await G(a,t);if(!h)return y({error:"Barbearia n\xE3o encontrada."},404);let[_,u,d]=await Promise.all([Re(a,h.id,r),a.DB.prepare("SELECT id FROM customers WHERE id=? AND barbershop_id=?").bind(n,h.id).first(),Le(a,h.id,s)]);if(!_)return y({error:"Servi\xE7o indispon\xEDvel."},404);if(!u)return y({error:"Cliente n\xE3o encontrado nesta barbearia."},404);if(!d)return y({error:"Barbeiro n\xE3o encontrado nesta barbearia."},404);let b=Number(_.duration_minutes),g=m+b;if(!Number.isSafeInteger(b)||b<1||b>1440||g>=1440)return y({error:"O servi\xE7o precisa terminar no mesmo dia."},409);let v=de(g),w=de(m),f=await $e(a,h.id,s,l.weekday),{business:x,personal:N,staffBreak:E,effective:C}=f;if(!x||!x.is_open||!C||!C.is_open)return y({error:"Esse hor\xE1rio est\xE1 fora do expediente da barbearia ou do profissional."},409);let k=P(x.open_time),$=P(x.close_time),z=P(C.open_time),I=P(C.close_time);if([k,$,z,I].some(T=>T===null)||m<k||g>$||m<z||g>I)return y({error:"Esse hor\xE1rio est\xE1 fora do expediente da barbearia ou do profissional."},409);if([[x.break_start,x.break_end],[C.break_start,C.break_end],[E?.break_start,E?.break_end]].filter(([T,L])=>T&&L).map(([T,L])=>[P(T),P(L)]).some(([T,L])=>T===null||L===null||Oe(m,g,T,L)))return y({error:"Esse hor\xE1rio coincide com um intervalo."},409);let F=ce(l.value,m),R=ce(l.value,g);if(await a.DB.prepare("SELECT id FROM time_blocks WHERE barbershop_id=? AND (barber_id IS NULL OR barber_id=?) AND starts_at<? AND ends_at>? LIMIT 1").bind(h.id,s,R,F).first())return y({error:"O barbeiro ou a barbearia est\xE1 indispon\xEDvel nesse hor\xE1rio."},409);if(await a.DB.prepare("SELECT id FROM appointments WHERE barbershop_id=? AND barber_id=? AND status='scheduled' AND starts_at<? AND ends_at>? LIMIT 1").bind(h.id,s,R,F).first())return y({error:"Esse hor\xE1rio acabou de ser ocupado. Escolha outro."},409);try{let T=await a.DB.prepare("INSERT INTO appointments(barbershop_id,customer_id,service_id,barber_id,service_name,price_cents,duration_minutes,starts_at,ends_at,commission_percent,status) VALUES(?,?,?,?,?,?,?,?,?,?,'scheduled')").bind(h.id,n,r,s,_.name,_.price_cents,b,F,R,d.commission_percent).run();return y({message:"Agendamento realizado com sucesso.",appointment:{id:T.meta.last_row_id,service:_.name,price_cents:_.price_cents,duration_minutes:b,starts_at:F,ends_at:R,status:"scheduled"}},201)}catch(T){if(String(T?.message||T).includes("appointment_conflict"))return y({error:"Esse hor\xE1rio acabou de ser ocupado. Escolha outro."},409);if(String(T?.message||T).includes("time_block_conflict"))return y({error:"O barbeiro ou a barbearia ficou indispon\xEDvel nesse hor\xE1rio."},409);throw T}}async function ma(e,a,t,o){let n=await e.json().catch(()=>null);if(!n||typeof n!="object")return y({error:"Envie o telefone para localizar o agendamento."},400);let r=le(n.phone);if(r.length<10||r.length>13)return y({error:"Informe o telefone completo com DDD."},400);let s=await G(a,t);if(!s)return y({error:"Barbearia n\xE3o encontrada."},404);let i=await a.DB.prepare("SELECT a.id,a.status FROM appointments a JOIN customers c ON c.id=a.customer_id AND c.barbershop_id=a.barbershop_id WHERE a.id=? AND a.barbershop_id=? AND c.phone=?").bind(o,s.id,r).first();return i?i.status!=="scheduled"?y({error:"Esse agendamento n\xE3o est\xE1 mais ativo."},409):(await a.DB.prepare("UPDATE appointments SET status='cancelled',cancellation_reason='Cancelado pelo cliente',cancelled_at=CURRENT_TIMESTAMP WHERE id=? AND barbershop_id=? AND status='scheduled'").bind(o,s.id).run()).meta.changes?y({message:"Agendamento cancelado com sucesso."}):y({error:"Esse agendamento j\xE1 foi alterado."},409):y({error:"Agendamento n\xE3o encontrado para esses dados."},404)}async function ne(e,a,t){let o=t.pathname.match(/^\/api\/public\/shops\/([a-z0-9-]+)\/catalog$/);if(o&&e.method==="GET")return ra(a,o[1]);let n=t.pathname.match(/^\/api\/public\/shops\/([a-z0-9-]+)\/schedule$/);if(n&&e.method==="GET")return sa(a,n[1]);let r=t.pathname.match(/^\/api\/public\/shops\/([a-z0-9-]+)\/customers$/);if(r&&e.method==="POST")return ia(e,a,r[1]);let s=t.pathname.match(/^\/api\/public\/shops\/([a-z0-9-]+)\/customers\/lookup$/);if(s&&e.method==="POST")return da(e,a,s[1]);let i=t.pathname.match(/^\/api\/public\/shops\/([a-z0-9-]+)\/customers\/confirm$/);if(i&&e.method==="POST")return ca(e,a,i[1]);let c=t.pathname.match(/^\/api\/public\/shops\/([a-z0-9-]+)\/availability$/);if(c&&e.method==="GET")return la(a,c[1],t);let l=t.pathname.match(/^\/api\/public\/shops\/([a-z0-9-]+)\/appointments\/(\d+)\/cancel$/);if(l&&e.method==="POST")return ma(e,a,l[1],Number(l[2]));let m=t.pathname.match(/^\/api\/public\/shops\/([a-z0-9-]+)\/appointments$/);return m&&e.method==="POST"?pa(e,a,m[1]):null}var S=(e,a=200,t={})=>new Response(JSON.stringify(e),{status:a,headers:{"content-type":"application/json; charset=utf-8",...t}});async function ua(e,a){let o=(e.headers.get("Cookie")||"").split(";").map(n=>n.trim()).find(n=>n.startsWith("barber_session="))?.slice(15);return o?a.DB.prepare("SELECT s.id,s.user_id,s.barbershop_id,s.role,u.name,u.is_active,u.role AS account_role,u.can_serve,u.commission_percent,b.slug AS barbershop_slug FROM auth_sessions s JOIN users u ON u.id=s.user_id JOIN barbershops b ON b.id=s.barbershop_id WHERE s.id=? AND s.expires_at>datetime('now') AND u.is_active=1").bind(o).first():null}async function ba(e,a){let t=await ua(e,a);return!t||t.role!=="barber"||!(t.account_role==="barber"||t.account_role==="owner"&&t.can_serve)?{error:S({error:"Acesso n\xE3o autorizado. Fa\xE7a login."},401)}:{session:t}}function ha(e){if(typeof e!="string"||!/^\d{4}-\d{2}-\d{2}$/.test(e))return!1;let[a,t,o]=e.split("-").map(Number),n=new Date(Date.UTC(a,t-1,o));return n.getUTCFullYear()===a&&n.getUTCMonth()===t-1&&n.getUTCDate()===o}function Q(e){if(typeof e!="string"||!/^([01]\d|2[0-3]):[0-5]\d$/.test(e))return null;let[a,t]=e.split(":").map(Number);return a*60+t}function Me(e){return e.toISOString().slice(0,10)}function Be(e,a){let t=new Date(e+"T00:00:00.000Z");return t.setUTCDate(t.getUTCDate()+a),Me(t)}function fa(e){let a=new Date(e+"T00:00:00.000Z").getUTCDay();return Be(e,-((a+6)%7))}function ga(e){return e.slice(0,7)+"-01"}function va(e){let[a,t]=e.split("-").map(Number);return Me(new Date(Date.UTC(a,t,0)))}function _a(e,a){return Math.round(Number(e)*Number(a||0)/100)}async function ya(e,a,t,o=null){let n=o?" AND a.status IN ('scheduled','completed','cancelled')":"";return e.DB.prepare("SELECT a.id,a.service_name,a.price_cents,a.starts_at,a.ends_at,a.status,a.commission_percent,a.commission_cents,a.duration_minutes,a.cancellation_reason,u.commission_percent AS current_commission_percent FROM appointments a JOIN users u ON u.id=a.barber_id AND u.barbershop_id=a.barbershop_id WHERE a.id=? AND a.barbershop_id=? AND a.barber_id=?"+n).bind(t,a.barbershop_id,a.user_id).first()}async function Pe(e,a,t,o=!1){let n=o?"":" AND a.status='scheduled'",r=await e.DB.prepare("SELECT a.id,a.service_name,a.price_cents,a.starts_at,a.commission_percent,u.commission_percent AS current_commission_percent FROM appointments a JOIN users u ON u.id=a.barber_id AND u.barbershop_id=a.barbershop_id WHERE a.id=? AND a.barbershop_id=? AND a.barber_id=?"+n).bind(t,a.barbershop_id,a.user_id).first();if(!r)return S({error:"Atendimento ativo n\xE3o encontrado na sua agenda."},404);let s=r.commission_percent??r.current_commission_percent??0,i=_a(r.price_cents,s),c=o?"":" AND status='scheduled'";return await e.DB.batch([e.DB.prepare("UPDATE appointments SET status='completed',cancellation_reason=NULL,cancelled_at=NULL,commission_percent=?,commission_cents=? WHERE id=? AND barbershop_id=? AND barber_id=?"+c).bind(s,i,t,a.barbershop_id,a.user_id),e.DB.prepare("INSERT OR IGNORE INTO finance_entries(barbershop_id,entry_type,description,category,amount_cents,entry_date,appointment_id) VALUES(?,'income',?,'Atendimentos',?,date(?),?)").bind(a.barbershop_id,"Atendimento conclu\xEDdo: "+r.service_name,r.price_cents,r.starts_at,t)]),S({message:"Atendimento conclu\xEDdo e registrado no financeiro.",commission_cents:i})}async function wa(e,a,t,o){let n=await e.json().catch(()=>null);if(!n||typeof n!="object")return S({error:"Informe o motivo do cancelamento."},400);let r=String(n.reason||"").trim();return!r||r.length>250?S({error:"O motivo deve ter entre 1 e 250 caracteres."},400):(await a.DB.prepare("UPDATE appointments SET status='cancelled',cancellation_reason=?,cancelled_at=CURRENT_TIMESTAMP WHERE id=? AND barbershop_id=? AND barber_id=? AND status='scheduled'").bind(r,o,t.barbershop_id,t.user_id).run()).meta.changes?S({message:"Atendimento cancelado com sucesso."}):S({error:"Atendimento ativo n\xE3o encontrado na sua agenda."},404)}async function xa(e,a,t,o){let n=await e.json().catch(()=>null);if(!n||typeof n!="object")return S({error:"Informe o novo status."},400);let r=n.status;if(!["scheduled","completed","cancelled"].includes(r))return S({error:"Status inv\xE1lido."},400);let s=await ya(a,t,o);if(!s)return S({error:"Atendimento n\xE3o encontrado na sua agenda."},404);if(s.status===r)return S({message:"O atendimento j\xE1 est\xE1 com esse status."});if(r==="completed")return Pe(a,t,o,!0);if(r==="cancelled"){let i=String(n.reason||"").trim();return!i||i.length>250?S({error:"Informe o motivo do cancelamento (at\xE9 250 caracteres)."},400):(await a.DB.batch([a.DB.prepare("UPDATE appointments SET status='cancelled',cancellation_reason=?,cancelled_at=CURRENT_TIMESTAMP,commission_cents=0 WHERE id=? AND barbershop_id=? AND barber_id=?").bind(i,o,t.barbershop_id,t.user_id),a.DB.prepare("DELETE FROM finance_entries WHERE appointment_id=? AND barbershop_id=?").bind(o,t.barbershop_id)]),S({message:"Status do atendimento atualizado com sucesso."}))}try{return await a.DB.batch([a.DB.prepare("UPDATE appointments SET status='scheduled',cancellation_reason=NULL,cancelled_at=NULL,commission_cents=0 WHERE id=? AND barbershop_id=? AND barber_id=?").bind(o,t.barbershop_id,t.user_id),a.DB.prepare("DELETE FROM finance_entries WHERE appointment_id=? AND barbershop_id=?").bind(o,t.barbershop_id)]),S({message:"Status do atendimento atualizado com sucesso."})}catch(i){if(String(i?.message||i).includes("appointment_conflict"))return S({error:"N\xE3o \xE9 poss\xEDvel reabrir: esse hor\xE1rio j\xE1 possui outro atendimento agendado."},409);throw i}}async function Ea(e,a){let[t,o,n]=await Promise.all([e.DB.prepare("SELECT weekday,is_open,open_time,close_time,break_start,break_end FROM business_hours WHERE barbershop_id=? ORDER BY weekday").bind(a.barbershop_id).all(),e.DB.prepare("SELECT weekday,is_open,open_time,close_time,break_start,break_end FROM staff_hours WHERE barbershop_id=? AND user_id=? ORDER BY weekday").bind(a.barbershop_id,a.user_id).all(),e.DB.prepare("SELECT weekday,break_start,break_end FROM staff_breaks WHERE barbershop_id=? AND user_id=? ORDER BY weekday").bind(a.barbershop_id,a.user_id).all()]),r=new Map((t.results||[]).map(l=>[l.weekday,l])),s=new Map((o.results||[]).map(l=>[l.weekday,l])),i=new Map((n.results||[]).map(l=>[l.weekday,l])),c=Array.from({length:7},(l,m)=>{let h=r.get(m)||{weekday:m,is_open:0,open_time:null,close_time:null,break_start:null,break_end:null},_=s.get(m),u=i.get(m),d=_||h,b=u?.break_start??(_?.break_start||h.break_start),g=u?.break_end??(_?.break_end||h.break_end);return{weekday:m,is_open:!!d.is_open,open_time:d.open_time,close_time:d.close_time,break_start:b,break_end:g,has_personal_schedule:!!_,has_individual_break:!!u,business_break_start:h.break_start,business_break_end:h.break_end}});return S({days:c})}async function Sa(e,a,t){let o=await e.json().catch(()=>null);if(!o||!Array.isArray(o.days)||o.days.length!==7)return S({error:"Envie a pausa dos sete dias da semana."},400);let n=new Date().toISOString().slice(0,10),r=new Set,s=[];for(let i of o.days){let c=i?.weekday;if(!Number.isInteger(c)||c<0||c>6||r.has(c))return S({error:"Cada dia deve aparecer uma \xFAnica vez."},400);r.add(c);let l=i.break_start||null,m=i.break_end||null;if(l===null!=(m===null))return S({error:"Informe in\xEDcio e fim do almo\xE7o, ou deixe os dois vazios."},400);let[h,_]=await Promise.all([a.DB.prepare("SELECT is_open,open_time,close_time FROM business_hours WHERE barbershop_id=? AND weekday=?").bind(t.barbershop_id,c).first(),a.DB.prepare("SELECT is_open,open_time,close_time FROM staff_hours WHERE barbershop_id=? AND user_id=? AND weekday=?").bind(t.barbershop_id,t.user_id,c).first()]);if(l!==null){let u=Q(l),d=Q(m),b=_||h;if(u===null||d===null||d<=u)return S({error:"O almo\xE7o deve usar hor\xE1rios v\xE1lidos no formato HH:MM."},400);let g=Q(b?.open_time),v=Q(b?.close_time);if(!h?.is_open||!b?.is_open||g===null||v===null||u<=g||d>=v)return S({error:"O almo\xE7o precisa ficar dentro de um dia com expediente."},400);let w=await a.DB.prepare("SELECT starts_at,ends_at FROM appointments WHERE barbershop_id=? AND barber_id=? AND status='scheduled' AND starts_at>=?").bind(t.barbershop_id,t.user_id,n+"T00:00:00").all();for(let f of w.results||[]){let x=f.starts_at.slice(0,10);if((new Date(x+"T00:00:00Z").getUTCDay()+6)%7===c&&Q(f.starts_at.slice(11,16))<d&&Q(f.ends_at.slice(11,16))>u)return S({error:"J\xE1 existe um agendamento futuro nesse hor\xE1rio de almo\xE7o. Ajuste ou remarque primeiro."},409)}}l===null?s.push(a.DB.prepare("DELETE FROM staff_breaks WHERE barbershop_id=? AND user_id=? AND weekday=?").bind(t.barbershop_id,t.user_id,c)):s.push(a.DB.prepare("INSERT INTO staff_breaks(barbershop_id,user_id,weekday,break_start,break_end) VALUES(?,?,?,?,?) ON CONFLICT(barbershop_id,user_id,weekday) DO UPDATE SET break_start=excluded.break_start,break_end=excluded.break_end").bind(t.barbershop_id,t.user_id,c,l,m))}return await a.DB.batch(s),S({message:"Hor\xE1rios de almo\xE7o atualizados."})}async function ka(e,a,t){let o=t.searchParams.get("period")||"weekly",n=new Date().toISOString().slice(0,10),r,s;if(o==="daily")r=s=n;else if(o==="weekly")r=fa(n),s=Be(r,6);else if(o==="monthly")r=ga(n),s=va(n);else if(o==="yearly")r=n.slice(0,4)+"-01-01",s=n.slice(0,4)+"-12-31";else return S({error:"Per\xEDodo inv\xE1lido."},400);let[i,c]=await Promise.all([e.DB.prepare("SELECT COUNT(*) AS completed_count,COALESCE(SUM(price_cents),0) AS sales_cents,COALESCE(SUM(commission_cents),0) AS commission_cents FROM appointments WHERE barbershop_id=? AND barber_id=? AND status='completed' AND date(starts_at) BETWEEN ? AND ?").bind(a.barbershop_id,a.user_id,r,s).first(),e.DB.prepare("SELECT commission_percent FROM users WHERE id=? AND barbershop_id=?").bind(a.user_id,a.barbershop_id).first()]);return S({period:o,start:r,end:s,commission_percent:c?.commission_percent||0,completed_count:i?.completed_count||0,sales_cents:i?.sales_cents||0,commission_cents:i?.commission_cents||0})}async function Ie(e,a,t){if(!t.pathname.startsWith("/api/barber/"))return null;let o=t.pathname.match(/^\/api\/barber\/shops\/([a-z0-9-]+)\/staff$/);if(o&&e.method==="GET"){let l=await a.DB.prepare("SELECT id FROM barbershops WHERE slug=?").bind(o[1]).first();if(!l)return S({error:"Barbearia n\xE3o encontrada."},404);let m=await a.DB.prepare("SELECT id,name,role FROM users WHERE barbershop_id=? AND is_active=1 AND (role='barber' OR (role='owner' AND can_serve=1)) AND pin_hash IS NOT NULL ORDER BY name COLLATE NOCASE").bind(l.id).all();return S({staff:m.results||[]})}let n=await ba(e,a);if(n.error)return n.error;let r=n.session;if(t.pathname==="/api/barber/me"&&e.method==="GET")return S({id:r.user_id,barbershop_id:r.barbershop_id,name:r.name,role:"barber",commission_percent:r.commission_percent||0});if(t.pathname==="/api/barber/appointments"&&e.method==="GET"){let l=t.searchParams.get("date"),m=t.searchParams.get("from"),h=t.searchParams.get("to"),_=t.searchParams.get("status");for(let g of[l,m,h].filter(Boolean))if(!ha(g))return S({error:"A data deve usar AAAA-MM-DD."},400);if(_&&!["scheduled","completed","cancelled"].includes(_))return S({error:"Status inv\xE1lido."},400);let u=["a.barbershop_id=?","a.barber_id=?"],d=[r.barbershop_id,r.user_id];l&&(u.push("substr(a.starts_at,1,10)=?"),d.push(l)),m&&(u.push("substr(a.starts_at,1,10)>=?"),d.push(m)),h&&(u.push("substr(a.starts_at,1,10)<=?"),d.push(h)),_&&(u.push("a.status=?"),d.push(_));let b=await a.DB.prepare("SELECT a.id,a.service_name,a.price_cents,a.duration_minutes,a.starts_at,a.ends_at,a.status,a.cancellation_reason,c.name AS customer_name FROM appointments a JOIN customers c ON c.id=a.customer_id AND c.barbershop_id=a.barbershop_id WHERE "+u.join(" AND ")+" ORDER BY a.starts_at LIMIT 300").bind(...d).all();return S({appointments:b.results||[]})}if(t.pathname==="/api/barber/customers"&&e.method==="GET"){let l=await a.DB.prepare("SELECT id,name FROM customers WHERE barbershop_id=? ORDER BY name COLLATE NOCASE LIMIT 1000").bind(r.barbershop_id).all();return S({customers:l.results||[]})}if(t.pathname==="/api/barber/services"&&e.method==="GET"){let l=await a.DB.prepare("SELECT id,name,price_cents,duration_minutes FROM services WHERE barbershop_id=? AND is_active=1 ORDER BY name COLLATE NOCASE").bind(r.barbershop_id).all();return S({services:l.results||[]})}if(t.pathname==="/api/barber/commissions"&&e.method==="GET")return ka(a,r,t);if(t.pathname==="/api/barber/schedule"&&e.method==="GET")return Ea(a,r);if(t.pathname==="/api/barber/schedule"&&e.method==="PUT")return Sa(e,a,r);if(t.pathname==="/api/barber/availability"&&e.method==="GET"){let l=new URL(t);return l.pathname="/api/public/shops/"+r.barbershop_slug+"/availability",l.searchParams.set("barber_id",String(r.user_id)),ne(e,a,l)}if(t.pathname==="/api/barber/appointments"&&e.method==="POST"){let l=await e.json().catch(()=>null);if(!l||typeof l!="object")return S({error:"Informe os dados do agendamento."},400);l.barber_id=r.user_id;let m=new Request(e.url,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(l)}),h=new URL(t);return h.pathname="/api/public/shops/"+r.barbershop_slug+"/appointments",ne(m,a,h)}let s=t.pathname.match(/^\/api\/barber\/appointments\/(\d+)\/complete$/);if(s&&e.method==="POST")return Pe(a,r,Number(s[1]));let i=t.pathname.match(/^\/api\/barber\/appointments\/(\d+)\/cancel$/);if(i&&e.method==="POST")return wa(e,a,r,Number(i[1]));let c=t.pathname.match(/^\/api\/barber\/appointments\/(\d+)\/status$/);return c&&e.method==="PATCH"?xa(e,a,r,Number(c[1])):S({error:"Rota do profissional ainda n\xE3o migrada.",path:t.pathname},501)}var p=(e,a=200)=>new Response(JSON.stringify(e),{status:a,headers:{"content-type":"application/json; charset=utf-8"}});async function Aa(e,a){let o=(e.headers.get("Cookie")||"").split(";").map(n=>n.trim()).find(n=>n.startsWith("barber_session="))?.slice(15);return o?a.DB.prepare("SELECT s.id,s.user_id,s.barbershop_id,s.role,u.name,u.email,u.role AS account_role,u.is_active,b.slug AS barbershop_slug FROM auth_sessions s JOIN users u ON u.id=s.user_id JOIN barbershops b ON b.id=s.barbershop_id WHERE s.id=? AND s.expires_at>datetime('now') AND u.is_active=1 AND u.role='owner'").bind(o).first():null}function X(e){if(typeof e!="string"||!/^\d{4}-\d{2}-\d{2}$/.test(e))return!1;let[a,t,o]=e.split("-").map(Number),n=new Date(Date.UTC(a,t-1,o));return n.getUTCFullYear()===a&&n.getUTCMonth()===t-1&&n.getUTCDate()===o}function q(e){let a=String(e??"").trim().replace(",",".");if(!/^\d+(\.\d{1,2})?$/.test(a))throw new Error("Informe um valor v\xE1lido em reais.");let[t,o=""]=a.split("."),n=Number(t)*100+Number(o.padEnd(2,"0"));if(!Number.isSafeInteger(n)||n<0||n>1e8)throw new Error("Informe um valor entre R$ 0,00 e R$ 1.000.000,00.");return n}function We(e){return e.toISOString().slice(0,10)}function we(e,a){let t=new Date(e+"T00:00:00.000Z");return t.setUTCDate(t.getUTCDate()+a),We(t)}function je(e){let a=new Date(e+"T00:00:00.000Z").getUTCDay();return we(e,-((a+6)%7))}function pe(e,a=new Date().toISOString().slice(0,10)){if(!X(a))throw new Error("Data atual inv\xE1lida.");if(e==="today")return{start:a,end:a};if(e==="week")return{start:je(a),end:a};if(e==="month")return{start:a.slice(0,7)+"-01",end:a};if(e==="year")return{start:a.slice(0,4)+"-01-01",end:a};throw new Error("Per\xEDodo inv\xE1lido. Use today, week, month ou year.")}async function xe(e,a){let[t,o]=await Promise.all([e.DB.prepare("SELECT id,name,amount_cents FROM fixed_costs WHERE barbershop_id=? ORDER BY id").bind(a).all(),e.DB.prepare("SELECT desired_profit_cents FROM financial_settings WHERE barbershop_id=?").bind(a).first()]),n=t.results||[],r=n.reduce((s,i)=>s+Number(i.amount_cents),0);return{fixedCosts:n,desiredProfit:o?.desired_profit_cents||0,totalCosts:r}}async function Je(e,a,t,o){let n=await e.DB.prepare("SELECT weekday,is_open FROM business_hours WHERE barbershop_id=?").bind(a).all(),r=n.results?.length?new Set(n.results.filter(i=>i.is_open).map(i=>i.weekday)):new Set([0,1,2,3,4,5]),s=[];for(let i=t;i<=o;i=we(i,1)){let c=(new Date(i+"T00:00:00.000Z").getUTCDay()+6)%7;r.has(c)&&s.push(i)}return s}async function He(e,a,t,o){let n=await xe(e,a),r=String(t).padStart(4,"0")+"-"+String(o).padStart(2,"0")+"-01",s=new Date(Date.UTC(t,o+1,0)),i=We(s),c=await Je(e,a,r,i),l=n.totalCosts+n.desiredProfit,m=c.length?Math.round(l/c.length):0;return{monthlyTarget:l,dailyTarget:m,openDays:c.length}}async function Na(e,a,t){let[o,n]=t.split("-"),r=Number(o),s=Number(n),i=await He(e,a,r,s),c=je(t),l=we(c,6),m=await Je(e,a,c,l),h=0;for(let _ of m){let[u,d]=_.split("-").map(Number),b=await He(e,a,u,d);h+=b.dailyTarget}return{daily:i.dailyTarget,weekly:h,monthly:i.monthlyTarget}}async function Da(e,a){let t=await xe(e,a);return p({fixed_costs:t.fixedCosts,fixed_costs_total_cents:t.totalCosts,desired_profit_cents:t.desiredProfit})}async function Ta(e,a,t){let o=await e.json().catch(()=>null);if(!o||typeof o!="object"||!Array.isArray(o.fixed_costs))return p({error:"Informe as despesas fixas e o lucro desejado."},400);if(o.fixed_costs.length>50)return p({error:"Cadastre no m\xE1ximo 50 despesas fixas."},400);let n,r=[];try{n=q(o.desired_profit??0);for(let i of o.fixed_costs){if(!i||typeof i!="object")throw new Error("Uma das despesas est\xE1 inv\xE1lida.");let c=String(i.name||"").trim(),l=q(i.amount);if(!c||c.length>100||l<=0)throw new Error("Cada despesa precisa de nome e valor maior que zero.");r.push({name:c,amount:l})}}catch(i){return p({error:i.message},400)}let s=[a.DB.prepare("DELETE FROM fixed_costs WHERE barbershop_id=?").bind(t),...r.map(i=>a.DB.prepare("INSERT INTO fixed_costs(barbershop_id,name,amount_cents) VALUES(?,?,?)").bind(t,i.name,i.amount)),a.DB.prepare("INSERT INTO financial_settings(barbershop_id,desired_profit_cents) VALUES(?,?) ON CONFLICT(barbershop_id) DO UPDATE SET desired_profit_cents=excluded.desired_profit_cents,updated_at=CURRENT_TIMESTAMP").bind(t,n)];return await a.DB.batch(s),p({message:"Despesas fixas e lucro desejado salvos."})}async function Ca(e,a,t){let o=t.searchParams.get("period")||"month",n;try{n=pe(o)}catch(h){return p({error:h.message},400)}await e.DB.prepare("INSERT OR IGNORE INTO finance_entries(barbershop_id,entry_type,description,category,amount_cents,entry_date,appointment_id) SELECT barbershop_id,'income','Atendimento conclu\xEDdo: '||service_name,'Atendimentos',price_cents,date(starts_at),id FROM appointments WHERE barbershop_id=? AND status='completed'").bind(a).run();let[r,s,i]=await Promise.all([e.DB.prepare("SELECT COALESCE(SUM(CASE WHEN entry_type='income' THEN amount_cents ELSE 0 END),0) AS income,COALESCE(SUM(CASE WHEN entry_type='expense' THEN amount_cents ELSE 0 END),0) AS expenses,COUNT(*) AS count FROM finance_entries WHERE barbershop_id=? AND entry_date>=? AND entry_date<=?").bind(a,n.start,n.end).first(),Na(e,a,new Date().toISOString().slice(0,10)),xe(e,a)]),c=new Date().toISOString().slice(0,10),l={daily:pe("today",c),weekly:pe("week",c),monthly:pe("month",c)},m={};for(let[h,_]of Object.entries(l)){let u=await e.DB.prepare("SELECT COALESCE(SUM(price_cents),0) AS amount FROM appointments WHERE barbershop_id=? AND status='completed' AND substr(starts_at,1,10)>=? AND substr(starts_at,1,10)<=?").bind(a,_.start,_.end).first();m[h]=u?.amount||0}return p({period:o,start:n.start,end:n.end,income_cents:r?.income||0,expense_cents:r?.expenses||0,profit_cents:(r?.income||0)-(r?.expenses||0),entry_count:r?.count||0,goals:s,goal_achieved:m,fixed_costs_total_cents:i.totalCosts,desired_profit_cents:i.desiredProfit})}async function Oa(e,a,t){let o=t.searchParams.get("from"),n=t.searchParams.get("to");if(o&&!X(o))return p({error:"Data inicial inv\xE1lida."},400);if(n&&!X(n))return p({error:"Data final inv\xE1lida."},400);let r=["barbershop_id=?"],s=[a];o&&(r.push("entry_date>=?"),s.push(o)),n&&(r.push("entry_date<=?"),s.push(n));let i=await e.DB.prepare("SELECT id,entry_type,description,category,amount_cents,entry_date,appointment_id FROM finance_entries WHERE "+r.join(" AND ")+" ORDER BY entry_date DESC,id DESC LIMIT 500").bind(...s).all();return p({entries:i.results||[]})}async function Ra(e,a,t){let o=await e.json().catch(()=>null);if(!o||typeof o!="object")return p({error:"Envie o lan\xE7amento em JSON."},400);let n=o.entry_type,r=String(o.description||"").trim(),s=String(o.category||"").trim()||null,i=o.entry_date||new Date().toISOString().slice(0,10),c;try{c=q(o.amount)}catch(m){return p({error:m.message},400)}if(!["income","expense"].includes(n))return p({error:"Selecione entrada ou sa\xEDda."},400);if(!r||r.length>160||c<=0)return p({error:"Informe descri\xE7\xE3o e valor maior que zero."},400);if(!X(i))return p({error:"Data do lan\xE7amento inv\xE1lida."},400);let l=await a.DB.prepare("INSERT INTO finance_entries(barbershop_id,entry_type,description,category,amount_cents,entry_date) VALUES(?,?,?,?,?,?)").bind(t,n,r,s,c,i).run();return p({message:"Lan\xE7amento salvo.",id:l.meta.last_row_id},201)}async function La(e,a,t){return(await e.DB.prepare("DELETE FROM finance_entries WHERE id=? AND barbershop_id=? AND appointment_id IS NULL").bind(t,a).run()).meta.changes?p({message:"Lan\xE7amento removido."}):p({error:"Lan\xE7amento manual n\xE3o encontrado."},404)}async function $a(e,a,t){let o=await e.json().catch(()=>null);if(!o||typeof o!="object")return p({error:"Envie as metas em JSON."},400);let n=[];try{for(let r of["daily","weekly","monthly"]){let s=q(o[r]??0);n.push(a.DB.prepare("INSERT INTO financial_goals(barbershop_id,period_type,target_cents) VALUES(?,?,?) ON CONFLICT(barbershop_id,period_type) DO UPDATE SET target_cents=excluded.target_cents,updated_at=CURRENT_TIMESTAMP").bind(t,r,s))}}catch(r){return p({error:r.message},400)}return await a.DB.batch(n),p({message:"Metas financeiras atualizadas."})}async function Ma(e,a,t){let o=t.searchParams.get("date"),n=t.searchParams.get("from"),r=t.searchParams.get("to"),s=t.searchParams.get("status");for(let m of[o,n,r].filter(Boolean))if(!X(m))return p({error:"A data deve usar AAAA-MM-DD."},400);if(s&&!["scheduled","completed","cancelled"].includes(s))return p({error:"Status de agendamento inv\xE1lido."},400);let i=["a.barbershop_id=?"],c=[a];o&&(i.push("substr(a.starts_at,1,10)=?"),c.push(o)),n&&(i.push("substr(a.starts_at,1,10)>=?"),c.push(n)),r&&(i.push("substr(a.starts_at,1,10)<=?"),c.push(r)),s&&(i.push("a.status=?"),c.push(s));let l=await e.DB.prepare("SELECT a.id,a.barber_id,a.service_name,a.price_cents,a.duration_minutes,a.starts_at,a.ends_at,a.status,a.cancellation_reason,c.name AS customer_name,u.name AS barber_name FROM appointments a JOIN customers c ON c.id=a.customer_id AND c.barbershop_id=a.barbershop_id LEFT JOIN users u ON u.id=a.barber_id AND u.barbershop_id=a.barbershop_id WHERE "+i.join(" AND ")+" ORDER BY a.starts_at LIMIT 500").bind(...c).all();return p({appointments:l.results||[]})}async function Ba(e,a,t,o){let n=await e.json().catch(()=>null);if(!n||typeof n!="object")return p({error:"Informe o motivo do cancelamento."},400);let r=String(n.reason||"").trim();return!r||r.length>250?p({error:"O motivo deve ter entre 1 e 250 caracteres."},400):(await a.DB.prepare("UPDATE appointments SET status='cancelled',cancellation_reason=?,cancelled_at=CURRENT_TIMESTAMP WHERE id=? AND barbershop_id=? AND status='scheduled'").bind(r,o,t).run()).meta.changes?p({message:"Agendamento cancelado com sucesso."}):p({error:"Agendamento ativo n\xE3o encontrado nesta barbearia."},404)}async function Pa(e,a,t,o){let n=await e.json().catch(()=>null);if(!n||typeof n!="object")return p({error:"Informe o profissional do agendamento."},400);let r=null,s=null;if(n.barber_id!==null&&n.barber_id!==""){if(r=Number(n.barber_id),!Number.isSafeInteger(r)||r<1)return p({error:"Selecione um profissional v\xE1lido."},400);let c=await a.DB.prepare("SELECT id,commission_percent FROM users WHERE id=? AND barbershop_id=? AND is_active=1 AND (role='barber' OR (role='owner' AND can_serve=1))").bind(r,t).first();if(!c)return p({error:"Esse profissional n\xE3o est\xE1 dispon\xEDvel para atendimento."},400);s=c.commission_percent||0}let i=await a.DB.prepare("SELECT id,starts_at,ends_at,status FROM appointments WHERE id=? AND barbershop_id=?").bind(o,t).first();if(!i)return p({error:"Agendamento n\xE3o encontrado."},404);if(i.status!=="scheduled")return p({error:"S\xF3 \xE9 poss\xEDvel editar o barbeiro de um agendamento ativo."},409);if(r!==null&&await a.DB.prepare("SELECT id FROM appointments WHERE barbershop_id=? AND barber_id=? AND id<>? AND status='scheduled' AND starts_at<? AND ends_at>? LIMIT 1").bind(t,r,o,i.ends_at,i.starts_at).first())return p({error:"Esse profissional j\xE1 possui outro atendimento nesse hor\xE1rio."},409);try{return(await a.DB.prepare("UPDATE appointments SET barber_id=?,commission_percent=?,commission_cents=0 WHERE id=? AND barbershop_id=? AND status='scheduled'").bind(r,s,o,t).run()).meta.changes?p({message:"Profissional do agendamento atualizado."}):p({error:"Agendamento n\xE3o encontrado ou j\xE1 alterado."},409)}catch(c){if(String(c?.message||c).includes("appointment_conflict"))return p({error:"Esse profissional j\xE1 possui outro atendimento nesse hor\xE1rio."},409);throw c}}async function Ia(e,a,t){let o=await e.DB.prepare("SELECT a.id,a.service_name,a.price_cents,a.starts_at,a.commission_percent,u.commission_percent AS current_commission_percent FROM appointments a LEFT JOIN users u ON u.id=a.barber_id AND u.barbershop_id=a.barbershop_id WHERE a.id=? AND a.barbershop_id=? AND a.status='scheduled'").bind(t,a).first();if(!o)return p({error:"Agendamento ativo n\xE3o encontrado."},404);let n=o.commission_percent??o.current_commission_percent??0,r=Math.round(Number(o.price_cents)*Number(n)/100);return await e.DB.batch([e.DB.prepare("UPDATE appointments SET status='completed',commission_percent=?,commission_cents=? WHERE id=? AND barbershop_id=? AND status='scheduled'").bind(n,r,t,a),e.DB.prepare("INSERT OR IGNORE INTO finance_entries(barbershop_id,entry_type,description,category,amount_cents,entry_date,appointment_id) VALUES(?,'income',?,'Atendimentos',?,date(?),?)").bind(a,"Atendimento conclu\xEDdo: "+o.service_name,o.price_cents,o.starts_at,t)]),p({message:"Atendimento conclu\xEDdo e registrado no financeiro.",commission_cents:r})}function Ee(e){let a=String(e??"0").trim().replace(",",".");if(!/^\d{1,3}(\.\d{1,2})?$/.test(a))throw new Error("A comiss\xE3o deve ser uma porcentagem entre 0 e 100.");let t=Number(a);if(!Number.isFinite(t)||t<0||t>100)throw new Error("A comiss\xE3o deve ser uma porcentagem entre 0 e 100.");return Math.round(t*100)/100}function V(e,a){if(typeof e!="string"||!/^([01]\d|2[0-3]):[0-5]\d$/.test(e))throw new Error("Informe "+a+" no formato HH:MM.");return e}function Fe(e,a){if(typeof e!="string"||!/^\d{4}-\d{2}-\d{2}T([01]\d|2[0-3]):[0-5]\d$/.test(e))throw new Error(a+" deve usar o formato AAAA-MM-DDTHH:MM.");let[t,o]=e.split("T");if(!X(t))throw new Error(a+" cont\xE9m uma data inv\xE1lida.");return e+":00"}async function Ha(e,a){let t=await e.DB.prepare("SELECT id,name,description,price_cents,duration_minutes,is_active FROM services WHERE barbershop_id=? ORDER BY is_active DESC,name COLLATE NOCASE").bind(a).all();return p({services:(t.results||[]).map(o=>({...o,price:(Number(o.price_cents)/100).toFixed(2),is_active:!!o.is_active}))})}async function Ue(e,a,t,o=null){let n=await e.json().catch(()=>null);if(!n||typeof n!="object"||!o&&!n.name)return p({error:"Envie os dados do servi\xE7o em JSON."},400);let r=null;if(o&&(r=await a.DB.prepare("SELECT id,name,description,price_cents,duration_minutes,is_active FROM services WHERE id=? AND barbershop_id=?").bind(o,t).first(),!r))return p({error:"Servi\xE7o n\xE3o encontrado."},404);let s=String(n.name??r?.name??"").trim(),i=n.description!==void 0?n.description:r?.description,c=i==null?null:String(i).trim()||null,l;try{l=n.price!==void 0?q(n.price):Number(r?.price_cents)}catch(u){return p({error:u.message},400)}let m=n.duration_minutes!==void 0?Number(n.duration_minutes):Number(r?.duration_minutes);if(!s||s.length>120||c&&c.length>500)return p({error:"Informe nome v\xE1lido e descri\xE7\xE3o de at\xE9 500 caracteres."},400);if(!Number.isSafeInteger(l)||l<=0||l>1e8)return p({error:"Informe um pre\xE7o v\xE1lido em reais."},400);if(!Number.isSafeInteger(m)||m<1||m>1440)return p({error:"A dura\xE7\xE3o deve estar entre 1 e 1440 minutos."},400);let h=r?!!r.is_active:!0;if(n.is_active!==void 0){if(typeof n.is_active!="boolean")return p({error:"is_active deve ser verdadeiro ou falso."},400);h=n.is_active}if(o)return await a.DB.prepare("UPDATE services SET name=?,description=?,price_cents=?,duration_minutes=?,is_active=? WHERE id=? AND barbershop_id=?").bind(s,c,l,m,Number(h),o,t).run(),p({message:"Servi\xE7o atualizado com sucesso.",service:{id:o,name:s,description:c,price_cents:l,duration_minutes:m,is_active:h}});let _=await a.DB.prepare("INSERT INTO services(barbershop_id,name,description,price_cents,duration_minutes) VALUES(?,?,?,?,?)").bind(t,s,c,l,m).run();return p({message:"Servi\xE7o cadastrado com sucesso.",service:{id:_.meta.last_row_id,name:s,description:c,price_cents:l,duration_minutes:m,is_active:!0}},201)}async function Fa(e,a,t){return(await e.DB.prepare("UPDATE services SET is_active=0 WHERE id=? AND barbershop_id=?").bind(t,a).run()).meta.changes?p({message:"Servi\xE7o desativado. O hist\xF3rico foi preservado."}):p({error:"Servi\xE7o n\xE3o encontrado."},404)}async function Ua(e,a){let[t,o]=await Promise.all([e.DB.prepare("SELECT id,name,role,is_active,can_serve,commission_percent FROM users WHERE barbershop_id=? AND role='barber' ORDER BY is_active DESC,name COLLATE NOCASE").bind(a).all(),e.DB.prepare("SELECT id,name,role,is_active,can_serve,commission_percent FROM users WHERE barbershop_id=? AND role='owner' LIMIT 1").bind(a).first()]),n=t.results||[];return o&&n.unshift(o),p({barbers:n.map(r=>({...r,is_active:!!r.is_active,can_serve:!!r.can_serve}))})}async function za(e,a,t){let o=await e.json().catch(()=>null);if(!o||typeof o!="object")return p({error:"Envie os dados do colaborador em JSON."},400);let n=String(o.name||"").trim(),r=o.pin,s;try{s=Ee(o.commission_percent??0)}catch(c){return p({error:c.message},400)}if(!n||n.length>120)return p({error:"Informe um nome de at\xE9 120 caracteres."},400);if(typeof r!="string"||!/^\d{4}$/.test(r))return p({error:"O PIN deve conter exatamente quatro n\xFAmeros."},400);let i=await a.DB.prepare("INSERT INTO users(barbershop_id,name,pin_hash,role,is_active,can_serve,commission_percent) VALUES(?,?,?,'barber',1,1,?)").bind(t,n,await J(r),s).run();return p({message:"Colaborador cadastrado com sucesso.",barber:{id:i.meta.last_row_id,name:n,role:"barber",commission_percent:s}},201)}async function Wa(e,a,t,o){let n=await e.json().catch(()=>null);if(!n||typeof n!="object"||!Object.keys(n).length)return p({error:"Envie os dados que deseja atualizar."},400);let r=await a.DB.prepare("SELECT id,name,is_active,commission_percent FROM users WHERE id=? AND barbershop_id=? AND role='barber'").bind(o,t).first();if(!r)return p({error:"Colaborador n\xE3o encontrado."},404);let s=String(n.name??r.name).trim(),i=n.is_active??!!r.is_active;if(!s||s.length>120)return p({error:"Informe um nome de at\xE9 120 caracteres."},400);if(typeof i!="boolean")return p({error:"Estado de ativa\xE7\xE3o inv\xE1lido."},400);let c;try{c=Ee(n.commission_percent??r.commission_percent??0)}catch(m){return p({error:m.message},400)}let l=null;if(n.pin!==void 0&&n.pin!==""){if(typeof n.pin!="string"||!/^\d{4}$/.test(n.pin))return p({error:"O PIN deve conter exatamente quatro n\xFAmeros."},400);l=await J(n.pin)}return l?await a.DB.prepare("UPDATE users SET name=?,is_active=?,pin_hash=?,commission_percent=?,can_serve=CASE WHEN ?=1 THEN 1 ELSE can_serve END WHERE id=? AND barbershop_id=?").bind(s,Number(i),l,c,Number(i),o,t).run():await a.DB.prepare("UPDATE users SET name=?,is_active=?,commission_percent=?,can_serve=CASE WHEN ?=1 THEN 1 ELSE can_serve END WHERE id=? AND barbershop_id=?").bind(s,Number(i),c,Number(i),o,t).run(),p({message:"Colaborador atualizado.",barber:{id:o,name:s,is_active:i,commission_percent:c}})}async function ja(e,a,t){return(await e.DB.prepare("UPDATE users SET is_active=0 WHERE id=? AND barbershop_id=? AND role='barber'").bind(t,a).run()).meta.changes?p({message:"Colaborador desativado. O hist\xF3rico foi preservado."}):p({error:"Colaborador n\xE3o encontrado."},404)}async function Ja(e,a,t){let o=await e.json().catch(()=>null);if(!o||typeof o!="object"||typeof o.can_serve!="boolean")return p({error:"Informe can_serve como verdadeiro ou falso."},400);let n=await a.DB.prepare("SELECT pin_hash,commission_percent FROM users WHERE id=? AND barbershop_id=? AND role='owner'").bind(t.user_id,t.barbershop_id).first(),r=n?.pin_hash||null,s;try{s=Ee(o.commission_percent??n?.commission_percent??0)}catch(i){return p({error:i.message},400)}if(o.can_serve){if(o.pin){if(typeof o.pin!="string"||!/^\d{4}$/.test(o.pin))return p({error:"O PIN do propriet\xE1rio deve ter quatro n\xFAmeros."},400);r=await J(o.pin)}if(!r)return p({error:"Defina um PIN de quatro n\xFAmeros para aparecer como profissional."},400)}return await a.DB.prepare("UPDATE users SET can_serve=?,pin_hash=?,commission_percent=? WHERE id=? AND barbershop_id=? AND role='owner'").bind(Number(o.can_serve),r,s,t.user_id,t.barbershop_id).run(),p({message:"Prefer\xEAncia de atendimento do propriet\xE1rio atualizada."})}async function Ga(e,a){let t=await e.DB.prepare("SELECT id,name,phone,created_at FROM customers WHERE barbershop_id=? ORDER BY name COLLATE NOCASE LIMIT 1000").bind(a).all();return p({customers:t.results||[]})}async function Va(e,a){let t=await e.DB.prepare("SELECT name,logo_data,brand_color,theme,whatsapp FROM barbershops WHERE id=?").bind(a).first();return t?p(t):p({error:"Barbearia n\xE3o encontrada."},404)}async function Ya(e,a,t){let o=await e.json().catch(()=>null);if(!o||typeof o!="object")return p({error:"Envie as configura\xE7\xF5es em JSON."},400);let n=String(o.name||"").trim(),r=String(o.whatsapp||"").replace(/\D/g,""),s=String(o.brand_color||"#a8f05a").trim(),i=String(o.theme||"dark").trim().toLowerCase();return!n||n.length>120?p({error:"Informe um nome de barbearia v\xE1lido."},400):/^#[0-9a-fA-F]{6}$/.test(s)?["dark","light"].includes(i)?(await a.DB.prepare("UPDATE barbershops SET name=?,whatsapp=?,brand_color=?,theme=? WHERE id=?").bind(n,r||null,s.toLowerCase(),i,t).run(),p({message:"Identidade da barbearia atualizada."})):p({error:"Tema inv\xE1lido."},400):p({error:"Escolha uma cor v\xE1lida."},400)}async function Ka(e,a,t){let n=(await e.formData().catch(()=>null))?.get("logo");if(!n||typeof n.arrayBuffer!="function")return p({error:"Selecione uma imagem para enviar."},400);if(Number(n.size)>512*1024)return p({error:"A imagem deve ter no m\xE1ximo 512 KB."},400);let r=new Uint8Array(await n.arrayBuffer());if(!r.length||r.length>512*1024)return p({error:"A imagem deve ter no m\xE1ximo 512 KB."},400);let s=null;if(r.length>=8&&[137,80,78,71,13,10,26,10].every((l,m)=>r[m]===l)?s="image/png":r.length>=3&&r[0]===255&&r[1]===216&&r[2]===255?s="image/jpeg":r.length>=12&&String.fromCharCode(...r.slice(0,4))==="RIFF"&&String.fromCharCode(...r.slice(8,12))==="WEBP"?s="image/webp":r.length>=6&&["GIF87a","GIF89a"].includes(String.fromCharCode(...r.slice(0,6)))&&(s="image/gif"),!s)return p({error:"Use uma imagem PNG, JPG, WEBP ou GIF v\xE1lida."},400);let i="";for(let l=0;l<r.length;l+=32768)i+=String.fromCharCode(...r.subarray(l,l+32768));let c="data:"+s+";base64,"+btoa(i);return await a.DB.prepare("UPDATE barbershops SET logo_data=? WHERE id=?").bind(c,t).run(),p({message:"Logo atualizada com sucesso.",logo_data:c})}async function Za(e,a){await e.DB.prepare("INSERT OR IGNORE INTO finance_entries(barbershop_id,entry_type,description,category,amount_cents,entry_date,appointment_id) SELECT barbershop_id,'income','Atendimento conclu\xEDdo: '||service_name,'Atendimentos',price_cents,date(starts_at),id FROM appointments WHERE barbershop_id=? AND status='completed'").bind(a).run();let t=new Date().toISOString().slice(0,10),o=t.slice(0,7),[n,r,s,i]=await Promise.all([e.DB.prepare("SELECT COUNT(*) AS appointments_today,SUM(CASE WHEN status='scheduled' THEN 1 ELSE 0 END) AS scheduled_today,SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) AS completed_today,SUM(CASE WHEN status='cancelled' THEN 1 ELSE 0 END) AS cancelled_today FROM appointments WHERE barbershop_id=? AND substr(starts_at,1,10)=?").bind(a,t).first(),e.DB.prepare("SELECT COUNT(*) AS appointments_month FROM appointments WHERE barbershop_id=? AND substr(starts_at,1,7)=?").bind(a,o).first(),e.DB.prepare("SELECT COALESCE(SUM(CASE WHEN entry_date=? AND entry_type='income' THEN amount_cents ELSE 0 END),0) AS today_income,COALESCE(SUM(CASE WHEN substr(entry_date,1,7)=? AND entry_type='income' THEN amount_cents ELSE 0 END),0) AS month_income FROM finance_entries WHERE barbershop_id=?").bind(t,o,a).first(),e.DB.prepare("SELECT (SELECT COUNT(*) FROM customers WHERE barbershop_id=?) AS customers,(SELECT COUNT(*) FROM services WHERE barbershop_id=? AND is_active=1) AS active_services,(SELECT COUNT(*) FROM users WHERE barbershop_id=? AND role IN ('barber','owner') AND is_active=1 AND can_serve=1) AS active_barbers").bind(a,a,a).first()]);return p({today:{appointments:n?.appointments_today||0,scheduled:n?.scheduled_today||0,completed:n?.completed_today||0,cancelled:n?.cancelled_today||0,revenue_cents:s?.today_income||0},month:{appointments:r?.appointments_month||0,revenue_cents:s?.month_income||0},base:i||{customers:0,active_services:0,active_barbers:0}})}async function Qa(e,a){let t=await e.DB.prepare("SELECT weekday,is_open,open_time,close_time,break_start,break_end FROM business_hours WHERE barbershop_id=? ORDER BY weekday").bind(a).all(),o=new Map((t.results||[]).map(n=>[n.weekday,{weekday:n.weekday,is_open:!!n.is_open,open_time:n.open_time,close_time:n.close_time,break_start:n.break_start,break_end:n.break_end}]));return p({days:Array.from({length:7},(n,r)=>o.get(r)||{weekday:r,is_open:!1,open_time:null,close_time:null,break_start:null,break_end:null}),weekday_reference:"0=segunda-feira, 6=domingo"})}async function Xa(e,a,t){let o=await e.json().catch(()=>null);if(!o||!Array.isArray(o.days)||o.days.length<1||o.days.length>7)return p({error:"Envie entre 1 e 7 dias em 'days'."},400);let n=new Set,r=[];for(let s of o.days){let i=s?.weekday;if(!Number.isInteger(i)||i<0||i>6||n.has(i))return p({error:"Cada dia deve aparecer uma \xFAnica vez e usar weekday de 0 a 6."},400);if(n.add(i),typeof s.is_open!="boolean")return p({error:"is_open deve ser verdadeiro ou falso."},400);let c=null,l=null,m=null,h=null,_=Number(s.is_open);if(_)try{if(c=V(s.open_time,"abertura"),l=V(s.close_time,"fechamento"),l<=c)throw new Error("O fechamento deve ser depois da abertura.");if(s.break_start==null!=(s.break_end==null))throw new Error("Informe in\xEDcio e fim do intervalo ou deixe ambos vazios.");if(s.break_start!=null&&(m=V(s.break_start,"in\xEDcio do intervalo"),h=V(s.break_end,"fim do intervalo"),!(c<m&&m<h&&h<l)))throw new Error("O intervalo deve ficar dentro do hor\xE1rio de funcionamento.")}catch(u){return p({error:u.message},400)}r.push(a.DB.prepare("INSERT INTO business_hours(barbershop_id,weekday,is_open,open_time,close_time,break_start,break_end) VALUES(?,?,?,?,?,?,?) ON CONFLICT(barbershop_id,weekday) DO UPDATE SET is_open=excluded.is_open,open_time=excluded.open_time,close_time=excluded.close_time,break_start=excluded.break_start,break_end=excluded.break_end").bind(t,i,_,c,l,m,h))}return await a.DB.batch(r),p({message:"Hor\xE1rios atualizados com sucesso."})}async function qa(e,a){let t=await e.DB.prepare("SELECT b.id,b.barber_id,u.name AS barber_name,b.starts_at,b.ends_at,b.reason FROM time_blocks b LEFT JOIN users u ON u.id=b.barber_id AND u.barbershop_id=b.barbershop_id WHERE b.barbershop_id=? ORDER BY b.starts_at").bind(a).all();return p({blocks:t.results||[]})}async function et(e,a,t){let o=await e.json().catch(()=>null);if(!o||typeof o!="object")return p({error:"Envie os dados do bloqueio em JSON."},400);let n,r;try{if(n=Fe(o.starts_at,"starts_at"),r=Fe(o.ends_at,"ends_at"),r<=n)throw new Error("O fim do bloqueio deve ser depois do in\xEDcio.")}catch(l){return p({error:l.message},400)}let s=o.reason==null?null:String(o.reason).trim()||null;if(s&&s.length>250)return p({error:"O motivo deve ter at\xE9 250 caracteres."},400);let i=null;if(o.barber_id!=null&&o.barber_id!==""){if(i=Number(o.barber_id),!Number.isSafeInteger(i)||i<1)return p({error:"Barbeiro inv\xE1lido."},400);if(!await a.DB.prepare("SELECT id FROM users WHERE id=? AND barbershop_id=? AND role IN ('barber','owner') AND is_active=1").bind(i,t.barbershop_id).first())return p({error:"Barbeiro n\xE3o encontrado nesta barbearia."},404)}let c=await a.DB.prepare("INSERT INTO time_blocks(barbershop_id,barber_id,starts_at,ends_at,reason,created_by) VALUES(?,?,?,?,?,?)").bind(t.barbershop_id,i,n,r,s,t.user_id).run();return p({message:"Bloqueio cadastrado com sucesso.",block:{id:c.meta.last_row_id,barber_id:i,starts_at:n,ends_at:r,reason:s}},201)}async function at(e,a,t){return(await e.DB.prepare("DELETE FROM time_blocks WHERE id=? AND barbershop_id=?").bind(t,a).run()).meta.changes?p({message:"Bloqueio removido com sucesso."}):p({error:"Bloqueio n\xE3o encontrado."},404)}async function tt(e,a,t){let o=await e.DB.prepare("SELECT id,name,role,is_active,can_serve FROM users WHERE id=? AND barbershop_id=? AND role IN ('owner','barber')").bind(t,a).first();if(!o)return p({error:"Profissional n\xE3o encontrado."},404);let n=await e.DB.prepare("SELECT weekday,is_open,open_time,close_time,break_start,break_end FROM staff_hours WHERE barbershop_id=? AND user_id=? ORDER BY weekday").bind(a,t).all(),r=new Map((n.results||[]).map(s=>[s.weekday,s]));return p({user:o,days:Array.from({length:7},(s,i)=>r.get(i)||{weekday:i,is_open:!1,open_time:null,close_time:null,break_start:null,break_end:null}),uses_business_hours_when_unset:!(n.results||[]).length})}async function nt(e,a,t,o){if(!await a.DB.prepare("SELECT id FROM users WHERE id=? AND barbershop_id=? AND role IN ('owner','barber')").bind(o,t).first())return p({error:"Profissional n\xE3o encontrado."},404);let r=await e.json().catch(()=>null);if(!r||!Array.isArray(r.days)||r.days.length!==7)return p({error:"Envie os sete dias da semana."},400);let s=new Set,i=[];for(let c of r.days){let l=c?.weekday;if(!Number.isInteger(l)||l<0||l>6||s.has(l))return p({error:"Cada dia da semana deve aparecer uma \xFAnica vez."},400);if(s.add(l),typeof c.is_open!="boolean")return p({error:"Selecione se o profissional atende em cada dia."},400);let m=Number(c.is_open),h=null,_=null,u=null,d=null;if(m)try{if(h=V(c.open_time,"abertura"),_=V(c.close_time,"fechamento"),_<=h)throw new Error("O fechamento deve ser depois da abertura.");if(c.break_start==null!=(c.break_end==null))throw new Error("Informe os dois hor\xE1rios do intervalo.");if(c.break_start!=null&&(u=V(c.break_start,"in\xEDcio do intervalo"),d=V(c.break_end,"fim do intervalo"),!(h<u&&u<d&&d<_)))throw new Error("O intervalo precisa ficar dentro do expediente.")}catch(b){return p({error:b.message},400)}i.push(a.DB.prepare("INSERT INTO staff_hours(barbershop_id,user_id,weekday,is_open,open_time,close_time,break_start,break_end) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(barbershop_id,user_id,weekday) DO UPDATE SET is_open=excluded.is_open,open_time=excluded.open_time,close_time=excluded.close_time,break_start=excluded.break_start,break_end=excluded.break_end").bind(t,o,l,m,h,_,u,d))}return await a.DB.batch(i),p({message:"Hor\xE1rios individuais salvos."})}async function ot(e,a,t){return await e.DB.prepare("SELECT id FROM users WHERE id=? AND barbershop_id=? AND role IN ('owner','barber')").bind(t,a).first()?(await e.DB.prepare("DELETE FROM staff_hours WHERE barbershop_id=? AND user_id=?").bind(a,t).run(),p({message:"Expediente individual removido. O profissional voltou a usar o hor\xE1rio da barbearia."})):p({error:"Profissional n\xE3o encontrado."},404)}async function rt(e,a){let t=await e.DB.prepare("SELECT id,name,description,price_cents,is_active FROM products WHERE barbershop_id=? ORDER BY is_active DESC,name COLLATE NOCASE").bind(a).all();return p({products:(t.results||[]).map(o=>({...o,is_active:!!o.is_active}))})}async function ze(e,a,t,o=null){let n=await e.json().catch(()=>null);if(!n||typeof n!="object")return p({error:"Envie os dados do produto em JSON."},400);let r=null;if(o&&(r=await a.DB.prepare("SELECT id,name,description,price_cents,is_active FROM products WHERE id=? AND barbershop_id=?").bind(o,t).first(),!r))return p({error:"Produto n\xE3o encontrado."},404);let s=String(n.name??r?.name??"").trim(),i=n.description!==void 0?n.description:r?.description,c=i==null?null:String(i).trim()||null,l;try{l=n.price!==void 0?q(n.price):Number(r?.price_cents)}catch(_){return p({error:_.message},400)}let m=r?!!r.is_active:!0;if(n.is_active!==void 0){if(typeof n.is_active!="boolean")return p({error:"is_active deve ser verdadeiro ou falso."},400);m=n.is_active}if(!s||s.length>120||c&&c.length>500||!Number.isSafeInteger(l)||l<=0)return p({error:"Nome, descri\xE7\xE3o ou pre\xE7o inv\xE1lidos."},400);if(o)return await a.DB.prepare("UPDATE products SET name=?,description=?,price_cents=?,is_active=? WHERE id=? AND barbershop_id=?").bind(s,c,l,Number(m),o,t).run(),p({message:"Produto atualizado."});let h=await a.DB.prepare("INSERT INTO products(barbershop_id,name,description,price_cents) VALUES(?,?,?,?)").bind(t,s,c,l).run();return p({message:"Produto cadastrado.",product:{id:h.meta.last_row_id,name:s,description:c,price_cents:l,is_active:!0}},201)}async function st(e,a,t){return(await e.DB.prepare("UPDATE products SET is_active=0 WHERE id=? AND barbershop_id=?").bind(t,a).run()).meta.changes?p({message:"Produto desativado."}):p({error:"Produto n\xE3o encontrado."},404)}async function Ge(e,a,t){if(!t.pathname.startsWith("/api/admin/"))return null;let o=await Aa(e,a);if(!o||o.role!=="owner"||o.account_role!=="owner")return p({error:"Acesso n\xE3o autorizado. Fa\xE7a login como propriet\xE1rio."},401);let n=o.barbershop_id;if(t.pathname==="/api/admin/dashboard"&&e.method==="GET")return Za(a,n);if(t.pathname==="/api/admin/customers"&&e.method==="GET")return Ga(a,n);if(t.pathname==="/api/admin/barbershop"&&e.method==="GET")return Va(a,n);if(t.pathname==="/api/admin/barbershop/settings"&&e.method==="POST")return Ya(e,a,n);if(t.pathname==="/api/admin/barbershop/logo"&&e.method==="POST")return Ka(e,a,n);if(t.pathname==="/api/admin/schedule"&&e.method==="GET")return Qa(a,n);if(t.pathname==="/api/admin/schedule"&&e.method==="PUT")return Xa(e,a,n);if(t.pathname==="/api/admin/blocks"&&e.method==="GET")return qa(a,n);if(t.pathname==="/api/admin/blocks"&&e.method==="POST")return et(e,a,o);let r=t.pathname.match(/^\/api\/admin\/blocks\/(\d+)$/);if(r&&e.method==="DELETE")return at(a,n,Number(r[1]));if(t.pathname==="/api/admin/services"&&e.method==="GET")return Ha(a,n);if(t.pathname==="/api/admin/services"&&e.method==="POST")return Ue(e,a,n);let s=t.pathname.match(/^\/api\/admin\/services\/(\d+)$/);if(s&&e.method==="PATCH")return Ue(e,a,n,Number(s[1]));if(s&&e.method==="DELETE")return Fa(a,n,Number(s[1]));if(t.pathname==="/api/admin/barbers"&&e.method==="GET")return Ua(a,n);if(t.pathname==="/api/admin/barbers"&&e.method==="POST")return za(e,a,n);let i=t.pathname.match(/^\/api\/admin\/barbers\/(\d+)$/);if(i&&e.method==="PATCH")return Wa(e,a,n,Number(i[1]));if(i&&e.method==="DELETE")return ja(a,n,Number(i[1]));if(t.pathname==="/api/admin/staff/owner"&&e.method==="PATCH")return Ja(e,a,o);let c=t.pathname.match(/^\/api\/admin\/staff\/(\d+)\/schedule$/);if(c&&e.method==="GET")return tt(a,n,Number(c[1]));if(c&&e.method==="PUT")return nt(e,a,n,Number(c[1]));if(c&&e.method==="DELETE")return ot(a,n,Number(c[1]));if(t.pathname==="/api/admin/products"&&e.method==="GET")return rt(a,n);if(t.pathname==="/api/admin/products"&&e.method==="POST")return ze(e,a,n);let l=t.pathname.match(/^\/api\/admin\/products\/(\d+)$/);if(l&&e.method==="PATCH")return ze(e,a,n,Number(l[1]));if(l&&e.method==="DELETE")return st(a,n,Number(l[1]));if(t.pathname==="/api/admin/appointments"&&e.method==="GET")return Ma(a,n,t);let m=t.pathname.match(/^\/api\/admin\/appointments\/(\d+)\/cancel$/);if(m&&e.method==="POST")return Ba(e,a,n,Number(m[1]));let h=t.pathname.match(/^\/api\/admin\/appointments\/(\d+)\/barber$/);if(h&&e.method==="PATCH")return Pa(e,a,n,Number(h[1]));let _=t.pathname.match(/^\/api\/admin\/appointments\/(\d+)\/complete$/);if(_&&e.method==="POST")return Ia(a,n,Number(_[1]));if(t.pathname==="/api/admin/finance/config"&&e.method==="GET")return Da(a,n);if(t.pathname==="/api/admin/finance/config"&&e.method==="PUT")return Ta(e,a,n);if(t.pathname==="/api/admin/finance/summary"&&e.method==="GET")return Ca(a,n,t);if(t.pathname==="/api/admin/finance/entries"&&e.method==="GET")return Oa(a,n,t);if(t.pathname==="/api/admin/finance/entries"&&e.method==="POST")return Ra(e,a,n);if(t.pathname==="/api/admin/finance/goals"&&e.method==="PUT")return $a(e,a,n);let u=t.pathname.match(/^\/api\/admin\/finance\/entries\/(\d+)$/);return u&&e.method==="DELETE"?La(a,n,Number(u[1])):p({error:"Rota administrativa ainda n\xE3o migrada.",path:t.pathname},501)}var Se=`<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#090909"><title>Administra\xE7\xE3o | BARBER-SYSTEM</title>
<style>
:root{color-scheme:dark;--bg:#080909;--panel:#111414;--panel2:#171b19;--line:#292f2b;--muted:#9aa39c;--text:#f3f6f3;--accent:#a8f05a;--danger:#ff7777;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text)}button,input,select,textarea{font:inherit}button{cursor:pointer;border:1px solid transparent;border-radius:10px;padding:10px 14px;background:var(--accent);color:#10140c;font-weight:750}button:disabled{opacity:.5;cursor:not-allowed}button.secondary{background:#202622;color:#e9eee9;border-color:#343e36}button.ghost{background:transparent;color:#dce4dc;border-color:#39423a}button.danger{background:#351d1d;color:#ffb1b1;border-color:#653333}input,select,textarea{width:100%;padding:11px 12px;background:#0b0e0c;color:#f5f7f5;border:1px solid #39413b;border-radius:9px;min-width:0}input[type=checkbox]{width:auto;accent-color:var(--accent)}input[type=color]{height:44px;padding:4px}textarea{min-height:78px;resize:vertical}label{display:block;color:#b5beb6;font-size:12px;font-weight:650;margin:12px 0 6px}.muted{color:var(--muted);font-size:13px;line-height:1.5}.tiny{font-size:11px;color:#89938b}.hidden{display:none!important}.message{min-height:18px;margin-top:8px;color:var(--accent);font-size:13px;white-space:pre-wrap}.error{color:var(--danger)}.row{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}.row>*{min-width:0}.actions{display:flex;gap:8px;flex-wrap:wrap}.actions button{width:auto}.field-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.field-grid.three{grid-template-columns:repeat(3,minmax(0,1fr))}.field-grid.four{grid-template-columns:repeat(4,minmax(0,1fr))}.stack{display:grid;gap:12px}.panel{background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:18px}.panel h2,.panel h3{margin:0 0 8px}.section-head{margin-bottom:18px}.section-head h1{font-size:27px;margin:0 0 5px}.section-head p{margin:0}.eyebrow{font-size:11px;letter-spacing:.18em;color:var(--accent);font-weight:800}.metric-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.metric{background:linear-gradient(140deg,#151b16,#101311);border:1px solid #2a352c;border-radius:14px;padding:15px}.metric span{display:block;color:#9ba69d;font-size:12px}.metric strong{display:block;font-size:24px;margin-top:7px;letter-spacing:-.03em}.metric small{color:#849087}.layout{display:grid;grid-template-columns:248px minmax(0,1fr);min-height:100vh}.sidebar{border-right:1px solid var(--line);background:#0b0e0c;padding:22px 14px;display:flex;flex-direction:column;gap:18px;position:sticky;top:0;height:100vh}.logo-line{display:flex;align-items:center;gap:11px;padding:0 9px 16px;border-bottom:1px solid var(--line)}.mark{width:38px;height:38px;display:grid;place-items:center;border-radius:11px;background:var(--accent);color:#10140c;font-weight:950;font-size:18px}.logo-line strong{font-size:14px;letter-spacing:.09em}.logo-line small{display:block;color:#859087;font-size:10px;letter-spacing:.14em;margin-top:3px}.nav{display:grid;gap:5px}.nav button{width:100%;text-align:left;background:transparent;color:#aab4ac;border:1px solid transparent;padding:12px;font-weight:650;display:flex;align-items:center;gap:10px}.nav button.active,.nav button:hover{background:#1a211b;color:var(--accent);border-color:#2e3b2c}.nav .nav-icon{width:20px;text-align:center;font-size:15px}.sidebar-foot{margin-top:auto;padding:12px 9px;border-top:1px solid var(--line)}.main{padding:25px clamp(16px,3vw,38px) 60px;max-width:1600px;width:100%;margin:0 auto}.topbar{display:flex;justify-content:space-between;align-items:center;gap:16px;margin-bottom:26px}.topbar .shop-name{font-size:13px;color:#9da79e}.topbar button{width:auto}.view{display:none}.view.active{display:block}.two-col{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(300px,.8fr);gap:14px}.three-col{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.list{display:grid;gap:9px}.list-row{padding:13px;border:1px solid var(--line);border-radius:12px;background:#101411;display:flex;justify-content:space-between;gap:14px;align-items:center}.list-row .main-copy{min-width:0}.list-row strong{display:block;overflow-wrap:anywhere}.list-row p{margin:4px 0 0}.pill{display:inline-flex;align-items:center;padding:4px 8px;border-radius:100px;background:#1d2b1d;color:var(--accent);font-size:11px;font-weight:750}.pill.off{background:#2a2525;color:#c4a0a0}.table-wrap{overflow:auto;border:1px solid var(--line);border-radius:12px}table{width:100%;border-collapse:collapse;min-width:600px}th,td{text-align:left;padding:12px;border-bottom:1px solid var(--line);font-size:13px;vertical-align:middle}th{color:#9ba69d;font-weight:650;background:#141916}tr:last-child td{border-bottom:0}.progress{height:8px;background:#252d27;border-radius:100px;overflow:hidden;margin:8px 0}.progress span{display:block;height:100%;background:var(--accent);border-radius:100px}.chart{display:flex;align-items:end;gap:8px;height:150px;padding:15px 4px 0;border-bottom:1px solid var(--line)}.chart-col{flex:1;min-width:0;height:100%;display:flex;flex-direction:column;justify-content:end;align-items:center;gap:6px}.chart-bar{width:min(100%,34px);min-height:3px;background:linear-gradient(180deg,#b7f975,#4e7a33);border-radius:6px 6px 0 0}.chart-col small{font-size:10px;color:#8f9a91;white-space:nowrap}.day-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:8px}.day-col{min-width:0;border:1px solid var(--line);border-radius:12px;background:#101411;padding:10px}.day-col.today{border-color:#779c54}.day-col h3{font-size:12px;margin:0 0 8px;color:#aab6ab}.day-col h3 span{display:block;color:var(--accent);font-size:16px;margin-top:3px}.event{background:#1b241b;border-left:3px solid var(--accent);border-radius:7px;padding:8px;margin:7px 0;font-size:11px;overflow-wrap:anywhere}.event.cancelled{border-color:#875050;background:#251a1a}.event.completed{border-color:#657f67}.event b{display:block;font-size:12px;margin-bottom:3px}.weekday-row{display:grid;grid-template-columns:110px repeat(5,minmax(0,1fr));gap:8px;align-items:center;padding:8px 0;border-bottom:1px solid var(--line)}.weekday-row:first-child{border-top:1px solid var(--line)}.inline{display:flex;gap:8px;align-items:center}.inline>*{flex:1}.inline input[type=checkbox]{flex:0}.schedule-row{display:grid;grid-template-columns:110px 70px repeat(4,minmax(0,1fr));gap:8px;align-items:center;padding:8px 0;border-bottom:1px solid var(--line)}.schedule-row .day-name{font-size:13px}.schedule-row input{padding:9px 7px;font-size:12px}.schedule-row .check{display:flex;align-items:center;gap:5px;font-size:11px;color:#aeb7af}
.agenda-toolbar{align-items:center}.agenda-filters{display:flex;gap:8px;align-items:center}.agenda-filters select{width:auto;min-width:170px;max-width:240px}
.calendar-scroll{overflow:auto;border:1px solid var(--line);border-radius:13px;background:#0c100d;max-height:760px}
.calendar-grid{display:grid;min-width:100%;width:max-content;grid-template-rows:52px auto}
.calendar-head-row{display:grid;grid-template-columns:68px repeat(var(--lane-count),minmax(190px,1fr));position:sticky;top:0;z-index:4;background:#151b16;border-bottom:1px solid #303a32}
.calendar-head-cell{padding:14px 10px;font-size:12px;font-weight:800;color:#dce6dc;border-left:1px solid #303a32;white-space:nowrap}
.calendar-head-cell:first-child{border-left:0}
.calendar-body-row{display:grid;grid-template-columns:68px repeat(var(--lane-count),minmax(190px,1fr))}
.calendar-time-axis{position:relative;background:#111713;border-right:1px solid #303a32}
.calendar-time-label{position:absolute;right:8px;transform:translateY(-7px);font-size:10px;color:#87948a;font-variant-numeric:tabular-nums}
.calendar-lane{position:relative;min-width:190px;border-right:1px solid #29322b;background:repeating-linear-gradient(to bottom,transparent 0,transparent calc(var(--hour-height) - 1px),#29322b calc(var(--hour-height) - 1px),#29322b var(--hour-height))}
.calendar-lane:last-child{border-right:0}
.calendar-lane-empty{position:absolute;top:18px;left:8px;right:8px;text-align:center;color:#667168;font-size:11px;pointer-events:none}
.calendar-appointment{position:absolute;left:5px;right:5px;z-index:2;padding:5px 6px;border-radius:8px;border-left:3px solid var(--accent);background:#1b2a1b;color:#eff8e9;overflow:hidden;min-height:28px;box-shadow:0 2px 8px #0005}
.calendar-appointment.completed{background:#202b22;border-left-color:#a7c7a7}
.calendar-appointment.cancelled{background:#2a1b1b;border-left-color:#b66c6c;color:#f0dada}
.calendar-appointment .appt-time{display:block;font-size:9px;color:#b6c8b2;line-height:1.2;margin-bottom:2px;font-variant-numeric:tabular-nums}
.calendar-appointment strong{display:block;font-size:11px;line-height:1.25;white-space:nowrap;text-overflow:ellipsis;overflow:hidden}
.calendar-appointment .appt-service{display:block;font-size:10px;color:#b6c2b7;white-space:nowrap;text-overflow:ellipsis;overflow:hidden;margin-top:2px}
.calendar-actions{display:flex;gap:4px;margin-top:4px}
.calendar-actions button{width:auto;min-height:17px;padding:1px 6px;border-radius:5px;font-size:9px;line-height:1.2}
.calendar-actions .calendar-cancel{background:#432525;color:#ffc0c0;border:1px solid #714141}
.hours-list{display:grid;gap:8px;margin:14px 0}
.hours-row{display:grid;grid-template-columns:120px minmax(0,1fr);gap:12px;align-items:start;padding:12px;border:1px solid var(--line);border-radius:11px;background:#0e130f}
.hours-row.is-closed .hours-config{opacity:.4}
.hours-day{display:grid;gap:8px}
.hours-day-name{font-size:13px;font-weight:750;color:#e5ece5;padding-top:2px}
.hours-check{display:flex;align-items:center;gap:7px;color:#aeb9af;font-size:11px}
.hours-check input{margin:0}
.hours-config{display:grid;gap:8px;min-width:0}
.hours-times,.hours-break-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.hours-field label{margin:0 0 5px;font-size:10px;color:#9eaaa0}
.hours-field input{padding:8px 9px;font-size:12px}
.hours-break{border-top:1px solid #263027;padding-top:7px}
.hours-break summary{font-size:11px;color:#a8f05a;cursor:pointer;user-select:none}
.hours-break-fields{margin-top:8px}
.hours-row.is-closed .hours-config input{cursor:not-allowed}
.empty{padding:22px;text-align:center;border:1px dashed #3a453c;border-radius:12px;color:#97a199;font-size:13px}.auth-wrap{min-height:100vh;display:grid;place-items:center;padding:22px;background:radial-gradient(ellipse at top,#182018 0,#080909 60%)}.auth-box{width:min(100%,920px)}.auth-head{text-align:center;margin-bottom:18px}.auth-head h1{font-size:26px;letter-spacing:.08em;margin:9px 0}.auth-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.brand-preview{width:76px;height:76px;object-fit:contain;border-radius:13px;background:#090b09;border:1px solid var(--line);padding:6px}.week-controls{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.week-controls input{max-width:170px}.calendar-notes{display:flex;gap:12px;flex-wrap:wrap;margin:10px 0 15px}.calendar-notes span{color:#9ea79f;font-size:11px}.toggle{display:flex;align-items:center;gap:9px;margin-top:12px;color:#c4cec5;font-size:13px}.goal-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.goal-card{padding:14px;background:#111712;border:1px solid #2c392d;border-radius:12px}.goal-card label{margin-top:0}.goal-card strong{font-size:14px}.goal-progress-track{height:13px;background:#252c26;border-radius:20px;overflow:hidden}.goal-progress-fill{height:100%;width:0;background:var(--accent);border-radius:20px;transition:width .25s ease}.public-link{color:var(--accent);overflow-wrap:anywhere}
@media(max-width:1100px){.metric-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.two-col{grid-template-columns:1fr}.layout{grid-template-columns:220px minmax(0,1fr)}.sidebar{padding:17px 10px}}
@media(max-width:900px){.hours-row{grid-template-columns:100px minmax(0,1fr)}.calendar-scroll{max-height:680px}}
@media(max-width:760px){.agenda-filters{width:100%}.agenda-filters select{flex:1;min-width:0;max-width:none}.hours-row{grid-template-columns:1fr}.hours-day{display:flex;align-items:center;justify-content:space-between}.calendar-head-row,.calendar-body-row{grid-template-columns:58px repeat(var(--lane-count),minmax(175px,1fr))}.calendar-lane{min-width:175px}.layout{display:block}.sidebar{position:relative;height:auto;padding:10px;border-right:0;border-bottom:1px solid var(--line);gap:9px}.logo-line{padding:4px 7px 10px}.nav{display:flex;overflow:auto;gap:5px}.nav button{width:auto;white-space:nowrap;padding:9px 11px}.nav .nav-icon{display:none}.sidebar-foot{display:none}.main{padding:18px 12px 40px}.topbar{margin-bottom:18px}.day-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.field-grid.three,.goal-grid{grid-template-columns:1fr 1fr}.schedule-row{grid-template-columns:80px 55px repeat(2,minmax(0,1fr))}.schedule-row .optional{display:none}}
@media(max-width:520px){.auth-grid,.field-grid,.field-grid.three,.field-grid.four,.goal-grid,.three-col{grid-template-columns:1fr}.metric-grid{grid-template-columns:1fr 1fr}.metric strong{font-size:20px}.panel{padding:14px}.section-head h1{font-size:23px}.day-grid{grid-template-columns:1fr}.list-row{align-items:flex-start;flex-direction:column}.weekday-row{grid-template-columns:82px repeat(2,minmax(0,1fr))}.week-controls input{max-width:100%}}
.appointment-modal-backdrop{position:fixed;inset:0;z-index:50;background:#000b;display:grid;place-items:center;padding:18px}.appointment-modal{width:min(100%,520px);max-height:90vh;overflow:auto;background:#111713;border:1px solid #354137;border-radius:18px;padding:21px;box-shadow:0 20px 80px #000a}.appointment-modal-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px}.appointment-modal-actions button{flex:1;min-width:130px}.calendar-appointment{cursor:pointer}.calendar-appointment:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
</style>
</head>
<body>
<section id="access-area" class="auth-wrap">
  <div class="auth-box">
    <header class="auth-head"><div class="eyebrow">BARBER-SYSTEM / ADMINISTRA\xC7\xC3O</div><h1>GEST\xC3O DA BARBEARIA</h1><p class="muted">Seu espa\xE7o de gest\xE3o, agenda e resultados.</p></header>
    <div class="auth-grid">
      <section id="register-card" class="panel">
        <div class="eyebrow">PRIMEIRO ACESSO</div><h2>Criar minha barbearia</h2>
        <p class="muted">Crie uma conta exclusiva para sua barbearia. Cada cadastro tem seu pr\xF3prio painel.</p>
        <form id="register-form">
          <label for="shop-name">Nome da barbearia</label><input id="shop-name" maxlength="120" required placeholder="Ex.: Barbearia do Jo\xE3o">
          <label for="owner-name">Seu nome</label><input id="owner-name" maxlength="120" required>
          <label for="register-email">E-mail</label><input id="register-email" type="email" required>
          <label for="register-password">Criar senha</label><input id="register-password" type="password" minlength="8" required>
          <label for="register-whatsapp">WhatsApp</label><input id="register-whatsapp" placeholder="DDD + n\xFAmero">
          <button type="submit">Criar conta</button><div id="register-message" class="message"></div>
        </form>
      </section>
      <section id="login-card" class="panel">
        <div class="eyebrow">J\xC1 POSSUI CADASTRO?</div><h2>Acesso do propriet\xE1rio</h2><p class="muted">Entre com seu e-mail e senha.</p>
        <form id="login-form">
          <label for="email">E-mail</label><input id="email" type="email" autocomplete="username" required>
          <label for="password">Senha</label><input id="password" type="password" autocomplete="current-password" required>
          <button type="submit">Entrar no painel</button><div id="login-message" class="message"></div>
        </form>
      </section>
    </div>
  </div>
</section>

<div id="app-shell" class="layout hidden">
  <aside class="sidebar">
    <div class="logo-line"><div class="mark">B</div><div><strong>BARBER-SYSTEM</strong><small>PAINEL DO PROPRIET\xC1RIO</small></div></div>
    <nav class="nav" id="main-nav">
      <button class="active" data-view="overview"><span class="nav-icon">\u2302</span>Vis\xE3o geral</button>
      <button data-view="agenda"><span class="nav-icon">\u25A6</span>Agenda</button>
      <button data-view="services"><span class="nav-icon">\u2702</span>Servi\xE7os</button>
      <button data-view="products"><span class="nav-icon">\u25A1</span>Produtos</button>
      <button data-view="team"><span class="nav-icon">\u2659</span>Profissionais</button>
      <button data-view="customers"><span class="nav-icon">\u2667</span>Clientes</button>
      <button data-view="finance"><span class="nav-icon">R$</span>Financeiro</button>
      <button data-view="settings"><span class="nav-icon">\u2699</span>Configura\xE7\xF5es</button>
    </nav>
    <div class="sidebar-foot"><div class="muted">Instala\xE7\xE3o individual</div><div class="tiny">Um painel, uma barbearia, seus dados.</div></div>
  </aside>

  <main class="main">
    <header class="topbar"><div><div class="eyebrow" id="view-eyebrow">RESUMO DO NEG\xD3CIO</div><div class="shop-name" id="top-shop-name">Sua barbearia</div></div><div class="actions"><a class="public-link" id="public-link" target="_blank" rel="noopener">P\xE1gina p\xFAblica \u2197</a><a class="public-link" id="collaborator-link" target="_blank" rel="noopener">\xC1rea do colaborador \u2197</a><button class="secondary" id="logout">Sair</button></div></header>

    <section class="view active" id="view-overview">
      <div class="section-head"><h1 id="welcome">Vis\xE3o geral</h1><p class="muted">Acompanhe a opera\xE7\xE3o e os resultados da sua barbearia.</p></div>
      <div class="metric-grid" id="overview-metrics"></div>
      <div class="two-col" style="margin-top:14px">
        <section class="panel"><div class="row"><div><h2>Movimento financeiro</h2><p class="muted">Entradas e sa\xEDdas no per\xEDodo selecionado.</p></div><select id="overview-period" style="width:auto"><option value="today">Hoje</option><option value="week">Esta semana</option><option value="month" selected>Este m\xEAs</option><option value="year">Este ano</option></select></div><div class="metric-grid" style="grid-template-columns:repeat(3,minmax(0,1fr));margin-top:12px" id="overview-finance"></div><div id="overview-chart" class="chart"></div><div class="tiny">Gr\xE1fico baseado nos lan\xE7amentos do caixa.</div></section>
        <section class="panel"><div class="row"><div><h2>Pr\xF3ximos atendimentos</h2><p class="muted">Agenda de hoje.</p></div><button class="ghost" data-jump="agenda">Abrir agenda</button></div><div id="upcoming-appointments" class="list"></div></section>
      </div>
      <section class="panel" style="margin-top:14px"><h2>Metas financeiras</h2><p class="muted">Progresso calculado sobre as entradas registradas no caixa.</p><div id="overview-goals" class="goal-grid"></div></section>
    </section>

    <section class="view" id="view-agenda">
      <div class="section-head"><h1>Agenda</h1><p class="muted">Acompanhe os atendimentos em uma grade di\xE1ria, organizada por profissional e hor\xE1rio.</p></div>
      <section class="panel">
        <div class="row agenda-toolbar">
          <div class="week-controls"><button class="ghost" id="agenda-prev" aria-label="Dia anterior">\u2039</button><input type="date" id="agenda-date"><button class="ghost" id="agenda-next" aria-label="Pr\xF3ximo dia">\u203A</button><button class="secondary" id="agenda-today">Hoje</button></div>
          <div class="agenda-filters">
            <select id="agenda-professional" aria-label="Selecionar agenda"><option value="">Todas as agendas</option></select>
            <select id="agenda-status" aria-label="Filtrar status"><option value="">Todos os status</option><option value="scheduled">Agendados</option><option value="completed">Conclu\xEDdos</option><option value="cancelled">Cancelados</option></select>
          </div>
        </div>
        <div class="calendar-notes"><span>Verde: agendado</span><span>Verde-claro: conclu\xEDdo</span><span>Vermelho: cancelado</span></div>
        <div id="day-calendar" class="calendar-scroll"></div><div id="agenda-message" class="message"></div>
      </section>
      <div class="two-col" style="margin-top:14px">
        <section class="panel"><h2>Funcionamento da barbearia</h2><p class="muted">Defina em quais dias abre e os hor\xE1rios de entrada e sa\xEDda. O intervalo \xE9 opcional e fica nas op\xE7\xF5es de cada dia.</p><div id="business-schedule" class="hours-list"></div><button id="save-business-schedule">Salvar funcionamento</button><div id="schedule-message" class="message"></div></section>
        <section class="panel"><h2>Folgas e bloqueios</h2><p class="muted">Bloqueie um hor\xE1rio para toda a barbearia ou para um profissional.</p>
          <label for="block-professional">Profissional</label><select id="block-professional"><option value="">Toda a barbearia</option></select>
          <div class="field-grid"><div><label for="block-start">In\xEDcio</label><input id="block-start" type="datetime-local"></div><div><label for="block-end">Fim</label><input id="block-end" type="datetime-local"></div></div>
          <label for="block-reason">Motivo</label><input id="block-reason" maxlength="250" placeholder="Ex.: Folga, almo\xE7o, compromisso">
          <button id="create-block">Adicionar bloqueio</button><div id="block-message" class="message"></div><div id="blocks-list" class="list" style="margin-top:12px"></div>
        </section>
      </div>
    </section>

    <section class="view" id="view-services">
      <div class="section-head"><h1>Servi\xE7os</h1><p class="muted">Organize os atendimentos oferecidos e o tempo reservado para cada um.</p></div>
      <section class="panel"><h2>Novo servi\xE7o</h2><div class="field-grid three"><div><label for="service-name">Nome</label><input id="service-name" placeholder="Corte"></div><div><label for="service-price">Pre\xE7o (R$)</label><input id="service-price" inputmode="decimal" placeholder="40,00"></div><div><label for="service-duration">Dura\xE7\xE3o (minutos)</label><input id="service-duration" type="number" min="1" max="1440" value="30"></div></div><label for="service-description">Descri\xE7\xE3o</label><textarea id="service-description" maxlength="500" placeholder="Descreva o servi\xE7o (opcional)"></textarea><button id="add-service">Cadastrar servi\xE7o</button><div id="service-message" class="message"></div></section>
      <section class="panel" style="margin-top:14px"><div class="row"><h2>Servi\xE7os cadastrados</h2><button class="ghost" id="refresh-services">Atualizar</button></div><div id="services-list" class="list"></div></section>
    </section>

    <section class="view" id="view-products">
      <div class="section-head"><h1>Produtos</h1><p class="muted">Cadastre produtos vendidos na barbearia e mantenha seus pre\xE7os organizados.</p></div>
      <section class="panel"><h2>Novo produto</h2><div class="field-grid"><div><label for="product-name">Nome</label><input id="product-name" placeholder="Pomada, shampoo..."></div><div><label for="product-price">Pre\xE7o (R$)</label><input id="product-price" inputmode="decimal" placeholder="35,00"></div></div><label for="product-description">Descri\xE7\xE3o</label><textarea id="product-description" maxlength="500"></textarea><button id="add-product">Cadastrar produto</button><div id="product-message" class="message"></div></section>
      <section class="panel" style="margin-top:14px"><div class="row"><h2>Produtos cadastrados</h2><button class="ghost" id="refresh-products">Atualizar</button></div><div id="products-list" class="list"></div></section>
    </section>

    <section class="view" id="view-team">
      <div class="section-head"><h1>Profissionais</h1><p class="muted">Cadastre os colaboradores. Eles entram pelo link \xFAnico usando o nome e o PIN que voc\xEA definir.</p></div>
      <div class="two-col">
        <section class="panel"><h2>Novo colaborador</h2><label for="barber-name">Nome do profissional</label><input id="barber-name" maxlength="120"><label for="barber-pin">PIN de acesso (4 n\xFAmeros)</label><input id="barber-pin" inputmode="numeric" maxlength="4" type="password"><label for="barber-commission">Comiss\xE3o do profissional (%)</label><input id="barber-commission" type="number" min="0" max="100" step="0.01" value="0"><button id="add-barber">Cadastrar profissional</button><div id="barber-message" class="message"></div></section>
        <section class="panel"><h2>O dono tamb\xE9m corta cabelo?</h2><p class="muted">Ative esta op\xE7\xE3o para criar uma agenda pr\xF3pria para o dono e permitir que clientes marquem com ele. Desativada, aparecem somente as agendas dos colaboradores.</p><label class="toggle"><input type="checkbox" id="owner-can-serve"> Sim, o dono atende clientes e ter\xE1 uma agenda pr\xF3pria</label><label for="owner-pin">PIN do propriet\xE1rio (4 n\xFAmeros)</label><input id="owner-pin" inputmode="numeric" maxlength="4" type="password"><label for="owner-commission">Sua comiss\xE3o (%)</label><input id="owner-commission" type="number" min="0" max="100" step="0.01" value="0"><button id="save-owner-provider">Salvar configura\xE7\xE3o do dono</button><div id="owner-provider-message" class="message"></div></section>
      </div>
      <section class="panel" style="margin-top:14px"><div class="row"><h2>Equipe cadastrada</h2><button class="ghost" id="refresh-team">Atualizar</button></div><div id="team-list" class="list"></div></section>
      <section class="panel hidden" id="staff-schedule-panel" style="margin-top:14px"><div class="row"><div><h2 id="staff-schedule-title">Expediente do profissional</h2><p class="muted">Defina os dias e os hor\xE1rios em que atende. Por padr\xE3o, o profissional acompanha o funcionamento da barbearia.</p></div><div class="actions"><button class="secondary hidden" id="reset-staff-schedule">Usar hor\xE1rio da barbearia</button><button class="ghost" id="close-staff-schedule">Fechar</button></div></div><div id="staff-schedule-form" class="hours-list"></div><button id="save-staff-schedule">Salvar expediente</button><div id="staff-schedule-message" class="message"></div></section>
    </section>

    <section class="view" id="view-customers">
      <div class="section-head"><h1>Clientes</h1><p class="muted">Os cadastros feitos na p\xE1gina p\xFAblica s\xE3o sincronizados com esta lista.</p></div>
      <section class="panel"><div class="row"><div><h2>Base de clientes</h2><p class="muted">Dados de contato acess\xEDveis somente ao propriet\xE1rio.</p></div><button class="ghost" id="refresh-customers">Atualizar lista</button></div><div id="customers-list" class="table-wrap" style="margin-top:12px"></div></section>
    </section>

    <section class="view" id="view-finance">
      <div class="section-head"><h1>Financeiro</h1><p class="muted">Acompanhe entradas, despesas e resultado. Faturamento n\xE3o \xE9 a mesma coisa que lucro.</p></div>
      <section class="panel"><div class="row"><div><h2>Resultado do per\xEDodo</h2><p class="muted" id="finance-period-label"></p></div><select id="finance-period" style="width:auto"><option value="today">Hoje</option><option value="week">Esta semana</option><option value="month" selected>Este m\xEAs</option><option value="year">Este ano</option></select></div><div class="metric-grid" id="finance-metrics" style="margin-top:12px"></div></section>
      <section class="panel" style="margin-top:14px">
        <div class="row"><div><h2>Meta de faturamento</h2><p class="muted">A meta \xE9 calculada automaticamente: despesas fixas mensais + lucro desejado.</p></div><select id="goal-period" style="width:auto"><option value="daily">Hoje</option><option value="weekly">Esta semana</option><option value="monthly" selected>Este m\xEAs</option></select></div>
        <div class="field-grid" style="margin-top:12px"><div><label for="desired-profit">Quanto o dono deseja lucrar no m\xEAs (R$)</label><input id="desired-profit" inputmode="decimal" placeholder="0,00"></div><div class="goal-card"><span class="muted">Despesas fixas mensais</span><strong id="fixed-costs-total">R$ 0,00</strong><span class="muted">Meta mensal total: <strong id="monthly-goal-total">R$ 0,00</strong></span></div></div>
        <div class="goal-card" style="margin-top:14px"><div class="goal-progress-track"><div id="goal-progress-bar" class="goal-progress-fill"></div></div><div class="row" style="margin-top:10px"><strong id="goal-progress-summary">Carregando meta...</strong><strong id="goal-progress-percent">0%</strong></div><p class="muted" id="goal-calculation" style="margin-bottom:0"></p></div>
        <div class="message" id="goals-message"></div>
      </section>
      <section class="panel" style="margin-top:14px">
        <h2>Despesas fixas mensais</h2><p class="muted">Cadastre aluguel, \xE1gua, luz, internet e outros custos recorrentes. Esses valores entram no c\xE1lculo da meta, mas n\xE3o s\xE3o lan\xE7ados automaticamente no hist\xF3rico do caixa.</p>
        <div class="field-grid" style="margin-top:10px"><div><label for="fixed-cost-name">Nome da despesa</label><input id="fixed-cost-name" maxlength="100" placeholder="Ex.: Aluguel"></div><div><label for="fixed-cost-amount">Valor mensal (R$)</label><input id="fixed-cost-amount" inputmode="decimal" placeholder="0,00"></div></div>
        <button id="add-fixed-cost" class="secondary" style="margin-top:10px">Adicionar despesa</button>
        <div id="fixed-costs-list" class="list" style="margin-top:12px"></div>
        <button id="save-financial-config" style="margin-top:12px">Salvar despesas e meta</button>
      </section>
      <div class="two-col" style="margin-top:14px">
        <section class="panel"><h2>Novo lan\xE7amento</h2><label for="entry-type">Tipo</label><select id="entry-type"><option value="income">Entrada</option><option value="expense">Sa\xEDda / despesa</option></select><label for="entry-description">Descri\xE7\xE3o</label><input id="entry-description" maxlength="160" placeholder="Ex.: Venda de produto, aluguel..."><div class="field-grid"><div><label for="entry-category">Categoria</label><input id="entry-category" maxlength="80" placeholder="Ex.: Produtos, aluguel"></div><div><label for="entry-amount">Valor (R$)</label><input id="entry-amount" inputmode="decimal" placeholder="0,00"></div></div><label for="entry-date">Data</label><input id="entry-date" type="date"><button id="add-entry">Salvar lan\xE7amento</button><div id="entry-message" class="message"></div></section>
        <section class="panel"><h2>Hist\xF3rico do caixa</h2><p class="muted">Atendimentos conclu\xEDdos entram automaticamente como receita. Lan\xE7amentos manuais podem ser removidos.</p><div id="finance-entries" class="list"></div></section>
      </div>
    </section>

    <section class="view" id="view-settings">
      <div class="section-head"><h1>Configura\xE7\xF5es</h1><p class="muted">Personalize a p\xE1gina p\xFAblica sem alterar a apar\xEAncia do painel administrativo.</p></div>
      <div class="two-col">
        <section class="panel"><h2>Identidade p\xFAblica</h2><div class="row"><div><p class="muted">A logo e a cor escolhida aparecem na p\xE1gina de agendamento.</p></div><img id="logo-preview" class="brand-preview hidden" alt="Pr\xE9via da logo"></div><label for="shop-logo">Logo da barbearia</label><input id="shop-logo" type="file" accept="image/png,image/jpeg,image/webp,image/gif"><button id="upload-logo">Salvar logo</button><div id="logo-message" class="message"></div><label for="settings-shop-name">Nome exibido</label><input id="settings-shop-name" maxlength="120"><label for="settings-whatsapp">WhatsApp</label><input id="settings-whatsapp" placeholder="DDD + n\xFAmero"><div class="field-grid"><div><label for="brand-color">Cor de destaque</label><input id="brand-color" type="color" value="#a8f05a"></div><div><label for="public-theme">Tema p\xFAblico</label><select id="public-theme"><option value="dark">Escuro</option><option value="light">Claro</option></select></div></div><button id="save-settings">Salvar identidade p\xFAblica</button><div id="settings-message" class="message"></div></section>
        <section class="panel"><h2>Links da instala\xE7\xE3o</h2><p class="muted">Compartilhe estes endere\xE7os com clientes e equipe.</p><div><div class="tiny">AGENDAMENTO P\xDABLICO</div><a id="settings-public-link" class="public-link" target="_blank" rel="noopener"></a></div><div style="margin-top:20px"><div class="tiny">\xC1REA DO COLABORADOR</div><a id="settings-collaborator-link" class="public-link" target="_blank" rel="noopener"></a></div><button class="secondary" id="copy-public-link">Copiar link p\xFAblico</button><button class="secondary" id="copy-collaborator-link">Copiar link do colaborador</button></section>
      </div>
      <section class="panel" style="margin-top:14px"><h2>Cuidados com dados</h2><p class="muted">Cada instala\xE7\xE3o usa seu pr\xF3prio banco de dados. Fa\xE7a backup regular do arquivo do banco antes de atualiza\xE7\xF5es importantes. O sistema est\xE1 em evolu\xE7\xE3o e ainda precisa de configura\xE7\xE3o de hospedagem, HTTPS, backups e revis\xE3o adicional antes de receber clientes reais.</p></section>
    </section>
  </main>
</div>

<div class="appointment-modal-backdrop hidden" id="appointment-modal"><section class="appointment-modal" role="dialog" aria-modal="true" aria-labelledby="appointment-modal-title"><div class="row"><div><div class="eyebrow">DETALHES DO AGENDAMENTO</div><h2 id="appointment-modal-title">Atendimento</h2></div><button class="ghost" id="close-appointment-modal">Fechar</button></div><p class="muted" id="appointment-modal-info"></p><div id="appointment-barber-editor"><label for="appointment-barber-select">Editar barbeiro</label><select id="appointment-barber-select"></select><button class="secondary" id="save-appointment-barber" style="margin-top:8px">Salvar barbeiro</button></div><div class="appointment-modal-actions" id="appointment-modal-actions"><button class="danger" id="appointment-cancel">Cancelar agendamento</button><button id="appointment-complete">Finalizar atendimento</button></div><div class="message" id="appointment-modal-message"></div></section></div>
<script>
(() => {
const $ = id => document.getElementById(id);
const weekdays = ['Segunda','Ter\xE7a','Quarta','Quinta','Sexta','S\xE1bado','Domingo'];
let currentShop = null;
let currentStaffId = null;
let currentStaffName = '';
let cachedStaff = [];
let currentFinance = null;
let selectedAppointment = null;
const messages = ['overview','agenda','services','products','team','customers','finance','settings'];

function showMessage(id, text, error=false){ const el=$(id); if(!el)return; el.textContent=text||''; el.classList.toggle('error',!!error); }
function money(cents){ return 'R$ '+(Number(cents||0)/100).toFixed(2).replace('.',','); }
function toLocalInputDate(date){ return new Date(date.getTime()-date.getTimezoneOffset()*60000).toISOString().slice(0,10); }
function parseMoney(value){ const raw=String(value||'').trim().replace(/R\\$|\\s/g,''); return raw.includes(',')?raw.replace(/\\./g,'').replace(',','.'):raw; }
async function api(path, options={}){
 const headers={...(options.headers||{})};
 if(options.body && !(options.body instanceof FormData)) headers['Content-Type']='application/json';
 const response=await fetch('/api'+path,{...options,headers,credentials:'same-origin'});
 let data={}; try{data=await response.json();}catch(_){}
 if(!response.ok) throw new Error(data.error||'N\xE3o foi poss\xEDvel concluir a opera\xE7\xE3o.');
 return data;
}
function showView(name){
 document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id==='view-'+name));
 document.querySelectorAll('#main-nav button').forEach(b=>b.classList.toggle('active',b.dataset.view===name));
 const labels={overview:'RESUMO DO NEG\xD3CIO',agenda:'AGENDA E FUNCIONAMENTO',services:'CAT\xC1LOGO DE SERVI\xC7OS',products:'CAT\xC1LOGO DE PRODUTOS',team:'EQUIPE E DISPONIBILIDADE',customers:'RELACIONAMENTO',finance:'ENTRADAS E SA\xCDDAS',settings:'IDENTIDADE DA BARBEARIA'};
 $('view-eyebrow').textContent=labels[name]||'BARBER-SYSTEM';
 const loaders={overview:loadOverview,agenda:loadAgenda,services:loadServices,products:loadProducts,team:loadTeam,customers:loadCustomers,finance:loadFinance,settings:loadSettings};
 loaders[name]?.().catch(e=>showMessage(name==='overview'?'agenda-message':name+'-message',e.message,true));
}
function metric(label,value){const el=document.createElement('div');el.className='metric';el.innerHTML='<span></span><strong></strong>';el.querySelector('span').textContent=label;el.querySelector('strong').textContent=value;return el;}
function empty(text){const el=document.createElement('div');el.className='empty';el.textContent=text;return el;}
function row(title,sub,actions=[]){const el=document.createElement('div');el.className='list-row';const copy=document.createElement('div');copy.className='main-copy';const strong=document.createElement('strong');strong.textContent=title;copy.append(strong);if(sub){const p=document.createElement('p');p.className='muted';p.textContent=sub;copy.append(p);}const right=document.createElement('div');right.className='actions';actions.forEach(a=>right.append(a));el.append(copy,right);return el;}
function action(label,cls,fn){const b=document.createElement('button');b.textContent=label;b.className=cls||'secondary';b.addEventListener('click',fn);return b;}
function navTo(name){showView(name);window.scrollTo({top:0,behavior:'smooth'});}
async function startApp(){
 const me=await api('/auth/me'); currentShop={...me};
 $('access-area').classList.add('hidden');$('app-shell').classList.remove('hidden');
 $('welcome').textContent='Ol\xE1, '+me.name;$('top-shop-name').textContent=me.barbershop_slug.replace(/-/g,' ');
 const publicUrl='/b/'+encodeURIComponent(me.barbershop_slug)+'/book';
 const staffUrl='/barber/'+encodeURIComponent(me.barbershop_slug);
 $('public-link').href=publicUrl;$('collaborator-link').href=staffUrl;
 $('settings-public-link').href=publicUrl;$('settings-public-link').textContent=location.origin+publicUrl;
 $('settings-collaborator-link').href=staffUrl;$('settings-collaborator-link').textContent=location.origin+staffUrl;
 $('agenda-date').value=toLocalInputDate(new Date());$('entry-date').value=toLocalInputDate(new Date());
 await loadOverview();
}
async function checkRegistration(){
 try{const status=await api('/auth/registration-status');$('register-card').classList.toggle('hidden',!status.available);}catch(e){showMessage('login-message',e.message,true);}
}
$('register-form').addEventListener('submit',async e=>{
 e.preventDefault();showMessage('register-message','Criando sua barbearia...');
 try{await api('/auth/register',{method:'POST',body:JSON.stringify({shop_name:$('shop-name').value,owner_name:$('owner-name').value,email:$('register-email').value,password:$('register-password').value,whatsapp:$('register-whatsapp').value})});showMessage('register-message','Cadastro conclu\xEDdo. Entre com seu e-mail e senha.');$('register-card').classList.add('hidden');}
 catch(err){showMessage('register-message',err.message,true);}
});
$('login-form').addEventListener('submit',async e=>{
 e.preventDefault();showMessage('login-message','Entrando...');
 try{await api('/auth/login',{method:'POST',body:JSON.stringify({email:$('email').value,password:$('password').value})});await startApp();}
 catch(err){showMessage('login-message',err.message,true);}
});
$('logout').addEventListener('click',async()=>{try{await api('/auth/logout',{method:'POST'});}finally{$('app-shell').classList.add('hidden');$('access-area').classList.remove('hidden');$('login-form').reset();await checkRegistration();}});
$('main-nav').addEventListener('click',e=>{const b=e.target.closest('button[data-view]');if(b)navTo(b.dataset.view);});
document.querySelectorAll('[data-jump]').forEach(b=>b.addEventListener('click',()=>navTo(b.dataset.jump)));
$('copy-public-link').addEventListener('click',()=>navigator.clipboard?.writeText(location.origin+$('settings-public-link').getAttribute('href')).then(()=>showMessage('settings-message','Link p\xFAblico copiado.')));
$('copy-collaborator-link').addEventListener('click',()=>navigator.clipboard?.writeText(location.origin+$('settings-collaborator-link').getAttribute('href')).then(()=>showMessage('settings-message','Link do colaborador copiado.')));

async function loadOverview(){
 const [dash,finance,entries,appointments]=await Promise.all([
  api('/admin/dashboard'),api('/admin/finance/summary?period='+$('overview-period').value),
  api('/admin/finance/entries'),api('/admin/appointments?date='+toLocalInputDate(new Date()))
 ]);
 $('overview-metrics').replaceChildren(
  metric('Agendamentos hoje',dash.today.appointments),metric('Pendentes',dash.today.scheduled),
  metric('Conclu\xEDdos',dash.today.completed),metric('Faturamento hoje',money(dash.today.revenue_cents)),
  metric('Faturamento no m\xEAs',money(dash.month.revenue_cents)),metric('Clientes',dash.base.customers),
  metric('Servi\xE7os ativos',dash.base.active_services),metric('Profissionais ativos',dash.base.active_barbers)
 );
 $('overview-finance').replaceChildren(metric('Entradas',money(finance.income_cents)),metric('Sa\xEDdas',money(finance.expense_cents)),metric('Resultado',money(finance.profit_cents)));
 renderChart($('overview-chart'),entries.entries);
 const upcoming=$('upcoming-appointments');upcoming.replaceChildren();
 const future=appointments.appointments.filter(a=>a.status==='scheduled').slice(0,5);
 if(!future.length)upcoming.append(empty('Nenhum atendimento agendado para hoje.'));
 future.forEach(a=>upcoming.append(row(a.starts_at.slice(11,16)+' \xB7 '+a.customer_name,a.service_name+' \xB7 '+(a.barber_name||'Sem profissional'),[])));
 const goalData=finance.goals;const achieved=finance.goal_achieved||{};const goalRoot=$('overview-goals');goalRoot.replaceChildren();
 [['daily','Di\xE1ria'],['weekly','Semanal'],['monthly','Mensal']].forEach(([k,label])=>{
  const card=document.createElement('div');card.className='goal-card';const target=goalData[k]||0;const current=achieved[k]||0;
  card.innerHTML='<div class="muted"></div><strong></strong><div class="progress"><span></span></div><div class="tiny"></div>';
  card.children[0].textContent='Meta '+label;card.children[1].textContent=money(target)+' \xB7 '+money(current);
  const pct=target>0?Math.min(100,current/target*100):0;card.querySelector('.progress span').style.width=pct+'%';
  card.querySelector('.tiny').textContent=target>0?Math.round(pct)+'% da meta no per\xEDodo selecionado':'Meta ainda n\xE3o definida';
  goalRoot.append(card);
 });
}
$('overview-period').addEventListener('change',()=>loadOverview().catch(e=>showMessage('agenda-message',e.message,true)));
function renderChart(root,entries){
 root.replaceChildren();
 const now=new Date();const days=[];
 for(let i=6;i>=0;i--){const d=new Date(now);d.setDate(d.getDate()-i);const key=toLocalInputDate(d);days.push({key,label:d.toLocaleDateString('pt-BR',{weekday:'short'}),income:0,expense:0});}
 entries.forEach(e=>{const d=days.find(x=>x.key===e.entry_date);if(d){if(e.entry_type==='income')d.income+=e.amount_cents;else d.expense+=e.amount_cents;}});
 const max=Math.max(1,...days.flatMap(d=>[d.income,d.expense]));
 days.forEach(d=>{
  const col=document.createElement('div');col.className='chart-col';
  const bars=document.createElement('div');bars.style.cssText='height:100%;display:flex;align-items:end;gap:3px';
  const a=document.createElement('div');a.className='chart-bar';a.style.height=Math.max(2,d.income/max*100)+'%';a.title='Entradas '+money(d.income);
  const b=document.createElement('div');b.className='chart-bar';b.style.background='#885b5b';b.style.height=Math.max(2,d.expense/max*100)+'%';b.title='Sa\xEDdas '+money(d.expense);
  bars.append(a,b);const label=document.createElement('small');label.textContent=d.label;col.append(bars,label);root.append(col);
 });
}

function mondayOf(value){const d=new Date(value+'T12:00:00');const offset=(d.getDay()+6)%7;d.setDate(d.getDate()-offset);return d;}
function shiftDate(value,days){const d=new Date(value+'T12:00:00');d.setDate(d.getDate()+days);return toLocalInputDate(d);}
let lastAgendaAppointments=[];
let lastBusinessDays=[];
function dateWeekday(value){return (new Date(value+'T12:00:00').getDay()+6)%7;}
function clockMinutes(value){if(!value)return null;const parts=value.split(':').map(Number);return parts[0]*60+parts[1];}
function populateAgendaStaff(staff){
 const select=$('agenda-professional');const old=select.value;
 select.replaceChildren(new Option('Todas as agendas',''));

 const owner=staff.find(x=>x.role==='owner');
 if(owner&&owner.is_active){
  const group=document.createElement('optgroup');group.label='Propriet\xE1rio';
  group.append(new Option(owner.name+' \xB7 Dono',String(owner.id)));
  select.append(group);
 }

 const team=staff.filter(x=>x.is_active&&x.role==='barber');
 if(team.length){
  const group=document.createElement('optgroup');group.label='Colaboradores';
  team.forEach(x=>group.append(new Option(x.name,String(x.id))));
  select.append(group);
 }

 if([...select.options].some(o=>o.value===old))select.value=old;
}
async function loadAgenda(){
 const selected=$('agenda-date').value||toLocalInputDate(new Date());$('agenda-date').value=selected;
 const q=new URLSearchParams({date:selected});if($('agenda-status').value)q.set('status',$('agenda-status').value);
 const [data,schedule,blocks,staff]=await Promise.all([
  api('/admin/appointments?'+q),api('/admin/schedule'),api('/admin/blocks'),api('/admin/barbers')
 ]);
 cachedStaff=staff.barbers;lastAgendaAppointments=data.appointments;lastBusinessDays=schedule.days;
 populateBlockStaff();populateAgendaStaff(cachedStaff);
 renderDailyCalendar(lastAgendaAppointments,selected,lastBusinessDays,cachedStaff);
 renderBusinessSchedule(schedule.days);
 renderBlocks(blocks.blocks);
}
function closeAppointmentModal(){ $('appointment-modal').classList.add('hidden'); selectedAppointment=null; }
function openAppointmentModal(appointment){
 selectedAppointment=appointment;$('appointment-modal-title').textContent=appointment.customer_name;
 $('appointment-modal-info').textContent=appointment.service_name+' \xB7 '+money(appointment.price_cents)+' \xB7 '+appointment.starts_at.replace('T',' ')+' \xB7 '+(appointment.barber_name||'Sem barbeiro')+' \xB7 '+({scheduled:'Agendado',completed:'Conclu\xEDdo',cancelled:'Cancelado'}[appointment.status]||appointment.status);
 const select=$('appointment-barber-select');select.replaceChildren(new Option('Sem profissional',''));
 cachedStaff.filter(x=>x.is_active&&(x.role==='barber'||(x.role==='owner'&&x.can_serve))).forEach(x=>select.add(new Option(x.name,x.id)));
 select.value=appointment.barber_id?String(appointment.barber_id):'';
 const active=appointment.status==='scheduled';$('appointment-barber-editor').classList.toggle('hidden',!active);$('appointment-modal-actions').classList.toggle('hidden',!active);$('appointment-modal-message').textContent='';$('appointment-modal').classList.remove('hidden');
}
$('close-appointment-modal').addEventListener('click',closeAppointmentModal);
$('appointment-modal').addEventListener('click',e=>{if(e.target===$('appointment-modal'))closeAppointmentModal();});
$('appointment-complete').addEventListener('click',async()=>{if(!selectedAppointment)return;try{await api('/admin/appointments/'+selectedAppointment.id+'/complete',{method:'POST'});closeAppointmentModal();await loadAgenda();await loadOverview();}catch(e){showMessage('appointment-modal-message',e.message,true);}});
$('appointment-cancel').addEventListener('click',async()=>{if(!selectedAppointment)return;const reason=prompt('Informe o motivo do cancelamento:');if(!reason)return;try{await api('/admin/appointments/'+selectedAppointment.id+'/cancel',{method:'POST',body:JSON.stringify({reason})});closeAppointmentModal();await loadAgenda();await loadOverview();}catch(e){showMessage('appointment-modal-message',e.message,true);}});
$('save-appointment-barber').addEventListener('click',async()=>{if(!selectedAppointment)return;try{await api('/admin/appointments/'+selectedAppointment.id+'/barber',{method:'PATCH',body:JSON.stringify({barber_id:$('appointment-barber-select').value?Number($('appointment-barber-select').value):null})});closeAppointmentModal();await loadAgenda();}catch(e){showMessage('appointment-modal-message',e.message,true);}});

function renderDailyCalendar(appointments,selectedDate,businessDays,staff){
 const root=$('day-calendar');root.replaceChildren();
 const selected= $('agenda-professional').value;
 const visibleAppointments=selected?appointments.filter(a=>String(a.barber_id||'')===selected):appointments;
 let lanes=staff.filter(x=>x.is_active&&(x.role==='owner'||x.role==='barber'));
 if(selected)lanes=lanes.filter(x=>String(x.id)===selected);
 const laneIds=new Set(lanes.map(x=>String(x.id)));
 visibleAppointments.forEach(a=>{
  if(a.barber_id&&!laneIds.has(String(a.barber_id))){
   lanes.push({id:a.barber_id,name:a.barber_name||'Profissional',role:'barber',is_active:false});
   laneIds.add(String(a.barber_id));
  }
 });
 const hasUnassigned=!selected&&visibleAppointments.some(a=>!a.barber_id);
 if(hasUnassigned)lanes.push({id:null,name:'Sem profissional',role:'unassigned'});
 if(!lanes.length)lanes=[{id:0,name:'Equipe',role:'empty'}];
 const dayData=businessDays.find(x=>x.weekday===dateWeekday(selectedDate));
 let start=dayData&&dayData.is_open&&dayData.open_time?clockMinutes(dayData.open_time):8*60;
 let end=dayData&&dayData.is_open&&dayData.close_time?clockMinutes(dayData.close_time):20*60;
 visibleAppointments.forEach(a=>{
  const aStart=clockMinutes(a.starts_at.slice(11,16));const aEnd=clockMinutes(a.ends_at.slice(11,16));
  if(aStart!==null)start=Math.min(start,aStart);
  if(aEnd!==null)end=Math.max(end,aEnd);
 });
 start=Math.max(0,Math.floor(start/60)*60);end=Math.min(24*60,Math.ceil(end/60)*60);
 if(end<=start)end=Math.min(24*60,start+60);
 const pxPerMinute=2;const hourHeight=60*pxPerMinute;const totalHeight=(end-start)*pxPerMinute;
 const grid=document.createElement('div');grid.className='calendar-grid';grid.style.setProperty('--lane-count',String(lanes.length));grid.style.setProperty('--hour-height',hourHeight+'px');
 const head=document.createElement('div');head.className='calendar-head-row';head.style.gridColumn='1 / -1';
 const emptyHead=document.createElement('div');emptyHead.className='calendar-head-cell';emptyHead.textContent='HOR\xC1RIO';head.append(emptyHead);
 lanes.forEach(lane=>{const cell=document.createElement('div');cell.className='calendar-head-cell';cell.textContent=lane.name+(lane.is_active===false?' \xB7 inativo':'');head.append(cell);});
 grid.append(head);
 const body=document.createElement('div');body.className='calendar-body-row';body.style.gridColumn='1 / -1';
 const axis=document.createElement('div');axis.className='calendar-time-axis';axis.style.height=totalHeight+'px';
 for(let minute=start;minute<=end;minute+=60){
  const label=document.createElement('div');label.className='calendar-time-label';label.style.top=((minute-start)*pxPerMinute)+'px';label.textContent=String(Math.floor(minute/60)).padStart(2,'0')+':00';axis.append(label);
 }
 body.append(axis);
 lanes.forEach(lane=>{
  const col=document.createElement('div');col.className='calendar-lane';col.style.height=totalHeight+'px';
  const laneAppointments=visibleAppointments.filter(a=>lane.id===null?!a.barber_id:String(a.barber_id)===String(lane.id));
  if(!laneAppointments.length){const note=document.createElement('div');note.className='calendar-lane-empty';note.textContent='Sem atendimentos';col.append(note);}
  laneAppointments.forEach(a=>{
   const startAt=clockMinutes(a.starts_at.slice(11,16));const endAt=clockMinutes(a.ends_at.slice(11,16));
   const duration=Math.max(5,endAt-startAt);const card=document.createElement('article');
   card.className='calendar-appointment '+(a.status==='completed'?'completed':a.status==='cancelled'?'cancelled':'');
   card.tabIndex=0;card.setAttribute('role','button');card.setAttribute('aria-label','Abrir agendamento de '+a.customer_name);
   card.addEventListener('click',()=>openAppointmentModal(a));
   card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openAppointmentModal(a);}});
   card.style.top=Math.max(0,(startAt-start)*pxPerMinute)+'px';card.style.height=Math.max(28,duration*pxPerMinute)+'px';
   card.title=a.customer_name+' \xB7 '+a.service_name+' \xB7 '+a.starts_at.slice(11,16)+'\u2013'+a.ends_at.slice(11,16);
   const time=document.createElement('span');time.className='appt-time';time.textContent=a.starts_at.slice(11,16)+' \u2013 '+a.ends_at.slice(11,16);
   const customer=document.createElement('strong');customer.textContent=a.customer_name;
   card.append(time,customer);
   const service=document.createElement('span');service.className='appt-service';service.textContent=a.service_name;card.append(service);
    col.append(card);
  });
  body.append(col);
 });
 grid.append(body);root.append(grid);
 const label=new Date(selectedDate+'T12:00:00').toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long',year:'numeric'});
 const hoursNote=dayData&&dayData.is_open?'Expediente da barbearia: '+dayData.open_time+'\u2013'+dayData.close_time: 'Barbearia marcada como fechada ou expediente ainda n\xE3o configurado neste dia.';
 showMessage('agenda-message',label+' \xB7 '+visibleAppointments.length+' atendimento(s). '+hoursNote);
}
$('agenda-date').addEventListener('change',()=>loadAgenda().catch(e=>showMessage('agenda-message',e.message,true)));
$('agenda-status').addEventListener('change',()=>loadAgenda().catch(e=>showMessage('agenda-message',e.message,true)));
$('agenda-professional').addEventListener('change',()=>renderDailyCalendar(lastAgendaAppointments,$('agenda-date').value,lastBusinessDays,cachedStaff));
$('agenda-prev').addEventListener('click',()=>{$('agenda-date').value=shiftDate($('agenda-date').value,-1);loadAgenda().catch(e=>showMessage('agenda-message',e.message,true));});
$('agenda-next').addEventListener('click',()=>{$('agenda-date').value=shiftDate($('agenda-date').value,1);loadAgenda().catch(e=>showMessage('agenda-message',e.message,true));});
$('agenda-today').addEventListener('click',()=>{$('agenda-date').value=toLocalInputDate(new Date());loadAgenda().catch(e=>showMessage('agenda-message',e.message,true));});
function renderHoursEditor(root,days,checkLabel){
 root.replaceChildren();
 days.forEach(day=>{
  const row=document.createElement('div');row.className='hours-row';row.dataset.day=day.weekday;
  const dayBox=document.createElement('div');dayBox.className='hours-day';
  const name=document.createElement('div');name.className='hours-day-name';name.textContent=weekdays[day.weekday];
  const check=document.createElement('label');check.className='hours-check';
  const cb=document.createElement('input');cb.type='checkbox';cb.className='day-open';cb.checked=!!day.is_open;
  check.append(cb,document.createTextNode(checkLabel));dayBox.append(name,check);
  const config=document.createElement('div');config.className='hours-config';
  const times=document.createElement('div');times.className='hours-times';
  [['open_time','Entrada'],['close_time','Sa\xEDda']].forEach(([field,label])=>{
   const wrapper=document.createElement('div');wrapper.className='hours-field';
   const caption=document.createElement('label');caption.textContent=label;
   const input=document.createElement('input');input.type='time';input.className=field;input.value=day[field]||'';caption.append(input);wrapper.append(caption);times.append(wrapper);
  });
  const details=document.createElement('details');details.className='hours-break';
  if(day.break_start||day.break_end)details.open=true;
  const summary=document.createElement('summary');summary.textContent='Adicionar intervalo (opcional)';
  const breakFields=document.createElement('div');breakFields.className='hours-break-fields';
  [['break_start','In\xEDcio do intervalo'],['break_end','Fim do intervalo']].forEach(([field,label])=>{
   const wrapper=document.createElement('div');wrapper.className='hours-field';
   const caption=document.createElement('label');caption.textContent=label;
   const input=document.createElement('input');input.type='time';input.className=field;input.value=day[field]||'';caption.append(input);wrapper.append(caption);breakFields.append(wrapper);
  });
  details.append(summary,breakFields);config.append(times,details);row.append(dayBox,config);
  const sync=()=>{row.classList.toggle('is-closed',!cb.checked);row.querySelectorAll('input[type="time"]').forEach(input=>input.disabled=!cb.checked);};
  cb.addEventListener('change',sync);sync();root.append(row);
 });
}
function readHoursEditor(root){
 return [...root.querySelectorAll('.hours-row')].map(row=>{
  const isOpen=row.querySelector('.day-open').checked;
  return {
   weekday:Number(row.dataset.day),is_open:isOpen,
   open_time:isOpen?(row.querySelector('.open_time').value||null):null,
   close_time:isOpen?(row.querySelector('.close_time').value||null):null,
   break_start:isOpen?(row.querySelector('.break_start').value||null):null,
   break_end:isOpen?(row.querySelector('.break_end').value||null):null
  };
 });
}
function renderBusinessSchedule(days){renderHoursEditor($('business-schedule'),days,'Aberto');}
$('save-business-schedule').addEventListener('click',async()=>{
 const days=readHoursEditor($('business-schedule'));
 try{await api('/admin/schedule',{method:'PUT',body:JSON.stringify({days})});showMessage('schedule-message','Funcionamento da barbearia salvo.');await loadAgenda();}
 catch(e){showMessage('schedule-message',e.message,true);}
});
function populateBlockStaff(){
 const select=$('block-professional');const old=select.value;select.replaceChildren(new Option('Toda a barbearia',''));
 cachedStaff.filter(x=>x.is_active).forEach(x=>select.add(new Option(x.name+(x.role==='owner'?' (propriet\xE1rio)':''),x.id)));
 if([...select.options].some(o=>o.value===old))select.value=old;
}
function renderBlocks(blocks){
 const root=$('blocks-list');root.replaceChildren();
 if(!blocks.length){root.append(empty('Nenhum bloqueio cadastrado.'));return;}
 blocks.forEach(b=>{
  const r=row(b.reason||'Bloqueio',b.starts_at.replace('T',' ')+' at\xE9 '+b.ends_at.replace('T',' ')+' \xB7 '+(b.barber_name||'Toda a barbearia'),[
   action('Remover','danger',async()=>{try{await api('/admin/blocks/'+b.id,{method:'DELETE'});await loadAgenda();}catch(e){showMessage('block-message',e.message,true);}})
  ]);root.append(r);
 });
}
$('create-block').addEventListener('click',async()=>{
 const start=$('block-start').value,end=$('block-end').value;
 if(!start||!end){showMessage('block-message','Informe in\xEDcio e fim.',true);return;}
 try{await api('/admin/blocks',{method:'POST',body:JSON.stringify({barber_id:$('block-professional').value?Number($('block-professional').value):null,starts_at:start,ends_at:end,reason:$('block-reason').value})});$('block-reason').value='';showMessage('block-message','Bloqueio criado.');await loadAgenda();}
 catch(e){showMessage('block-message',e.message,true);}
});

async function loadServices(){
 const data=await api('/admin/services');const root=$('services-list');root.replaceChildren();
 if(!data.services.length){root.append(empty('Nenhum servi\xE7o cadastrado.'));return;}
 data.services.forEach(s=>{
  const buttons=[
   action('Editar','secondary',async()=>{const name=prompt('Nome do servi\xE7o:',s.name);if(name===null)return;const price=prompt('Pre\xE7o em reais:',s.price);if(price===null)return;const duration=prompt('Dura\xE7\xE3o em minutos:',s.duration_minutes);if(duration===null)return;try{await api('/admin/services/'+s.id,{method:'PATCH',body:JSON.stringify({name,price,duration_minutes:Number(duration)})});await loadServices();}catch(e){showMessage('service-message',e.message,true);}}),
   action(s.is_active?'Desativar':'Ativar',s.is_active?'danger':'secondary',async()=>{try{await api('/admin/services/'+s.id,{method:'PATCH',body:JSON.stringify({is_active:!s.is_active})});await loadServices();}catch(e){showMessage('service-message',e.message,true);}})
  ];
  root.append(row(s.name,money(s.price_cents)+' \xB7 '+s.duration_minutes+' min \xB7 '+(s.description||'Sem descri\xE7\xE3o')+' \xB7 '+(s.is_active?'Ativo':'Inativo'),buttons));
 });
}
$('add-service').addEventListener('click',async()=>{
 try{await api('/admin/services',{method:'POST',body:JSON.stringify({name:$('service-name').value,price:parseMoney($('service-price').value),duration_minutes:Number($('service-duration').value),description:$('service-description').value})});$('service-name').value='';$('service-price').value='';$('service-description').value='';showMessage('service-message','Servi\xE7o cadastrado.');await loadServices();}
 catch(e){showMessage('service-message',e.message,true);}
});
$('refresh-services').addEventListener('click',()=>loadServices().catch(e=>showMessage('service-message',e.message,true)));

async function loadProducts(){
 const data=await api('/admin/products');const root=$('products-list');root.replaceChildren();
 if(!data.products.length){root.append(empty('Nenhum produto cadastrado.'));return;}
 data.products.forEach(p=>root.append(row(p.name,money(p.price_cents)+' \xB7 '+(p.description||'Sem descri\xE7\xE3o')+' \xB7 '+(p.is_active?'Ativo':'Inativo'),[
  action('Editar','secondary',async()=>{const name=prompt('Nome:',p.name);if(name===null)return;const price=prompt('Pre\xE7o em reais:',(p.price_cents/100).toFixed(2));if(price===null)return;const desc=prompt('Descri\xE7\xE3o:',p.description||'');if(desc===null)return;try{await api('/admin/products/'+p.id,{method:'PATCH',body:JSON.stringify({name,price:parseMoney(price),description:desc})});await loadProducts();}catch(e){showMessage('product-message',e.message,true);}}),
  action(p.is_active?'Desativar':'Ativar',p.is_active?'danger':'secondary',async()=>{try{await api('/admin/products/'+p.id,{method:'PATCH',body:JSON.stringify({is_active:!p.is_active})});await loadProducts();}catch(e){showMessage('product-message',e.message,true);}})
 ])));
}
$('add-product').addEventListener('click',async()=>{
 try{await api('/admin/products',{method:'POST',body:JSON.stringify({name:$('product-name').value,price:parseMoney($('product-price').value),description:$('product-description').value})});$('product-name').value='';$('product-price').value='';$('product-description').value='';showMessage('product-message','Produto cadastrado.');await loadProducts();}
 catch(e){showMessage('product-message',e.message,true);}
});
$('refresh-products').addEventListener('click',()=>loadProducts().catch(e=>showMessage('product-message',e.message,true)));

async function loadTeam(){
 const data=await api('/admin/barbers');cachedStaff=data.barbers;populateBlockStaff();
 const root=$('team-list');root.replaceChildren();
 const owner=data.barbers.find(x=>x.role==='owner');
 $('owner-can-serve').checked=!!owner?.can_serve;
 $('owner-commission').value=Number(owner?.commission_percent||0).toFixed(2).replace(/\\.00$/,'');
 if(!data.barbers.length){root.append(empty('Nenhum profissional cadastrado.'));return;}
 data.barbers.forEach(s=>{
  const label=s.role==='owner'?'Propriet\xE1rio':'Colaborador';
  const buttons=[
   action('Expediente','secondary',()=>openStaffSchedule(s)),
  ];
  if(s.role==='barber'){
   buttons.push(action('Editar','secondary',async()=>{const name=prompt('Nome do profissional:',s.name);if(name===null)return;const pin=prompt('Novo PIN de 4 n\xFAmeros (deixe vazio para manter):','');if(pin===null)return;const commission=prompt('Comiss\xE3o do profissional em porcentagem:',String(s.commission_percent||0));if(commission===null)return;try{await api('/admin/barbers/'+s.id,{method:'PATCH',body:JSON.stringify({name,pin,commission_percent:commission})});await loadTeam();}catch(e){showMessage('barber-message',e.message,true);}}));
   buttons.push(action(s.is_active?'Desativar':'Ativar',s.is_active?'danger':'secondary',async()=>{try{if(s.is_active)await api('/admin/barbers/'+s.id,{method:'DELETE'});else await api('/admin/barbers/'+s.id,{method:'PATCH',body:JSON.stringify({is_active:true})});await loadTeam();}catch(e){showMessage('barber-message',e.message,true);}}));
  }
  root.append(row(s.name,label+' \xB7 Comiss\xE3o '+Number(s.commission_percent||0).toLocaleString('pt-BR')+'% \xB7 '+(s.can_serve?'Recebe agendamentos':'N\xE3o recebe agendamentos')+' \xB7 '+(s.is_active?'Ativo':'Inativo'),buttons));
 });
}
$('add-barber').addEventListener('click',async()=>{
 try{await api('/admin/barbers',{method:'POST',body:JSON.stringify({name:$('barber-name').value,pin:$('barber-pin').value,commission_percent:$('barber-commission').value||0})});$('barber-name').value='';$('barber-pin').value='';$('barber-commission').value='0';showMessage('barber-message','Profissional cadastrado. Compartilhe o link da \xE1rea do colaborador.');await loadTeam();}
 catch(e){showMessage('barber-message',e.message,true);}
});
$('refresh-team').addEventListener('click',()=>loadTeam().catch(e=>showMessage('barber-message',e.message,true)));
$('save-owner-provider').addEventListener('click',async()=>{
 try{await api('/admin/staff/owner',{method:'PATCH',body:JSON.stringify({can_serve:$('owner-can-serve').checked,pin:$('owner-pin').value,commission_percent:$('owner-commission').value||0})});$('owner-pin').value='';showMessage('owner-provider-message',$('owner-can-serve').checked?'Agenda pr\xF3pria do dono ativada.':'Agenda do dono desativada; a equipe continua aparecendo.');await loadTeam();}
 catch(e){showMessage('owner-provider-message',e.message,true);}
});
async function openStaffSchedule(staff){
 currentStaffId=staff.id;currentStaffName=staff.name;
 $('staff-schedule-title').textContent='Expediente de '+staff.name;
 $('staff-schedule-panel').classList.remove('hidden');
 try{
  const [data,business]=await Promise.all([
   api('/admin/staff/'+staff.id+'/schedule'),api('/admin/schedule')
  ]);
  const inherited=data.uses_business_hours_when_unset;
  renderStaffSchedule(inherited?business.days:data.days);
  $('reset-staff-schedule').classList.toggle('hidden',inherited);
  showMessage('staff-schedule-message',inherited?'Este profissional acompanha automaticamente o funcionamento da barbearia.':'Expediente individual configurado para este profissional.');
 }catch(e){showMessage('staff-schedule-message',e.message,true);}
 $('staff-schedule-panel').scrollIntoView({behavior:'smooth'});
}
function renderStaffSchedule(days){renderHoursEditor($('staff-schedule-form'),days,'Atende');}
$('save-staff-schedule').addEventListener('click',async()=>{
 if(!currentStaffId)return;
 const days=readHoursEditor($('staff-schedule-form'));
 try{
  await api('/admin/staff/'+currentStaffId+'/schedule',{method:'PUT',body:JSON.stringify({days})});
  $('reset-staff-schedule').classList.remove('hidden');
  showMessage('staff-schedule-message','Expediente de '+currentStaffName+' atualizado.');
 }catch(e){showMessage('staff-schedule-message',e.message,true);}
});
$('reset-staff-schedule').addEventListener('click',async()=>{
 if(!currentStaffId)return;
 try{
  await api('/admin/staff/'+currentStaffId+'/schedule',{method:'DELETE'});
  $('reset-staff-schedule').classList.add('hidden');
  await openStaffSchedule({id:currentStaffId,name:currentStaffName});
 }catch(e){showMessage('staff-schedule-message',e.message,true);}
});
$('close-staff-schedule').addEventListener('click',()=>$('staff-schedule-panel').classList.add('hidden'));

async function loadCustomers(){
 const data=await api('/admin/customers');const root=$('customers-list');root.replaceChildren();
 if(!data.customers.length){root.append(empty('Ainda n\xE3o h\xE1 clientes cadastrados.'));return;}
 const table=document.createElement('table');table.innerHTML='<thead><tr><th>Cliente</th><th>Telefone</th><th>Cadastro</th></tr></thead><tbody></tbody>';const body=table.querySelector('tbody');
 data.customers.forEach(c=>{const tr=document.createElement('tr');[c.name,c.phone,new Date(c.created_at.replace(' ','T')+'Z').toLocaleDateString('pt-BR')].forEach(v=>{const td=document.createElement('td');td.textContent=v;tr.append(td);});body.append(tr);});root.append(table);
}
$('refresh-customers').addEventListener('click',()=>loadCustomers().catch(e=>showMessage('customers-message',e.message,true)));

async function loadFinance(){
 const period=$('finance-period').value;
 const [data,config]=await Promise.all([
  api('/admin/finance/summary?period='+period),
  api('/admin/finance/config')
 ]);
 currentFinance=data;currentFinancialConfig=config;
 $('finance-period-label').textContent='De '+new Date(data.start+'T12:00:00').toLocaleDateString('pt-BR')+' at\xE9 '+new Date(data.end+'T12:00:00').toLocaleDateString('pt-BR');
 $('finance-metrics').replaceChildren(metric('Faturamento / entradas',money(data.income_cents)),metric('Despesas / sa\xEDdas',money(data.expense_cents)),metric('Lucro / resultado',money(data.profit_cents)),metric('Lan\xE7amentos',data.entry_count));
 $('desired-profit').value=(config.desired_profit_cents/100).toFixed(2).replace('.',',');
 renderFixedCosts(config.fixed_costs||[]);
 renderGoalProgress();
 const entries=await api('/admin/finance/entries?from='+data.start+'&to='+data.end);renderFinanceEntries(entries.entries);
}
let currentFinancialConfig={fixed_costs:[],desired_profit_cents:0};
function renderFixedCosts(costs){
 const root=$('fixed-costs-list');root.replaceChildren();
 if(!costs.length){root.append(empty('Nenhuma despesa fixa cadastrada.'));}
 else costs.forEach((cost,index)=>{
  root.append(row(cost.name,money(cost.amount_cents)+' por m\xEAs',[
   action('Remover','danger',()=>{currentFinancialConfig.fixed_costs.splice(index,1);renderFixedCosts(currentFinancialConfig.fixed_costs);renderGoalProgress();})
  ]));
 });
 const total=(costs||[]).reduce((sum,cost)=>sum+Number(cost.amount_cents||0),0);
 $('fixed-costs-total').textContent=money(total);
 $('monthly-goal-total').textContent=money(total+Number(currentFinancialConfig.desired_profit_cents||0));
}
function renderGoalProgress(){
 if(!currentFinance||!currentFinancialConfig)return;
 const period=$('goal-period').value;
 const names={daily:'Meta de hoje',weekly:'Meta da semana',monthly:'Meta do m\xEAs'};
 const goal=Number(currentFinance.goals?.[period]||0);
 const achieved=Number(currentFinance.goal_achieved?.[period]||0);
 const percent=goal?Math.min(100,achieved/goal*100):0;
 $('goal-progress-bar').style.width=percent+'%';
 $('goal-progress-summary').textContent=goal?money(achieved)+' de '+money(goal):'Cadastre despesas e defina seu lucro desejado.';
 $('goal-progress-percent').textContent=Math.round(percent)+'%';
 $('goal-calculation').textContent=names[period]+' \xB7 A meta mensal considera '+money(currentFinance.fixed_costs_total_cents||0)+' em despesas fixas e '+money(currentFinance.desired_profit_cents||0)+' de lucro desejado. O progresso soma somente atendimentos conclu\xEDdos.';
 const total=(currentFinancialConfig.fixed_costs||[]).reduce((sum,cost)=>sum+Number(cost.amount_cents||0),0);
 $('fixed-costs-total').textContent=money(total);
 $('monthly-goal-total').textContent=money(total+Number(currentFinancialConfig.desired_profit_cents||0));
}
function renderFinanceEntries(entries){
 const root=$('finance-entries');root.replaceChildren();
 if(!entries.length){root.append(empty('Nenhum lan\xE7amento neste per\xEDodo.'));return;}
 entries.forEach(e=>{const type=e.entry_type==='income'?'Entrada':'Sa\xEDda';const amount=(e.entry_type==='income'?'+ ':'\u2212 ')+money(e.amount_cents);const buttons=[];if(!e.appointment_id)buttons.push(action('Remover','danger',async()=>{if(!confirm('Remover este lan\xE7amento?'))return;try{await api('/admin/finance/entries/'+e.id,{method:'DELETE'});await loadFinance();}catch(err){showMessage('entry-message',err.message,true);}}));root.append(row(type+' \xB7 '+e.description, e.entry_date+' \xB7 '+(e.category||'Sem categoria')+' \xB7 '+amount,buttons));});
}
function renderFinanceEntries(entries){
 const root=$('finance-entries');root.replaceChildren();
 if(!entries.length){root.append(empty('Nenhum lan\xE7amento neste per\xEDodo.'));return;}
 entries.forEach(e=>{const type=e.entry_type==='income'?'Entrada':'Sa\xEDda';const amount=(e.entry_type==='income'?'+ ':'\u2212 ')+money(e.amount_cents);const buttons=[];if(!e.appointment_id)buttons.push(action('Remover','danger',async()=>{if(!confirm('Remover este lan\xE7amento?'))return;try{await api('/admin/finance/entries/'+e.id,{method:'DELETE'});await loadFinance();}catch(err){showMessage('entry-message',err.message,true);}}));root.append(row(type+' \xB7 '+e.description, e.entry_date+' \xB7 '+(e.category||'Sem categoria')+' \xB7 '+amount,buttons));});
}
$('finance-period').addEventListener('change',()=>loadFinance().catch(e=>showMessage('entry-message',e.message,true)));
$('goal-period').addEventListener('change',renderGoalProgress);
$('desired-profit').addEventListener('input',()=>{
 currentFinancialConfig.desired_profit_cents=Math.max(0,Math.round(Number(parseMoney($('desired-profit').value)||0)*100));
 renderGoalProgress();
});
$('add-fixed-cost').addEventListener('click',()=>{
 const name=$('fixed-cost-name').value.trim();
 const amount=Math.round(Number(parseMoney($('fixed-cost-amount').value)||0)*100);
 if(!name||name.length>100||!Number.isFinite(amount)||amount<=0){showMessage('goals-message','Informe o nome e um valor mensal maior que zero.',true);return;}
 currentFinancialConfig.fixed_costs.push({name,amount_cents:amount});
 $('fixed-cost-name').value='';$('fixed-cost-amount').value='';
 renderFixedCosts(currentFinancialConfig.fixed_costs);renderGoalProgress();
 showMessage('goals-message','Despesa adicionada. Salve para confirmar.');
});
$('save-financial-config').addEventListener('click',async()=>{
 try{
  await api('/admin/finance/config',{method:'PUT',body:JSON.stringify({
   desired_profit:parseMoney($('desired-profit').value)||0,
   fixed_costs:currentFinancialConfig.fixed_costs.map(cost=>({name:cost.name,amount:(Number(cost.amount_cents)/100).toFixed(2)}))
  })});
  showMessage('goals-message','Despesas fixas e lucro desejado salvos.');await loadFinance();
 }catch(e){showMessage('goals-message',e.message,true);}
});
$('add-entry').addEventListener('click',async()=>{
 try{await api('/admin/finance/entries',{method:'POST',body:JSON.stringify({entry_type:$('entry-type').value,description:$('entry-description').value,category:$('entry-category').value,amount:parseMoney($('entry-amount').value),entry_date:$('entry-date').value})});$('entry-description').value='';$('entry-category').value='';$('entry-amount').value='';showMessage('entry-message','Lan\xE7amento salvo.');await loadFinance();}
 catch(e){showMessage('entry-message',e.message,true);}
});

async function loadSettings(){
 const data=await api('/admin/barbershop');$('settings-shop-name').value=data.name;$('settings-whatsapp').value=data.whatsapp||'';$('brand-color').value=data.brand_color||'#a8f05a';$('public-theme').value=data.theme||'dark';
 if(data.logo_data){$('logo-preview').src=data.logo_data;$('logo-preview').classList.remove('hidden');}else{$('logo-preview').classList.add('hidden');}
}
$('upload-logo').addEventListener('click',async()=>{
 const file=$('shop-logo').files[0];if(!file){showMessage('logo-message','Escolha uma imagem primeiro.',true);return;}
 const form=new FormData();form.append('logo',file);
 try{await api('/admin/barbershop/logo',{method:'POST',body:form});showMessage('logo-message','Logo atualizada.');await loadSettings();}
 catch(e){showMessage('logo-message',e.message,true);}
});
$('save-settings').addEventListener('click',async()=>{
 try{await api('/admin/barbershop/settings',{method:'POST',body:JSON.stringify({name:$('settings-shop-name').value,whatsapp:$('settings-whatsapp').value,brand_color:$('brand-color').value,theme:$('public-theme').value})});showMessage('settings-message','Identidade p\xFAblica salva.');$('top-shop-name').textContent=$('settings-shop-name').value;}
 catch(e){showMessage('settings-message',e.message,true);}
});

async function boot(){
 await checkRegistration();
 try{await startApp();}catch(_){$('app-shell').classList.add('hidden');$('access-area').classList.remove('hidden');}
}
boot();
})();
<\/script>
</body>
</html>
`,Ve=`<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#090909">
<title>\xC1rea do profissional | \xC1rea do profissional</title>
<style>
:root{color-scheme:dark;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#080909;color:#f2f5f2;--accent:#a8f05a;--panel:#121613;--panel2:#0e130f;--line:#2b332c;--muted:#9ca69d;--red:#ff9b9b}
*{box-sizing:border-box}
body{margin:0;background:radial-gradient(ellipse at top,#111911 0,#080909 48%);min-height:100vh}
button,input,select{font:inherit}
button{border:1px solid transparent;border-radius:10px;padding:11px 14px;background:var(--accent);color:#10140d;font-weight:800;cursor:pointer}
button:disabled{opacity:.55;cursor:not-allowed}
button.secondary{background:#252d27;color:#edf1ed;border-color:#414b42}
button.ghost{background:transparent;color:#dce5dc;border-color:#3c473e}
button.danger{background:#392323;color:#ffb6b6;border-color:#664242}
input,select{width:100%;padding:11px 12px;border-radius:10px;border:1px solid #3b453d;background:#0a0e0b;color:#fff;min-width:0}
label{display:block;color:#b7c0b8;font-size:12px;font-weight:700;margin:12px 0 6px}
.hidden{display:none!important}
main{max-width:1260px;margin:auto;padding:25px 20px 70px}
.login-wrap{min-height:calc(100vh - 95px);display:grid;place-items:center}
.login-card{width:min(100%,480px);background:var(--panel);border:1px solid var(--line);border-radius:20px;padding:25px;box-shadow:0 18px 60px #0008}
.brand{font-size:10px;letter-spacing:.19em;color:var(--accent);font-weight:900}
h1{font-size:clamp(25px,4vw,34px);margin:9px 0 5px}
h2{font-size:19px;margin:0 0 7px}
h3{font-size:14px;margin:0}
p{color:var(--muted);line-height:1.5;margin:6px 0}
.muted{font-size:13px;color:var(--muted);line-height:1.5}
.message{font-size:13px;color:var(--accent);min-height:20px;margin-top:9px;white-space:pre-wrap}
.error{color:var(--red)}
.app-header{display:flex;align-items:center;justify-content:space-between;gap:15px;margin-bottom:22px}
.shop-title{font-size:12px;color:var(--muted);margin-top:4px}
.header-right{display:flex;align-items:center;gap:12px}
.menu-button{width:46px;height:44px;display:grid;place-content:center;gap:5px;background:#151b16;border:1px solid #354036;border-radius:12px}
.menu-button span{display:block;width:19px;height:2px;background:#e8eee8;border-radius:5px}
.welcome-row{display:flex;align-items:end;justify-content:space-between;gap:15px;flex-wrap:wrap;margin:14px 0 18px}
.welcome-row h1{font-size:26px}
.primary-action{width:auto;min-width:170px}
.stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:11px;margin:16px 0}
.stat{background:linear-gradient(145deg,#151c16,#101411);border:1px solid #2c382e;border-radius:14px;padding:14px}
.stat span{display:block;color:var(--muted);font-size:11px}
.stat strong{display:block;font-size:22px;margin-top:5px;font-variant-numeric:tabular-nums}
.card{background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:18px;margin-top:14px}
.toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
.date-tools{display:flex;align-items:center;gap:7px}
.date-tools button{width:39px;height:39px;padding:0;font-size:19px}
.date-tools button.today{width:auto;font-size:12px;padding:0 12px}
.date-tools input{width:155px}
.filters{display:flex;align-items:center;gap:8px}
.filters select{width:auto;min-width:155px}
.legend{display:flex;gap:12px;flex-wrap:wrap;margin:12px 0;color:#8f9b91;font-size:11px}
.legend span:before{content:"";display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--accent);margin-right:6px}
.legend .done:before{background:#a7c7a7}
.legend .cancelled:before{background:#b66c6c}
.calendar-scroll{overflow:auto;border:1px solid var(--line);border-radius:13px;background:#0b100c;max-height:760px}
.timeline{display:grid;grid-template-columns:66px minmax(270px,1fr);min-width:340px}
.time-axis{position:relative;background:#101611;border-right:1px solid #2a342c}
.time-label{position:absolute;right:9px;transform:translateY(-7px);font-size:10px;color:#89958b;font-variant-numeric:tabular-nums}
.time-lane{position:relative;background:repeating-linear-gradient(to bottom,transparent 0,transparent calc(var(--hour-height) - 1px),#29332b calc(var(--hour-height) - 1px),#29332b var(--hour-height))}
.break-block{position:absolute;left:6px;right:6px;z-index:1;border:1px dashed #8e794d;background:#40351d99;color:#f1d79d;border-radius:8px;padding:6px 8px;font-size:11px;overflow:hidden}
.calendar-item{position:absolute;left:6px;right:6px;z-index:2;padding:7px 9px;border-radius:9px;border-left:3px solid var(--accent);background:#1a2a1a;color:#f0f8ed;overflow:hidden;box-shadow:0 3px 10px #0006;min-height:32px}
.calendar-item.completed{border-left-color:#a7c7a7;background:#202b22}
.calendar-item.cancelled{border-left-color:#b66c6c;background:#2a1b1b;color:#f2dddd}
.item-time{display:block;font-size:10px;color:#bed0b9;font-variant-numeric:tabular-nums;margin-bottom:3px}
.calendar-item strong{display:block;font-size:12px;white-space:nowrap;text-overflow:ellipsis;overflow:hidden}
.item-service{display:block;font-size:10px;color:#b6c2b7;margin-top:3px;white-space:nowrap;text-overflow:ellipsis;overflow:hidden}
.item-actions{display:flex;gap:6px;margin-top:5px}
.item-actions button{width:auto;padding:3px 8px;font-size:10px;border-radius:6px}
.item-actions select{width:auto;min-width:112px;max-width:145px;padding:4px 6px;font-size:10px;border-radius:6px}
.item-actions .cancel{background:#432525;color:#ffc0c0;border:1px solid #714141}
.empty-agenda{padding:22px;text-align:center;color:#8b978d;font-size:13px}
.drawer-backdrop{position:fixed;inset:0;background:#0009;z-index:20;opacity:0;pointer-events:none;transition:opacity .2s}
.drawer{position:fixed;right:0;top:0;bottom:0;width:min(88vw,340px);background:#101511;border-left:1px solid #344035;z-index:21;padding:23px;transform:translateX(102%);transition:transform .22s ease;box-shadow:-20px 0 60px #0007}
body.drawer-open .drawer{transform:translateX(0)}
body.drawer-open .drawer-backdrop{opacity:1;pointer-events:auto}
.drawer-head{display:flex;align-items:center;justify-content:space-between;padding-bottom:18px;border-bottom:1px solid var(--line)}
.drawer-head button{width:35px;height:35px;padding:0;background:transparent;color:#ddd;border:1px solid var(--line)}
.drawer-nav{display:grid;gap:8px;margin-top:20px}
.drawer-nav button{text-align:left;background:#171e18;color:#e4ebe4;border:1px solid #303b31;padding:14px}
.drawer-nav button span{display:block;color:#8f9b91;font-size:11px;font-weight:500;margin-top:3px}
.drawer-foot{position:absolute;bottom:22px;left:23px;right:23px;color:#788479;font-size:11px}
.panel-header{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:14px}
.panel-header button{width:auto}
.commission-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
.commission-card{background:#0d130e;border:1px solid #2b382c;border-radius:13px;padding:13px}
.commission-card span{display:block;color:#9ca89e;font-size:11px}
.commission-card strong{display:block;font-size:22px;margin-top:6px;font-variant-numeric:tabular-nums}
.commission-card small{display:block;color:#849087;margin-top:5px}
.period-note{font-size:12px;color:var(--muted);margin-top:12px}
.hours-list{display:grid;gap:8px}
.hours-row{display:grid;grid-template-columns:115px minmax(0,1fr);gap:12px;align-items:center;padding:11px;border:1px solid var(--line);border-radius:11px;background:#0d130e}
.hours-name{font-size:12px;font-weight:800}
.hours-row.closed{opacity:.45}
.hours-times{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.hours-field label{margin:0 0 5px;font-size:10px}
.hours-field input{padding:8px 9px;font-size:12px}
.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.modal-backdrop{position:fixed;inset:0;z-index:30;background:#000b;display:grid;place-items:center;padding:18px}
.modal{width:min(100%,520px);max-height:90vh;overflow:auto;background:#111713;border:1px solid #354137;border-radius:18px;padding:21px;box-shadow:0 20px 80px #000a}
.modal-actions{display:flex;gap:8px;margin-top:16px}
.modal-actions button{flex:1}
@media(max-width:760px){main{padding:18px 12px 45px}.app-header{margin-bottom:16px}.commission-grid{grid-template-columns:1fr 1fr}.stats{grid-template-columns:repeat(3,minmax(0,1fr))}.stat{padding:11px}.stat strong{font-size:18px}.filters{width:100%}.filters select{flex:1;min-width:0}.hours-row{grid-template-columns:1fr}.hours-name{display:flex;justify-content:space-between}.welcome-row{align-items:start}.primary-action{width:100%}}
@media(max-width:480px){.form-grid{grid-template-columns:1fr}.commission-card strong{font-size:19px}.login-card{padding:19px}.card{padding:14px}.date-tools{width:100%}.date-tools input{flex:1;width:auto}}
.appointment-modal-backdrop{position:fixed;inset:0;z-index:50;background:#000b;display:grid;place-items:center;padding:18px}.appointment-modal{width:min(100%,520px);max-height:90vh;overflow:auto;background:#111713;border:1px solid #354137;border-radius:18px;padding:21px;box-shadow:0 20px 80px #000a}.appointment-modal-actions{display:flex;gap:8px;margin-top:16px}.appointment-modal-actions button{flex:1}.calendar-item{cursor:pointer}.calendar-item:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
</style>
</head>
<body>
<main>
<section class="login-wrap" id="login-card">
 <div class="login-card">
  <div class="brand">BARBER-SYSTEM / \xC1REA DO COLABORADOR</div>
  <h1>\xC1rea do profissional</h1>
  <p class="muted">Acesse sua agenda e acompanhe somente suas pr\xF3prias comiss\xF5es.</p>
  <label for="staff-select">Profissional</label>
  <select id="staff-select"><option value="">Carregando equipe...</option></select>
  <label for="pin">PIN de acesso</label>
  <input id="pin" type="password" inputmode="numeric" maxlength="4" autocomplete="current-password" placeholder="\u2022\u2022\u2022\u2022">
  <button id="login" style="width:100%;margin-top:15px">Entrar na minha \xE1rea</button>
  <div id="login-message" class="message" role="status"></div>
 </div>
</section>

<section id="workspace" class="hidden">
 <header class="app-header">
  <div>
   <div class="brand">BARBER-SYSTEM / PROFISSIONAL</div>
   <div class="shop-title">\xC1rea do profissional</div>
  </div>
  <div class="header-right">
   <button class="menu-button" id="open-menu" aria-label="Abrir menu" aria-expanded="false"><span></span><span></span><span></span></button>
  </div>
 </header>

 <div class="welcome-row">
  <div><div class="brand">MINHA AGENDA</div><h1 id="welcome">Ol\xE1</h1><p class="muted">Seus hor\xE1rios e atendimentos em um s\xF3 lugar.</p></div>
  <button class="primary-action" id="new-booking">+ Novo agendamento</button>
 </div>

 <div class="stats" id="stats"></div>

 <section class="card">
  <div class="toolbar">
   <div><h2>Agenda do dia</h2><p class="muted" id="agenda-date-label">Seus atendimentos por hor\xE1rio.</p></div>
   <div class="date-tools">
    <button class="secondary" id="prev-day" aria-label="Dia anterior">\u2039</button>
    <input id="date" type="date" aria-label="Data da agenda">
    <button class="secondary" id="next-day" aria-label="Pr\xF3ximo dia">\u203A</button>
    <button class="secondary today" id="today">Hoje</button>
   </div>
  </div>
  <div class="filters" style="margin-top:12px">
   <select id="status-filter"><option value="">Todos os status</option><option value="scheduled">Agendados</option><option value="completed">Conclu\xEDdos</option><option value="cancelled">Cancelados</option></select>
  </div>
  <div class="legend"><span>Agendado</span><span class="done">Conclu\xEDdo</span><span class="cancelled">Cancelado</span></div>
  <div class="calendar-scroll"><div id="calendar" class="empty-agenda">Carregando agenda...</div></div>
  <div id="agenda-message" class="message"></div>
 </section>

 <section class="card hidden" id="commission-panel">
  <div class="panel-header"><div><h2>Minhas comiss\xF5es</h2><p class="muted">Valores de atendimentos conclu\xEDdos.</p></div><button class="ghost" id="close-commission">Fechar</button></div>
  <div class="commission-grid" id="commission-grid"></div>
  <div class="period-note" id="commission-note"></div>
 </section>

 <section class="card hidden" id="lunch-panel">
  <div class="panel-header"><div><h2>Meu hor\xE1rio de almo\xE7o</h2><p class="muted">Defina sua pausa recorrente em cada dia. Seu expediente continua sendo definido pela administra\xE7\xE3o.</p></div><button class="ghost" id="close-lunch">Fechar</button></div>
  <div id="lunch-schedule" class="hours-list"></div>
  <button id="save-lunch" style="margin-top:14px">Salvar meus intervalos</button>
  <div id="lunch-message" class="message"></div>
 </section>
</section>
</main>

<div class="drawer-backdrop" id="drawer-backdrop"></div>
<aside class="drawer" id="menu-drawer" aria-label="Menu do profissional">
 <div class="drawer-head"><div><div class="brand">MENU DO PROFISSIONAL</div><h2 id="drawer-name" style="margin-top:7px">Minha \xE1rea</h2></div><button id="close-menu" aria-label="Fechar menu">\xD7</button></div>
 <nav class="drawer-nav">
  <button id="menu-commissions">Minhas comiss\xF5es<span>Acompanhe seus ganhos di\xE1rios, semanais, mensais e anuais</span></button>
  <button id="menu-lunch">Meu hor\xE1rio de almo\xE7o<span>Configure sua pausa por dia da semana</span></button>
  <button id="menu-logout">Sair da minha conta<span>Encerrar acesso \xE0 agenda</span></button>
 </nav>
 <div class="drawer-foot">Sua agenda e seus valores s\xE3o privados para este profissional.</div>
</aside>

<div class="modal-backdrop hidden" id="booking-modal">
 <section class="modal" role="dialog" aria-modal="true" aria-labelledby="booking-title">
  <div class="panel-header"><div><h2 id="booking-title">Novo agendamento</h2><p class="muted">Escolha um cliente j\xE1 cadastrado pelo administrador e reserve um hor\xE1rio na sua agenda.</p></div><button class="ghost" id="close-booking" aria-label="Fechar">\xD7</button></div>
  <label for="booking-customer">Cliente cadastrado</label><select id="booking-customer"><option value="">Carregando clientes...</option></select>
  <p class="muted">Os clientes s\xE3o cadastrados e gerenciados pelo administrador. O telefone n\xE3o aparece nesta \xE1rea.</p>
  <label for="booking-service">Servi\xE7o</label><select id="booking-service"><option value="">Selecione um servi\xE7o</option></select>
  <div class="form-grid">
   <div><label for="booking-date">Data</label><input id="booking-date" type="date"></div>
   <div><label for="booking-time">Hor\xE1rio dispon\xEDvel</label><select id="booking-time"><option value="">Selecione servi\xE7o e data</option></select></div>
  </div>
  <div id="booking-message" class="message"></div>
  <div class="modal-actions"><button class="secondary" id="cancel-booking">Voltar</button><button id="save-booking">Confirmar agendamento</button></div>
 </section>
</div>

<div class="modal-backdrop hidden" id="appointment-modal"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="appointment-modal-title"><div class="panel-header"><div><div class="brand">DETALHES DO AGENDAMENTO</div><h2 id="appointment-modal-title">Atendimento</h2></div><button class="ghost" id="close-appointment-modal">Fechar</button></div><p class="muted" id="appointment-modal-info"></p><div class="modal-actions" id="appointment-modal-actions"><button class="danger" id="appointment-cancel">Cancelar agendamento</button><button id="appointment-complete">Finalizar atendimento</button></div><div class="message" id="appointment-modal-message"></div></section></div>
<script>
(() => {
const slug=new URLSearchParams(location.search).get('slug')||location.pathname.split('/').filter(Boolean).pop();
const $=id=>document.getElementById(id);
const weekdays=['Segunda','Ter\xE7a','Quarta','Quinta','Sexta','S\xE1bado','Domingo'];
let loggedName='';
let currentRate=0;
let services=[];
let customers=[];
let preferredBookingTime='';
let scheduleDays=[];
let appointments=[];
let selectedAppointment=null;

function dateISO(d){
 const y=d.getFullYear();const m=String(d.getMonth()+1).padStart(2,'0');const day=String(d.getDate()).padStart(2,'0');
 return y+'-'+m+'-'+day;
}
function today(){return dateISO(new Date());}
function shift(value,amount){const d=new Date(value+'T12:00:00');d.setDate(d.getDate()+amount);return dateISO(d);}
function weekdayOf(value){return (new Date(value+'T12:00:00').getDay()+6)%7;}
function money(cents){return 'R$ '+(Number(cents||0)/100).toFixed(2).replace('.',',');}
function minutes(value){if(!value)return null;const p=value.split(':').map(Number);return p[0]*60+p[1];}
function clock(value){return String(Math.floor(value/60)).padStart(2,'0')+':'+String(value%60).padStart(2,'0');}
async function api(path,options={}){
 const headers={...(options.headers||{})};
 if(options.body)headers['Content-Type']='application/json';
 const response=await fetch('/api'+path,{...options,headers,credentials:'same-origin'});
 let data={};try{data=await response.json();}catch(_){}
 if(!response.ok)throw new Error(data.error||'N\xE3o foi poss\xEDvel concluir a opera\xE7\xE3o.');
 return data;
}
function message(id,text,error=false){$(id).textContent=text||'';$(id).classList.toggle('error',!!error);}
function openMenu(){document.body.classList.add('drawer-open');$('open-menu').setAttribute('aria-expanded','true');}
function closeMenu(){document.body.classList.remove('drawer-open');$('open-menu').setAttribute('aria-expanded','false');}
function openSection(id){
 $('commission-panel').classList.toggle('hidden',id!=='commission-panel');
 $('lunch-panel').classList.toggle('hidden',id!=='lunch-panel');
 if(id){$(id).scrollIntoView({behavior:'smooth',block:'start'});}
}
async function loadStaff(){
 const data=await api('/barber/shops/'+encodeURIComponent(slug)+'/staff');
 const select=$('staff-select');select.replaceChildren(new Option('Selecione seu nome',''));
 data.staff.forEach(staff=>select.add(new Option(staff.name+(staff.role==='owner'?' \xB7 Propriet\xE1rio':''),staff.id)));
 if(!data.staff.length)message('login-message','Nenhum profissional est\xE1 liberado para acessar esta \xE1rea.',true);
}
$('login').addEventListener('click',async()=>{
 const barberId=Number($('staff-select').value),pin=$('pin').value;
 if(!barberId||!/^\\d{4}$/.test(pin)){message('login-message','Selecione seu nome e informe o PIN com quatro n\xFAmeros.',true);return;}
 $('login').disabled=true;
 try{
  const data=await api('/auth/barber/login',{method:'POST',body:JSON.stringify({slug,barber_id:barberId,pin})});
  loggedName=data.barber.name;currentRate=Number(data.barber.commission_percent||0);
  $('welcome').textContent='Ol\xE1, '+loggedName;$('drawer-name').textContent=loggedName;
  $('login-card').classList.add('hidden');$('workspace').classList.remove('hidden');
  $('date').value=today();$('booking-date').value=today();$('pin').value='';
  await Promise.all([loadServices(),loadCustomers(),loadLunchSchedule()]);
  await loadAgenda();
 }catch(e){message('login-message',e.message,true);}
 finally{$('login').disabled=false;}
});

async function loadServices(){
 const data=await api('/barber/services');services=data.services;
 const select=$('booking-service');select.replaceChildren(new Option('Selecione um servi\xE7o',''));
 services.forEach(service=>select.add(new Option(
  service.name+' \xB7 '+money(service.price_cents)+' \xB7 '+service.duration_minutes+' min',
  service.id
 )));
}
async function loadCustomers(){
 const data=await api('/barber/customers');customers=data.customers;
 const select=$('booking-customer');select.replaceChildren(new Option(
  customers.length?'Selecione um cliente':'Nenhum cliente cadastrado pelo administrador',''
 ));
 customers.forEach(customer=>select.add(new Option(customer.name,String(customer.id))));
}
async function loadAgenda(){
 const selected=$('date').value||today();$('date').value=selected;
 const q=new URLSearchParams({date:selected});if($('status-filter').value)q.set('status',$('status-filter').value);
 const [data,schedule]=await Promise.all([
  api('/barber/appointments?'+q.toString()),api('/barber/schedule')
 ]);
 appointments=data.appointments;scheduleDays=schedule.days;
 renderStats(appointments);
 renderCalendar(appointments,selected,scheduleDays[weekdayOf(selected)]);
 const label=new Date(selected+'T12:00:00').toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long',year:'numeric'});
 $('agenda-date-label').textContent=label.charAt(0).toUpperCase()+label.slice(1);
}
function renderStats(items){
 const pending=items.filter(x=>x.status==='scheduled').length;
 const completed=items.filter(x=>x.status==='completed').length;
 const root=$('stats');root.replaceChildren();
 [['Agendados',pending],['Conclu\xEDdos',completed],['Atendimentos no dia',items.length]].forEach(([label,value])=>{
  const el=document.createElement('div');el.className='stat';
  const span=document.createElement('span');span.textContent=label;
  const strong=document.createElement('strong');strong.textContent=value;
  el.append(span,strong);root.append(el);
 });
}
function closeAppointmentModal(){ $('appointment-modal').classList.add('hidden'); selectedAppointment=null; }
function openAppointmentModal(item){
 selectedAppointment=item;$('appointment-modal-title').textContent=item.customer_name;
 $('appointment-modal-info').textContent=item.service_name+' \xB7 '+money(item.price_cents)+' \xB7 '+item.starts_at.replace('T',' ')+' \xB7 '+({scheduled:'Agendado',completed:'Conclu\xEDdo',cancelled:'Cancelado'}[item.status]||item.status);
 $('appointment-modal-actions').classList.toggle('hidden',item.status!=='scheduled');$('appointment-modal-message').textContent='';$('appointment-modal').classList.remove('hidden');
}
$('close-appointment-modal').addEventListener('click',closeAppointmentModal);
$('appointment-modal').addEventListener('click',e=>{if(e.target===$('appointment-modal'))closeAppointmentModal();});
$('appointment-complete').addEventListener('click',async()=>{if(!selectedAppointment)return;try{await api('/barber/appointments/'+selectedAppointment.id+'/status',{method:'PATCH',body:JSON.stringify({status:'completed'})});closeAppointmentModal();await loadAgenda();}catch(e){message('appointment-modal-message',e.message,true);}});
$('appointment-cancel').addEventListener('click',async()=>{if(!selectedAppointment)return;const reason=prompt('Informe o motivo do cancelamento:');if(!reason)return;try{await api('/barber/appointments/'+selectedAppointment.id+'/status',{method:'PATCH',body:JSON.stringify({status:'cancelled',reason})});closeAppointmentModal();await loadAgenda();}catch(e){message('appointment-modal-message',e.message,true);}});

function renderCalendar(items,selected,daySchedule){
 const root=$('calendar');root.replaceChildren();
 const visible=items;
 let start=daySchedule&&daySchedule.is_open&&daySchedule.open_time?minutes(daySchedule.open_time):8*60;
 let end=daySchedule&&daySchedule.is_open&&daySchedule.close_time?minutes(daySchedule.close_time):20*60;
 visible.forEach(item=>{
  start=Math.min(start,minutes(item.starts_at.slice(11,16))??start);
  end=Math.max(end,minutes(item.ends_at.slice(11,16))??end);
 });
 start=Math.max(0,Math.floor(start/60)*60);end=Math.min(24*60,Math.ceil(end/60)*60);
 if(end<=start)end=Math.min(24*60,start+60);
 const ppx=2,hourHeight=120,totalHeight=(end-start)*ppx;
 const timeline=document.createElement('div');timeline.className='timeline';
 const axis=document.createElement('div');axis.className='time-axis';axis.style.height=totalHeight+'px';
 for(let t=start;t<=end;t+=60){
  const label=document.createElement('div');label.className='time-label';label.style.top=((t-start)*ppx)+'px';label.textContent=clock(t);axis.append(label);
 }
 const lane=document.createElement('div');lane.className='time-lane';lane.style.height=totalHeight+'px';lane.style.setProperty('--hour-height',hourHeight+'px');
 lane.title='Clique em um espa\xE7o livre para iniciar um agendamento';
 lane.addEventListener('click',event=>{
  if(event.target.closest('.calendar-item,.break-block'))return;
  const rect=lane.getBoundingClientRect();
  const raw=start+((event.clientY-rect.top)/ppx);
  const chosen=Math.max(start,Math.min(end,Math.round(raw/15)*15));
  openBooking(selected,clock(chosen));
 });
 if(daySchedule&&daySchedule.break_start&&daySchedule.break_end){
  const bStart=minutes(daySchedule.break_start),bEnd=minutes(daySchedule.break_end);
  if(bStart!==null&&bEnd!==null&&bEnd>bStart){
   const block=document.createElement('div');block.className='break-block';
   block.style.top=Math.max(0,(bStart-start)*ppx)+'px';block.style.height=Math.max(24,(bEnd-bStart)*ppx)+'px';
   block.textContent='Intervalo / almo\xE7o \xB7 '+daySchedule.break_start+'\u2013'+daySchedule.break_end;lane.append(block);
  }
 }
 if(!visible.length){
  const empty=document.createElement('div');empty.className='empty-agenda';empty.textContent='Nenhum atendimento para este dia.';empty.style.position='absolute';empty.style.top='20px';empty.style.left='8px';empty.style.right='8px';lane.append(empty);
 }
 visible.forEach(item=>{
  const aStart=minutes(item.starts_at.slice(11,16)),aEnd=minutes(item.ends_at.slice(11,16));
  const duration=Math.max(5,aEnd-aStart);
  const card=document.createElement('article');card.className='calendar-item '+item.status;
  card.style.top=Math.max(0,(aStart-start)*ppx)+'px';card.style.height=Math.max(32,duration*ppx)+'px';
  const time=document.createElement('span');time.className='item-time';time.textContent=item.starts_at.slice(11,16)+' \u2013 '+item.ends_at.slice(11,16);
  const name=document.createElement('strong');name.textContent=item.customer_name;
  const service=document.createElement('span');service.className='item-service';service.textContent=item.service_name+' \xB7 '+money(item.price_cents);
  card.append(time,name,service);
  card.tabIndex=0;card.setAttribute('role','button');card.setAttribute('aria-label','Abrir agendamento de '+item.customer_name);
  card.addEventListener('click',()=>openAppointmentModal(item));
  card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openAppointmentModal(item);}});
  lane.append(card);
 });
 timeline.append(axis,lane);root.append(timeline);
 if(daySchedule&&daySchedule.is_open){
  message('agenda-message','Expediente: '+daySchedule.open_time+'\u2013'+daySchedule.close_time+'. Seus atendimentos aparecem no hor\xE1rio reservado.');
 }else{
  message('agenda-message','Este dia est\xE1 marcado como folga ou ainda n\xE3o possui expediente configurado.');
 }
}
$('date').addEventListener('change',()=>loadAgenda().catch(e=>message('agenda-message',e.message,true)));
$('status-filter').addEventListener('change',()=>loadAgenda().catch(e=>message('agenda-message',e.message,true)));
$('prev-day').addEventListener('click',()=>{$('date').value=shift($('date').value,-1);loadAgenda().catch(e=>message('agenda-message',e.message,true));});
$('next-day').addEventListener('click',()=>{$('date').value=shift($('date').value,1);loadAgenda().catch(e=>message('agenda-message',e.message,true));});
$('today').addEventListener('click',()=>{$('date').value=today();loadAgenda().catch(e=>message('agenda-message',e.message,true));});

function openBooking(dateValue=$('date').value||today(),timeValue=''){
 $('booking-modal').classList.remove('hidden');$('booking-date').value=dateValue;
 $('booking-service').value='';$('booking-customer').value='';
 preferredBookingTime=timeValue||'';
 $('booking-time').replaceChildren(new Option('Selecione servi\xE7o e data',''));
 message('booking-message',timeValue?'Hor\xE1rio escolhido: '+timeValue+'. Selecione o servi\xE7o para confirmar a disponibilidade.':'');
}
function closeBooking(){$('booking-modal').classList.add('hidden');}
async function loadAvailableSlots(){
 const serviceId=$('booking-service').value,dateValue=$('booking-date').value;
 const select=$('booking-time');select.replaceChildren(new Option('Buscando hor\xE1rios...',''));
 if(!serviceId||!dateValue){select.replaceChildren(new Option('Selecione servi\xE7o e data',''));return;}
 try{
  const data=await api('/barber/availability?service_id='+encodeURIComponent(serviceId)+'&date='+encodeURIComponent(dateValue));
  select.replaceChildren(new Option(data.slots.length?'Selecione o hor\xE1rio':'Nenhum hor\xE1rio livre neste dia',''));
  data.slots.forEach(slot=>select.add(new Option(slot,slot)));
  if(preferredBookingTime){
   if(data.slots.includes(preferredBookingTime)){
    select.value=preferredBookingTime;
   }else{
    message('booking-message','O hor\xE1rio clicado n\xE3o est\xE1 livre para este servi\xE7o. Escolha outro hor\xE1rio dispon\xEDvel.',true);
   }
   preferredBookingTime='';
  }
 }catch(e){select.replaceChildren(new Option('N\xE3o foi poss\xEDvel carregar',''));message('booking-message',e.message,true);}
}
$('new-booking').addEventListener('click',openBooking);
$('close-booking').addEventListener('click',closeBooking);
$('cancel-booking').addEventListener('click',closeBooking);
$('booking-service').addEventListener('change',loadAvailableSlots);
$('booking-date').addEventListener('change',loadAvailableSlots);
$('save-booking').addEventListener('click',async()=>{
 const payload={
  customer_id:Number($('booking-customer').value),
  service_id:Number($('booking-service').value),
  starts_at:$('booking-date').value+'T'+$('booking-time').value
 };
 if(!payload.customer_id){message('booking-message','Selecione um cliente cadastrado pelo administrador.',true);return;}
 if(!payload.service_id||!$('booking-time').value){message('booking-message','Selecione o servi\xE7o e um hor\xE1rio dispon\xEDvel.',true);return;}
 $('save-booking').disabled=true;
 try{
  await api('/barber/appointments',{method:'POST',body:JSON.stringify(payload)});
  message('booking-message','Agendamento criado com sucesso.');
  closeBooking();$('booking-customer').value='';$('booking-service').value='';
  $('date').value=payload.starts_at.slice(0,10);await loadAgenda();
 }catch(e){message('booking-message',e.message,true);}
 finally{$('save-booking').disabled=false;}
});

async function loadLunchSchedule(){
 const data=await api('/barber/schedule');scheduleDays=data.days;
 const root=$('lunch-schedule');root.replaceChildren();
 data.days.forEach(day=>{
  const row=document.createElement('div');row.className='hours-row'+(day.is_open?'':' closed');row.dataset.day=day.weekday;
  const name=document.createElement('div');name.className='hours-name';name.textContent=weekdays[day.weekday]+(day.is_open?'':' \xB7 Folga');
  const times=document.createElement('div');times.className='hours-times';
  [['break_start','In\xEDcio do almo\xE7o'],['break_end','Fim do almo\xE7o']].forEach(([field,label])=>{
   const box=document.createElement('div');box.className='hours-field';
   const caption=document.createElement('label');caption.textContent=label;
   const input=document.createElement('input');input.type='time';input.className=field;input.value=day.break_start&&day.break_end?day[field]||'':'';
   input.disabled=!day.is_open;caption.append(input);box.append(caption);times.append(box);
  });
  const schedule=document.createElement('div');schedule.className='muted';schedule.textContent=day.is_open?'Seu expediente: '+day.open_time+'\u2013'+day.close_time:'Sem expediente neste dia.';
  const config=document.createElement('div');config.append(times,schedule);row.append(name,config);root.append(row);
 });
}
$('save-lunch').addEventListener('click',async()=>{
 const days=[...$('lunch-schedule').children].map(row=>({
  weekday:Number(row.dataset.day),
  break_start:row.querySelector('.break_start').disabled?null:(row.querySelector('.break_start').value||null),
  break_end:row.querySelector('.break_end').disabled?null:(row.querySelector('.break_end').value||null)
 }));
 try{await api('/barber/schedule',{method:'PUT',body:JSON.stringify({days})});message('lunch-message','Seus hor\xE1rios de almo\xE7o foram salvos.');await Promise.all([loadLunchSchedule(),loadAgenda()]);}
 catch(e){message('lunch-message',e.message,true);}
});

async function loadCommissions(){
 const periods=[['daily','Di\xE1ria'],['weekly','Semanal'],['monthly','Mensal'],['yearly','Anual']];
 const results=await Promise.all(periods.map(async p=>({label:p[1],data:await api('/barber/commissions?period='+p[0])})));
 const root=$('commission-grid');root.replaceChildren();
 results.forEach(item=>{
  const card=document.createElement('div');card.className='commission-card';
  const title=document.createElement('span');title.textContent='Comiss\xE3o '+item.label;
  const value=document.createElement('strong');value.textContent=money(item.data.commission_cents);
  const detail=document.createElement('small');detail.textContent=money(item.data.sales_cents)+' em servi\xE7os \xB7 '+item.data.completed_count+' conclu\xEDdo(s)';
  card.append(title,value,detail);root.append(card);
 });
 $('commission-note').textContent='Taxa atual: '+Number(currentRate).toLocaleString('pt-BR')+'%. A taxa de cada agendamento fica registrada no momento da reserva; a comiss\xE3o \xE9 contabilizada quando o atendimento \xE9 conclu\xEDdo.';
}
$('open-menu').addEventListener('click',openMenu);
$('close-menu').addEventListener('click',closeMenu);
$('drawer-backdrop').addEventListener('click',closeMenu);
$('menu-commissions').addEventListener('click',async()=>{
 closeMenu();openSection('commission-panel');
 try{await loadCommissions();}catch(e){$('commission-note').textContent=e.message;}
});
$('close-commission').addEventListener('click',()=>openSection(null));
$('menu-lunch').addEventListener('click',async()=>{
 closeMenu();openSection('lunch-panel');
 try{await loadLunchSchedule();}catch(e){message('lunch-message',e.message,true);}
});
$('close-lunch').addEventListener('click',()=>openSection(null));
$('menu-logout').addEventListener('click',async()=>{
 closeMenu();
 try{await api('/auth/barber/logout',{method:'POST'});}catch(_){}
 $('workspace').classList.add('hidden');$('login-card').classList.remove('hidden');
 $('pin').value='';$('staff-select').value='';$('date').value='';$('status-filter').value='';
 $('commission-panel').classList.add('hidden');$('lunch-panel').classList.add('hidden');
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu();closeBooking();closeAppointmentModal();}});
loadStaff().catch(e=>message('login-message',e.message,true));
})();
<\/script>
</body>
</html>
`,Ye=`<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#101010">
  <title>Agendar | Agendamento online</title>
  <style>
    :root{color-scheme:dark;font-family:Inter,system-ui,-apple-system,sans-serif;background:#0b0b0b;color:#f5f5f5;--accent:#a8f05a}
    *{box-sizing:border-box}body{margin:0;padding:28px 16px 60px}
    main{max-width:720px;margin:auto}.brand-head{display:flex;align-items:center;gap:15px;margin-bottom:22px}
    .logo{width:76px;height:76px;object-fit:contain;border-radius:16px;background:#171717;border:1px solid #303030;padding:5px}
    .brand{font-size:12px;letter-spacing:.18em;color:var(--accent);text-transform:uppercase}
    h1{font-size:clamp(28px,6vw,42px);margin:7px 0 3px}h2{font-size:19px;margin:0 0 8px}
    p{color:#aaa;line-height:1.55;margin:7px 0 14px}
    .card{background:#151515;border:1px solid #292929;border-radius:16px;padding:20px;margin:18px 0}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
    label{display:block;color:#bbb;font-size:13px;margin:12px 0 7px}
    input,select,button{width:100%;border-radius:10px;padding:13px;background:#0d0d0d;color:#fff;border:1px solid #383838;font:inherit}
    button{cursor:pointer;background:var(--accent);color:#101010;border:0;font-weight:700;margin-top:12px}
    button.secondary{background:#252525;color:#eee;border:1px solid #444}
    button:disabled{opacity:.45;cursor:not-allowed}
    .choice-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px}
    .choice-grid button{min-height:74px;margin:0}
    .slots{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
    .slots button{width:auto;margin:0;padding:10px 14px}.slots button.selected{outline:2px solid var(--accent)}
    .muted{font-size:13px;color:#999}.message{margin-top:12px;color:var(--accent);white-space:pre-wrap}
    .hidden{display:none!important}.result{border-left:3px solid var(--accent);padding-left:12px}
    .match{display:block;text-align:left;background:#252525;color:#fff;border:1px solid #444;margin:8px 0}
    .match small{display:block;color:#aaa;font-weight:400;margin-top:4px}
    .theme-toggle{width:48px;min-width:48px;padding:10px;font-size:20px;margin:0}
    body.theme-light{background:#f2f4f0;color:#172019}
    body.theme-light .card{background:#fff;border-color:#dce2da;box-shadow:0 8px 25px rgba(0,0,0,.04)}
    body.theme-light p{color:#637064}
    body.theme-light label{color:#536054}
    body.theme-light input,body.theme-light select{background:#f7f9f6;color:#182019;border-color:#cbd4ca}
    body.theme-light button.secondary,body.theme-light .match{background:#e8ede7;color:#1b261b;border-color:#cbd4ca}
    body.theme-light .logo{background:#fff;border-color:#dce2da}
    body.theme-light .muted{color:#687468}
    body.theme-light .result{border-left-color:var(--accent)}
    body.theme-light .message{color:#3d7620}
    body.theme-light .brand{color:var(--accent)}
    body.theme-light .match small{color:#657064}
    @media(max-width:560px){.grid,.choice-grid{grid-template-columns:1fr}.card{padding:16px}.logo{width:62px;height:62px}}
  </style>
</head>
<body class="" style="--accent: #a8f05a;">
<main>
  <header class="brand-head">
    <img class="logo hidden" id="shop-logo" alt="Logo da barbearia">
    <div style="flex:1"><div class="brand">Agendamento online</div><h1 id="shop-name">Agendamento online</h1><p>Escolha seu atendimento sem precisar esperar.</p></div><button type="button" id="theme-toggle" class="secondary theme-toggle" aria-label="Alternar tema">\u263C</button>
  </header>

  <section class="card" id="identity-card">
    <h2>Vamos come\xE7ar</h2>
    <p>Voc\xEA j\xE1 veio \xE0 barbearia ou ser\xE1 sua primeira visita?</p>
    <div class="choice-grid" id="identity-choices">
      <button type="button" id="first-time">Primeira vez aqui</button>
      <button type="button" class="secondary" id="returning">J\xE1 sou cliente</button>
    </div>

    <div id="new-customer" class="hidden">
      <p>Fa\xE7a seu cadastro rapidinho para continuar.</p>
      <label for="customer-name">Nome completo</label>
      <input id="customer-name" maxlength="120" autocomplete="name" placeholder="Digite seu nome completo">
      <label for="phone">Celular com DDD</label>
      <input id="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="Ex.: (11) 99999-9999">
      <button type="button" id="create-customer">Salvar cadastro e continuar</button>
      <button type="button" class="secondary back-choices">Voltar</button>
    </div>

    <div id="existing-customer" class="hidden">
      <p>Digite somente os quatro \xFAltimos n\xFAmeros do seu celular.</p>
      <label for="last4">\xDAltimos quatro n\xFAmeros</label>
      <input id="last4" inputmode="numeric" maxlength="4" placeholder="Ex.: 9940">
      <button type="button" id="lookup">Continuar</button>
      <div id="matches"></div>
      <button type="button" class="secondary back-choices">Voltar</button>
    </div>
    <div id="customer-message" class="message" role="status"></div>
  </section>

  <section class="card hidden" id="booking-card">
    <div class="brand">SEU ATENDIMENTO</div>
    <h2>Escolha como quer ser atendido</h2>
    <div class="grid">
      <div><label for="service">Servi\xE7o</label><select id="service"><option value="">Carregando servi\xE7os...</option></select></div>
      <div><label for="barber">Profissional</label><select id="barber"><option value="">Carregando profissionais...</option></select></div>
    </div>
    <label for="date">Data</label><input id="date" type="date">
    <button id="find-slots" type="button">Ver hor\xE1rios dispon\xEDveis</button>
    <div id="slots" class="slots"></div>
    <div id="slot-message" class="message" role="status"></div>
    <div id="booking-summary" class="result hidden">
      <p id="summary" class="muted"></p>
      <button id="book" type="button" disabled>Confirmar agendamento</button>
    </div>
    <div id="final-message" class="message" role="status"></div>
  </section>
</main>
<script>
(() => {
  const slug = new URLSearchParams(location.search).get('slug') || location.pathname.split('/').filter(Boolean)[1];
  const api = (path) => '/api/public/shops/' + encodeURIComponent(slug) + path;
  const $ = (id) => document.getElementById(id);
  let selectedSlot = '';
  let customerId = null;
  let customerName = '';
  let catalog = {services:[],barbers:[],whatsapp:null};

  function option(select, value, label) {
    const node = document.createElement('option');
    node.value = value; node.textContent = label; select.appendChild(node);
  }
  function message(id, text) { $(id).textContent = text; }
  function showBooking() {
    $('identity-card').classList.add('hidden');
    $('booking-card').classList.remove('hidden');
    refreshSummary();
  }
  function resetIdentity() {
    customerId = null; customerName = '';
    $('identity-choices').classList.remove('hidden');
    $('new-customer').classList.add('hidden');
    $('existing-customer').classList.add('hidden');
    $('matches').replaceChildren();
    message('customer-message','');
  }
  function refreshSummary() {
    const service = catalog.services.find(x => String(x.id) === $('service').value);
    const barber = catalog.barbers.find(x => String(x.id) === $('barber').value);
    const date = $('date').value;
    const parts = [];
    if (customerName) parts.push(customerName);
    if (service) parts.push(service.name + ' (' + service.duration_minutes + ' min)');
    if (barber) parts.push(barber.name);
    if (date) parts.push(date);
    if (selectedSlot) parts.push(selectedSlot);
    $('summary').textContent = parts.length ? parts.join(' \u2022 ') : 'Selecione servi\xE7o, profissional, data e hor\xE1rio.';
    $('booking-summary').classList.toggle('hidden', !(service && barber && date && selectedSlot && customerId));
    $('book').disabled = !(service && barber && date && selectedSlot && customerId);
  }

  async function loadCatalog() {
    try {
      const response = await fetch(api('/catalog'));
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'N\xE3o foi poss\xEDvel carregar os servi\xE7os.');
      catalog = data;
      if (data.shop) {
        document.title = 'Agendar | ' + data.shop.name;
        $('shop-name').textContent = data.shop.name;
        document.body.style.setProperty('--accent', data.shop.brand_color || '#a8f05a');
        document.body.classList.toggle('theme-light', data.shop.theme === 'light');
        const logo = $('shop-logo');
        if (data.shop.logo_data) { logo.src = data.shop.logo_data; logo.classList.remove('hidden'); }
      }
      $('service').replaceChildren(); $('barber').replaceChildren();
      option($('service'), '', 'Selecione um servi\xE7o');
      option($('barber'), '', 'Selecione um profissional');
      data.services.forEach(x => option($('service'), x.id, x.name + ' \u2014 R$ ' + (x.price_cents/100).toFixed(2).replace('.',',') + ' / ' + x.duration_minutes + ' min'));
      data.barbers.forEach(x => option($('barber'), x.id, x.name));
      if (!data.services.length || !data.barbers.length) message('slot-message','Esta barbearia ainda n\xE3o cadastrou servi\xE7os ou profissionais ativos.');
    } catch (error) { message('slot-message', error.message); }
  }

  $('first-time').addEventListener('click', () => {
    $('identity-choices').classList.add('hidden');
    $('new-customer').classList.remove('hidden');
    $('customer-name').focus();
  });
  $('returning').addEventListener('click', () => {
    $('identity-choices').classList.add('hidden');
    $('existing-customer').classList.remove('hidden');
    $('last4').focus();
  });
  document.querySelectorAll('.back-choices').forEach(button => button.addEventListener('click', resetIdentity));

  $('create-customer').addEventListener('click', async () => {
    const name = $('customer-name').value.trim();
    const phone = $('phone').value.replace(/\\D/g,'');
    if (name.split(/\\s+/).filter(Boolean).length < 2 || name.length > 120 || phone.length < 10 || phone.length > 13) {
      message('customer-message','Informe nome e sobrenome, al\xE9m de um celular v\xE1lido com DDD.');
      return;
    }
    try {
      const response = await fetch(api('/customers'), {
        method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,phone})
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'N\xE3o foi poss\xEDvel cadastrar.');
      if (data.already_registered) {
        message('customer-message','Esse celular j\xE1 est\xE1 cadastrado. Escolha \u201CJ\xE1 sou cliente\u201D e localize seu cadastro pelos quatro \xFAltimos n\xFAmeros.');
        return;
      }
      customerId = data.customer.id; customerName = name;
      message('customer-message','Cadastro salvo. Agora escolha seu atendimento.');
      showBooking();
    } catch (error) { message('customer-message',error.message); }
  });

  $('lookup').addEventListener('click', async () => {
    $('matches').replaceChildren();
    const last4 = $('last4').value.replace(/\\D/g,'');
    if (last4.length !== 4) { message('customer-message','Digite exatamente quatro n\xFAmeros.'); return; }
    try {
      const response = await fetch(api('/customers/lookup'), {
        method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phone_last4:last4})
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao localizar cadastro.');
      if (!data.matches.length) {
        message('customer-message','N\xE3o encontramos um cadastro com esses n\xFAmeros. Se for sua primeira visita, volte e fa\xE7a seu cadastro.');
        return;
      }
      message('customer-message', data.matches.length > 1 ? 'Encontramos mais de um cadastro. Confirme seu nome:' : 'Confirme se este \xE9 voc\xEA:');
      data.matches.forEach(match => {
        const button = document.createElement('button');
        button.type='button'; button.className='match';
        button.textContent=match.display_name;
        button.addEventListener('click', async () => {
          const confirmResponse = await fetch(api('/customers/confirm'), {
            method:'POST',headers:{'Content-Type':'application/json'},
            body:JSON.stringify({customer_id:match.id,phone_last4:last4})
          });
          const result = await confirmResponse.json();
          if (!confirmResponse.ok) { message('customer-message',result.error || 'Cadastro inv\xE1lido.'); return; }
          customerId = result.customer.id; customerName = result.customer.display_name;
          message('customer-message','Cadastro confirmado. Agora escolha seu atendimento.');
          showBooking();
        });
        $('matches').appendChild(button);
      });
      const notMe = document.createElement('button');
      notMe.type='button'; notMe.className='secondary'; notMe.textContent='N\xE3o sou eu';
      notMe.addEventListener('click', () => {
        $('matches').replaceChildren();
        $('last4').value='';
        message('customer-message','Confira os n\xFAmeros e tente novamente. Se ainda n\xE3o encontrar, volte e fa\xE7a um novo cadastro.');
        $('last4').focus();
      });
      $('matches').appendChild(notMe);
    } catch (error) { message('customer-message',error.message); }
  });

  $('find-slots').addEventListener('click', async () => {
    selectedSlot=''; $('slots').replaceChildren(); refreshSummary();
    if (!$('service').value || !$('barber').value || !$('date').value) {
      message('slot-message','Escolha servi\xE7o, profissional e data.'); return;
    }
    message('slot-message','Consultando hor\xE1rios dispon\xEDveis...');
    const params = new URLSearchParams({service_id:$('service').value,barber_id:$('barber').value,date:$('date').value});
    try {
      const response = await fetch(api('/availability?' + params.toString()));
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao consultar hor\xE1rios.');
      if (!data.slots.length) { message('slot-message','N\xE3o h\xE1 hor\xE1rios livres nessa data. Escolha outra data.'); return; }
      message('slot-message','Toque no hor\xE1rio que preferir:');
      data.slots.forEach(slot => {
        const button=document.createElement('button');
        button.type='button';button.textContent=slot;button.className='secondary';
        button.addEventListener('click',()=>{
          selectedSlot=slot;
          [...$('slots').children].forEach(x=>x.classList.remove('selected'));
          button.classList.add('selected');refreshSummary();
        });
        $('slots').appendChild(button);
      });
    } catch (error) { message('slot-message',error.message); }
  });

  ['service','barber','date'].forEach(id => $(id).addEventListener('change',()=>{
    selectedSlot='';$('slots').replaceChildren();$('booking-summary').classList.add('hidden');refreshSummary();
  }));

  $('book').addEventListener('click', async () => {
    const startsAt=$('date').value+'T'+selectedSlot;
    $('book').disabled=true;
    try {
      const response=await fetch(api('/appointments'),{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({customer_id:customerId,service_id:Number($('service').value),barber_id:Number($('barber').value),starts_at:startsAt})
      });
      const data=await response.json();
      if (!response.ok) throw new Error(data.error || 'N\xE3o foi poss\xEDvel reservar esse hor\xE1rio.');
      $('final-message').textContent='Agendamento confirmado! C\xF3digo: #'+data.appointment.id;
      if (catalog.whatsapp) {
        const phone=catalog.whatsapp.replace(/\\D/g,'');
        const text=encodeURIComponent('Ol\xE1! Acabei de realizar um agendamento. C\xF3digo #'+data.appointment.id+', para '+startsAt.replace('T',' ')+'.');
        const link=document.createElement('a');
        link.href='https://wa.me/'+phone+'?text='+text;link.target='_blank';link.rel='noopener noreferrer';
        link.textContent=' Falar com a barbearia pelo WhatsApp';link.style.color='var(--accent)';
        $('final-message').appendChild(link);
      }
      $('book').textContent='Agendamento realizado';
    } catch (error) { message('final-message',error.message);$('book').disabled=false; }
  });

  const today=new Date();
  const localToday=new Date(today.getTime()-today.getTimezoneOffset()*60000).toISOString().slice(0,10);
  $('date').min=localToday;
  const themeToggle = $('theme-toggle');
  function refreshThemeToggle(){
    const light = document.body.classList.contains('theme-light');
    themeToggle.textContent = light ? '\u263E' : '\u263C';
    themeToggle.setAttribute('aria-label', light ? 'Ativar tema escuro' : 'Ativar tema claro');
  }
  themeToggle.addEventListener('click',()=>{
    document.body.classList.toggle('theme-light');
    refreshThemeToggle();
  });
  refreshThemeToggle();
  loadCatalog();
})();
<\/script>
</body>
</html>
`;var D=(e,a=200,t={})=>new Response(JSON.stringify(e),{status:a,headers:{"content-type":"application/json; charset=utf-8",...t}}),it=(e,a)=>{let t=new Headers(e.headers);return t.set("access-control-allow-origin",a||"*"),t.set("access-control-allow-methods","GET,POST,PUT,PATCH,DELETE,OPTIONS"),t.set("access-control-allow-headers","Content-Type, Authorization"),t.set("vary","Origin"),new Response(e.body,{status:e.status,headers:t})},me=(e,a=604800)=>"barber_session="+e+"; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age="+a;async function Ke(e,a,t){let o=crypto.randomUUID();return await e.DB.prepare("INSERT INTO auth_sessions(id,user_id,barbershop_id,role,expires_at) VALUES(?,?,?,?,datetime('now','+7 days'))").bind(o,a.id,a.barbershop_id,t).run(),o}async function oe(e,a){let o=(e.headers.get("Cookie")||"").split(";").map(n=>n.trim()).find(n=>n.startsWith("barber_session="))?.slice(15);return o?await a.DB.prepare("SELECT s.id,s.user_id,s.barbershop_id,s.role,u.name,u.email,u.is_active,u.role AS account_role,u.can_serve,u.commission_percent,b.slug AS barbershop_slug FROM auth_sessions s JOIN users u ON u.id=s.user_id JOIN barbershops b ON b.id=s.barbershop_id WHERE s.id=? AND s.expires_at>datetime('now') AND u.is_active=1").bind(o).first():null}async function dt(e,a,t){return await e.DB.prepare("INSERT INTO login_attempts(scope_key,failed_attempts,window_started_at,locked_until) VALUES(?,1,?,NULL) ON CONFLICT(scope_key) DO UPDATE SET failed_attempts=CASE WHEN excluded.window_started_at-login_attempts.window_started_at>=900 THEN 1 ELSE login_attempts.failed_attempts+1 END,window_started_at=CASE WHEN excluded.window_started_at-login_attempts.window_started_at>=900 THEN excluded.window_started_at ELSE login_attempts.window_started_at END,locked_until=CASE WHEN (CASE WHEN excluded.window_started_at-login_attempts.window_started_at>=900 THEN 1 ELSE login_attempts.failed_attempts+1 END)>=5 THEN excluded.window_started_at+900 ELSE NULL END").bind(a,t).run(),await e.DB.prepare("SELECT failed_attempts,locked_until FROM login_attempts WHERE scope_key=?").bind(a).first()}async function ct(e,a,t){if(e.method==="OPTIONS")return new Response(null,{status:204});if(t.pathname==="/api/health"){let s=await a.DB.prepare("SELECT COUNT(*) AS total FROM barbershops").first();return D({ok:!0,service:"barber-system",database:"connected",shops:s.total})}if(t.pathname==="/api/auth/registration-status"&&e.method==="GET")return D({available:a.OWNER_REGISTRATION_ENABLED==="true"});if(t.pathname==="/api/auth/register"&&e.method==="POST"){let s=await e.json().catch(()=>null);if(!s)return D({error:"Envie os dados em JSON."},400);let i=String(s.shop_name||"").trim(),c=String(s.owner_name||"").trim(),l=String(s.email||"").trim().toLowerCase(),m=s.password,h=String(s.whatsapp||"").replace(/\\D/g,"");if(!i||!c||!l||!m||!h)return D({error:"Preencha todos os campos, inclusive o WhatsApp."},400);if(i.length>120||c.length>120||!/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(l)||h.length<10||h.length>13)return D({error:"Confira o nome, e-mail e WhatsApp informado."},400);if(typeof m!="string"||m.length<8)return D({error:"A senha deve ter pelo menos 8 caracteres."},400);if(a.OWNER_REGISTRATION_ENABLED!=="true")return D({error:"Novos cadastros est\xE3o temporariamente desativados."},403);if(await a.DB.prepare("SELECT id FROM users WHERE lower(email)=? AND role='owner' LIMIT 1").bind(l).first())return D({error:"Este e-mail j\xE1 possui uma conta. Use outro e-mail ou entre no painel."},409);let u=await a.DB.prepare("SELECT COUNT(*) AS n FROM barbershops").first(),d=await a.DB.prepare("SELECT COUNT(*) AS n FROM users").first(),b=null;if(u.n===1&&d.n===0&&(b=await a.DB.prepare("SELECT id FROM barbershops ORDER BY id LIMIT 1").first()),await a.DB.prepare("SELECT id FROM barbershops WHERE whatsapp=? AND id<>? LIMIT 1").bind(h,b?.id||0).first())return D({error:"Este WhatsApp j\xE1 est\xE1 vinculado a uma barbearia. Use outro n\xFAmero."},409);let v=i.normalize("NFKD").replace(/[\\u0300-\\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");if(!v)return D({error:"Nome inv\xE1lido para endere\xE7o."},400);let w=v,f=2;for(;await a.DB.prepare("SELECT id FROM barbershops WHERE slug=? AND id<>?").bind(w,b?.id||0).first();)w=v+"-"+f++;let x,N=!1;b?x=b.id:(x=(await a.DB.prepare("INSERT INTO barbershops(name,slug,whatsapp) VALUES(?,?,?)").bind(i,w,h).run()).meta.last_row_id,N=!0);try{let E=await J(m);await a.DB.prepare("INSERT INTO users(barbershop_id,name,email,password_hash,role,can_serve) VALUES(?,?,?,?,'owner',0)").bind(x,c,l,E).run(),N||await a.DB.prepare("UPDATE barbershops SET name=?,slug=?,whatsapp=? WHERE id=?").bind(i,w,h,x).run()}catch(E){if(N&&await a.DB.prepare("DELETE FROM barbershops WHERE id=? AND NOT EXISTS (SELECT 1 FROM users WHERE barbershop_id=?)").bind(x,x).run(),String(E?.message||"").toLowerCase().includes("unique"))return D({error:"Este e-mail ou WhatsApp j\xE1 est\xE1 em uso, ou esta barbearia j\xE1 possui propriet\xE1rio. Confira os dados e tente novamente."},409);throw E}return D({message:"Barbearia cadastrada com sucesso. Agora entre com seu e-mail e senha.",barbershop:{id:x,name:i,slug:w}},201)}if(t.pathname==="/api/auth/login"&&e.method==="POST"){let s=await e.json().catch(()=>null);if(!s)return D({error:"Informe e-mail e senha."},400);let i=String(s.email||"").trim().toLowerCase(),c=await a.DB.prepare("SELECT u.id,u.barbershop_id,u.name,u.email,u.password_hash,u.role,u.is_active,b.name AS shop_name,b.slug AS shop_slug FROM users u JOIN barbershops b ON b.id=u.barbershop_id WHERE u.email=? AND u.role='owner'").bind(i).first();if(!c||!c.is_active||!await ge(c.password_hash,s.password||""))return D({error:"E-mail ou senha incorretos."},401);ve(c.password_hash)&&await a.DB.prepare("UPDATE users SET password_hash=? WHERE id=?").bind(await J(s.password),c.id).run();let l=await Ke(a,c,"owner");return D({message:"Login realizado com sucesso.",user:{id:c.id,name:c.name,email:c.email,role:c.role},barbershop:{id:c.barbershop_id,name:c.shop_name,slug:c.shop_slug}},200,{"set-cookie":me(l)})}if(t.pathname==="/api/auth/me"&&e.method==="GET"){let s=await oe(e,a);return!s||s.role!=="owner"?D({error:"Acesso n\xE3o autorizado. Fa\xE7a login."},401):D({id:s.user_id,barbershop_id:s.barbershop_id,name:s.name,email:s.email,role:s.role,barbershop_slug:s.barbershop_slug})}if(t.pathname==="/api/auth/logout"&&e.method==="POST"){let s=await oe(e,a);return s&&await a.DB.prepare("DELETE FROM auth_sessions WHERE id=?").bind(s.id).run(),D({message:"Logout realizado com sucesso."},200,{"set-cookie":me("",0)})}if(t.pathname==="/api/auth/barber/login"&&e.method==="POST"){let s=await e.json().catch(()=>null);if(!s||typeof s!="object")return D({error:"Informe o profissional e o PIN."},400);let i=String(s.slug||"").trim().toLowerCase(),c=Number(s.barber_id),l=s.pin;if(!/^[a-z0-9-]{1,120}$/.test(i)||!Number.isSafeInteger(c)||c<1||typeof l!="string"||!/^\d{4}$/.test(l))return D({error:"Selecione o profissional e informe um PIN de quatro n\xFAmeros."},400);let m=await a.DB.prepare("SELECT u.id,u.barbershop_id,u.name,u.pin_hash,u.role,u.can_serve,u.commission_percent,b.slug FROM users u JOIN barbershops b ON b.id=u.barbershop_id WHERE b.slug=? AND u.id=? AND u.role IN ('barber','owner') AND u.is_active=1 AND (u.role='barber' OR u.can_serve=1)").bind(i,c).first();if(!m||!m.pin_hash)return D({error:"PIN ou acesso inv\xE1lido."},401);let h=e.headers.get("CF-Connecting-IP")||"unknown",_="barber-pin:"+m.barbershop_id+":"+m.id+":"+h,u=Math.floor(Date.now()/1e3),d=await a.DB.prepare("SELECT failed_attempts,locked_until FROM login_attempts WHERE scope_key=?").bind(_).first();if(d?.locked_until&&d.locked_until>u)return D({error:"Muitas tentativas. Aguarde 15 minutos para tentar novamente."},429);if(!await ge(m.pin_hash,l)){let v=await dt(a,_,u);return v?.locked_until&&v.locked_until>u?D({error:"Limite de tentativas atingido. Acesso bloqueado por 15 minutos."},429):D({error:"PIN ou acesso inv\xE1lido."},401)}await a.DB.prepare("DELETE FROM login_attempts WHERE scope_key=?").bind(_).run(),ve(m.pin_hash)&&await a.DB.prepare("UPDATE users SET pin_hash=? WHERE id=? AND barbershop_id=?").bind(await J(l),m.id,m.barbershop_id).run();let g=await Ke(a,m,"barber");return D({message:"Login realizado com sucesso.",barber:{id:m.id,name:m.name,role:"barber",commission_percent:m.commission_percent||0},barbershop:{slug:m.slug}},200,{"set-cookie":me(g)})}if(t.pathname==="/api/auth/barber/me"&&e.method==="GET"){let s=await oe(e,a);return!s||s.role!=="barber"||!(s.account_role==="barber"||s.account_role==="owner"&&s.can_serve)?D({error:"Acesso n\xE3o autorizado. Fa\xE7a login."},401):D({id:s.user_id,barbershop_id:s.barbershop_id,name:s.name,role:"barber",commission_percent:s.commission_percent||0,barbershop_slug:s.barbershop_slug})}if(t.pathname==="/api/auth/barber/logout"&&e.method==="POST"){let s=await oe(e,a);return s?.role==="barber"&&await a.DB.prepare("DELETE FROM auth_sessions WHERE id=?").bind(s.id).run(),D({message:"Logout realizado com sucesso."},200,{"set-cookie":me("",0)})}let o=await Ge(e,a,t);if(o)return o;let n=await Ie(e,a,t);if(n)return n;let r=await ne(e,a,t);return r||D({error:"Rota ainda n\xE3o migrada.",path:t.pathname},501)}var Et={async fetch(e,a){let t=new URL(e.url),o;if(t.pathname.startsWith("/api/"))try{o=await ct(e,a,t)}catch(n){o=D({error:"Erro interno.",detail:a.ENVIRONMENT==="development"?n.message:void 0},500)}else if(e.method==="GET"){let n=r=>new Response(r,{headers:{"content-type":"text/html; charset=utf-8","cache-control":"no-cache"}});if(t.pathname==="/"||t.pathname==="/admin"||t.pathname==="/admin/")o=Response.redirect(new URL("/admin/panel",t),302);else if(t.pathname==="/admin/panel"||t.pathname==="/admin/panel/"){let r=await oe(e,a);r?.role==="barber"?o=Response.redirect(new URL("/barber/"+r.barbershop_slug,t),303):o=n(Se)}else t.pathname==="/admin/panel/index.html"?o=n(Se):/^\/barber\/[a-z0-9-]+$/.test(t.pathname)?o=n(Ve):/^\/b\/[a-z0-9-]+\/book$/.test(t.pathname)?o=n(Ye):o=new Response("P\xE1gina n\xE3o encontrada.",{status:404})}else o=new Response("M\xE9todo n\xE3o permitido.",{status:405});return it(o,e.headers.get("Origin"))}};export{Et as default};
