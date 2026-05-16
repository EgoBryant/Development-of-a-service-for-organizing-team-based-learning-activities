(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))n(r);new MutationObserver(r=>{for(const i of r)if(i.type==="childList")for(const l of i.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&n(l)}).observe(document,{childList:!0,subtree:!0});function a(r){const i={};return r.integrity&&(i.integrity=r.integrity),r.referrerPolicy&&(i.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?i.credentials="include":r.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(r){if(r.ep)return;r.ep=!0;const i=a(r);fetch(r.href,i)}})();var Y={},ha=function(){return typeof Promise=="function"&&Promise.prototype&&Promise.prototype.then},Bt={},_={};let et;const ba=[0,26,44,70,100,134,172,196,242,292,346,404,466,532,581,655,733,815,901,991,1085,1156,1258,1364,1474,1588,1706,1828,1921,2051,2185,2323,2465,2611,2761,2876,3034,3196,3362,3532,3706];_.getSymbolSize=function(t){if(!t)throw new Error('"version" cannot be null or undefined');if(t<1||t>40)throw new Error('"version" should be in range from 1 to 40');return t*4+17};_.getSymbolTotalCodewords=function(t){return ba[t]};_.getBCHDigit=function(e){let t=0;for(;e!==0;)t++,e>>>=1;return t};_.setToSJISFunction=function(t){if(typeof t!="function")throw new Error('"toSJISFunc" is not a valid function.');et=t};_.isKanjiModeEnabled=function(){return typeof et<"u"};_.toSJIS=function(t){return et(t)};var Te={};(function(e){e.L={bit:1},e.M={bit:0},e.Q={bit:3},e.H={bit:2};function t(a){if(typeof a!="string")throw new Error("Param is not a string");switch(a.toLowerCase()){case"l":case"low":return e.L;case"m":case"medium":return e.M;case"q":case"quartile":return e.Q;case"h":case"high":return e.H;default:throw new Error("Unknown EC Level: "+a)}}e.isValid=function(n){return n&&typeof n.bit<"u"&&n.bit>=0&&n.bit<4},e.from=function(n,r){if(e.isValid(n))return n;try{return t(n)}catch{return r}}})(Te);function Nt(){this.buffer=[],this.length=0}Nt.prototype={get:function(e){const t=Math.floor(e/8);return(this.buffer[t]>>>7-e%8&1)===1},put:function(e,t){for(let a=0;a<t;a++)this.putBit((e>>>t-a-1&1)===1)},getLengthInBits:function(){return this.length},putBit:function(e){const t=Math.floor(this.length/8);this.buffer.length<=t&&this.buffer.push(0),e&&(this.buffer[t]|=128>>>this.length%8),this.length++}};var ya=Nt;function ue(e){if(!e||e<1)throw new Error("BitMatrix size must be defined and greater than 0");this.size=e,this.data=new Uint8Array(e*e),this.reservedBit=new Uint8Array(e*e)}ue.prototype.set=function(e,t,a,n){const r=e*this.size+t;this.data[r]=a,n&&(this.reservedBit[r]=!0)};ue.prototype.get=function(e,t){return this.data[e*this.size+t]};ue.prototype.xor=function(e,t,a){this.data[e*this.size+t]^=a};ue.prototype.isReserved=function(e,t){return this.reservedBit[e*this.size+t]};var Ea=ue,Rt={};(function(e){const t=_.getSymbolSize;e.getRowColCoords=function(n){if(n===1)return[];const r=Math.floor(n/7)+2,i=t(n),l=i===145?26:Math.ceil((i-13)/(2*r-2))*2,c=[i-7];for(let s=1;s<r-1;s++)c[s]=c[s-1]-l;return c.push(6),c.reverse()},e.getPositions=function(n){const r=[],i=e.getRowColCoords(n),l=i.length;for(let c=0;c<l;c++)for(let s=0;s<l;s++)c===0&&s===0||c===0&&s===l-1||c===l-1&&s===0||r.push([i[c],i[s]]);return r}})(Rt);var Dt={};const wa=_.getSymbolSize,bt=7;Dt.getPositions=function(t){const a=wa(t);return[[0,0],[a-bt,0],[0,a-bt]]};var At={};(function(e){e.Patterns={PATTERN000:0,PATTERN001:1,PATTERN010:2,PATTERN011:3,PATTERN100:4,PATTERN101:5,PATTERN110:6,PATTERN111:7};const t={N1:3,N2:3,N3:40,N4:10};e.isValid=function(r){return r!=null&&r!==""&&!isNaN(r)&&r>=0&&r<=7},e.from=function(r){return e.isValid(r)?parseInt(r,10):void 0},e.getPenaltyN1=function(r){const i=r.size;let l=0,c=0,s=0,u=null,d=null;for(let h=0;h<i;h++){c=s=0,u=d=null;for(let p=0;p<i;p++){let v=r.get(h,p);v===u?c++:(c>=5&&(l+=t.N1+(c-5)),u=v,c=1),v=r.get(p,h),v===d?s++:(s>=5&&(l+=t.N1+(s-5)),d=v,s=1)}c>=5&&(l+=t.N1+(c-5)),s>=5&&(l+=t.N1+(s-5))}return l},e.getPenaltyN2=function(r){const i=r.size;let l=0;for(let c=0;c<i-1;c++)for(let s=0;s<i-1;s++){const u=r.get(c,s)+r.get(c,s+1)+r.get(c+1,s)+r.get(c+1,s+1);(u===4||u===0)&&l++}return l*t.N2},e.getPenaltyN3=function(r){const i=r.size;let l=0,c=0,s=0;for(let u=0;u<i;u++){c=s=0;for(let d=0;d<i;d++)c=c<<1&2047|r.get(u,d),d>=10&&(c===1488||c===93)&&l++,s=s<<1&2047|r.get(d,u),d>=10&&(s===1488||s===93)&&l++}return l*t.N3},e.getPenaltyN4=function(r){let i=0;const l=r.data.length;for(let s=0;s<l;s++)i+=r.data[s];return Math.abs(Math.ceil(i*100/l/5)-10)*t.N4};function a(n,r,i){switch(n){case e.Patterns.PATTERN000:return(r+i)%2===0;case e.Patterns.PATTERN001:return r%2===0;case e.Patterns.PATTERN010:return i%3===0;case e.Patterns.PATTERN011:return(r+i)%3===0;case e.Patterns.PATTERN100:return(Math.floor(r/2)+Math.floor(i/3))%2===0;case e.Patterns.PATTERN101:return r*i%2+r*i%3===0;case e.Patterns.PATTERN110:return(r*i%2+r*i%3)%2===0;case e.Patterns.PATTERN111:return(r*i%3+(r+i)%2)%2===0;default:throw new Error("bad maskPattern:"+n)}}e.applyMask=function(r,i){const l=i.size;for(let c=0;c<l;c++)for(let s=0;s<l;s++)i.isReserved(s,c)||i.xor(s,c,a(r,s,c))},e.getBestMask=function(r,i){const l=Object.keys(e.Patterns).length;let c=0,s=1/0;for(let u=0;u<l;u++){i(u),e.applyMask(u,r);const d=e.getPenaltyN1(r)+e.getPenaltyN2(r)+e.getPenaltyN3(r)+e.getPenaltyN4(r);e.applyMask(u,r),d<s&&(s=d,c=u)}return c}})(At);var Ie={};const J=Te,fe=[1,1,1,1,1,1,1,1,1,1,2,2,1,2,2,4,1,2,4,4,2,4,4,4,2,4,6,5,2,4,6,6,2,5,8,8,4,5,8,8,4,5,8,11,4,8,10,11,4,9,12,16,4,9,16,16,6,10,12,18,6,10,17,16,6,11,16,19,6,13,18,21,7,14,21,25,8,16,20,25,8,17,23,25,9,17,23,34,9,18,25,30,10,20,27,32,12,21,29,35,12,23,34,37,12,25,34,40,13,26,35,42,14,28,38,45,15,29,40,48,16,31,43,51,17,33,45,54,18,35,48,57,19,37,51,60,19,38,53,63,20,40,56,66,21,43,59,70,22,45,62,74,24,47,65,77,25,49,68,81],pe=[7,10,13,17,10,16,22,28,15,26,36,44,20,36,52,64,26,48,72,88,36,64,96,112,40,72,108,130,48,88,132,156,60,110,160,192,72,130,192,224,80,150,224,264,96,176,260,308,104,198,288,352,120,216,320,384,132,240,360,432,144,280,408,480,168,308,448,532,180,338,504,588,196,364,546,650,224,416,600,700,224,442,644,750,252,476,690,816,270,504,750,900,300,560,810,960,312,588,870,1050,336,644,952,1110,360,700,1020,1200,390,728,1050,1260,420,784,1140,1350,450,812,1200,1440,480,868,1290,1530,510,924,1350,1620,540,980,1440,1710,570,1036,1530,1800,570,1064,1590,1890,600,1120,1680,1980,630,1204,1770,2100,660,1260,1860,2220,720,1316,1950,2310,750,1372,2040,2430];Ie.getBlocksCount=function(t,a){switch(a){case J.L:return fe[(t-1)*4+0];case J.M:return fe[(t-1)*4+1];case J.Q:return fe[(t-1)*4+2];case J.H:return fe[(t-1)*4+3];default:return}};Ie.getTotalCodewordsCount=function(t,a){switch(a){case J.L:return pe[(t-1)*4+0];case J.M:return pe[(t-1)*4+1];case J.Q:return pe[(t-1)*4+2];case J.H:return pe[(t-1)*4+3];default:return}};var $t={},ke={};const oe=new Uint8Array(512),Ee=new Uint8Array(256);(function(){let t=1;for(let a=0;a<255;a++)oe[a]=t,Ee[t]=a,t<<=1,t&256&&(t^=285);for(let a=255;a<512;a++)oe[a]=oe[a-255]})();ke.log=function(t){if(t<1)throw new Error("log("+t+")");return Ee[t]};ke.exp=function(t){return oe[t]};ke.mul=function(t,a){return t===0||a===0?0:oe[Ee[t]+Ee[a]]};(function(e){const t=ke;e.mul=function(n,r){const i=new Uint8Array(n.length+r.length-1);for(let l=0;l<n.length;l++)for(let c=0;c<r.length;c++)i[l+c]^=t.mul(n[l],r[c]);return i},e.mod=function(n,r){let i=new Uint8Array(n);for(;i.length-r.length>=0;){const l=i[0];for(let s=0;s<r.length;s++)i[s]^=t.mul(r[s],l);let c=0;for(;c<i.length&&i[c]===0;)c++;i=i.slice(c)}return i},e.generateECPolynomial=function(n){let r=new Uint8Array([1]);for(let i=0;i<n;i++)r=e.mul(r,new Uint8Array([1,t.exp(i)]));return r}})($t);const qt=$t;function tt(e){this.genPoly=void 0,this.degree=e,this.degree&&this.initialize(this.degree)}tt.prototype.initialize=function(t){this.degree=t,this.genPoly=qt.generateECPolynomial(this.degree)};tt.prototype.encode=function(t){if(!this.genPoly)throw new Error("Encoder not initialized");const a=new Uint8Array(t.length+this.degree);a.set(t);const n=qt.mod(a,this.genPoly),r=this.degree-n.length;if(r>0){const i=new Uint8Array(this.degree);return i.set(n,r),i}return n};var Ca=tt,Ft={},G={},at={};at.isValid=function(t){return!isNaN(t)&&t>=1&&t<=40};var z={};const Pt="[0-9]+",Sa="[A-Z $%*+\\-./:]+";let ce="(?:[u3000-u303F]|[u3040-u309F]|[u30A0-u30FF]|[uFF00-uFFEF]|[u4E00-u9FAF]|[u2605-u2606]|[u2190-u2195]|u203B|[u2010u2015u2018u2019u2025u2026u201Cu201Du2225u2260]|[u0391-u0451]|[u00A7u00A8u00B1u00B4u00D7u00F7])+";ce=ce.replace(/u/g,"\\u");const Ta="(?:(?![A-Z0-9 $%*+\\-./:]|"+ce+`)(?:.|[\r
]))+`;z.KANJI=new RegExp(ce,"g");z.BYTE_KANJI=new RegExp("[^A-Z0-9 $%*+\\-./:]+","g");z.BYTE=new RegExp(Ta,"g");z.NUMERIC=new RegExp(Pt,"g");z.ALPHANUMERIC=new RegExp(Sa,"g");const Ia=new RegExp("^"+ce+"$"),ka=new RegExp("^"+Pt+"$"),La=new RegExp("^[A-Z0-9 $%*+\\-./:]+$");z.testKanji=function(t){return Ia.test(t)};z.testNumeric=function(t){return ka.test(t)};z.testAlphanumeric=function(t){return La.test(t)};(function(e){const t=at,a=z;e.NUMERIC={id:"Numeric",bit:1,ccBits:[10,12,14]},e.ALPHANUMERIC={id:"Alphanumeric",bit:2,ccBits:[9,11,13]},e.BYTE={id:"Byte",bit:4,ccBits:[8,16,16]},e.KANJI={id:"Kanji",bit:8,ccBits:[8,10,12]},e.MIXED={bit:-1},e.getCharCountIndicator=function(i,l){if(!i.ccBits)throw new Error("Invalid mode: "+i);if(!t.isValid(l))throw new Error("Invalid version: "+l);return l>=1&&l<10?i.ccBits[0]:l<27?i.ccBits[1]:i.ccBits[2]},e.getBestModeForData=function(i){return a.testNumeric(i)?e.NUMERIC:a.testAlphanumeric(i)?e.ALPHANUMERIC:a.testKanji(i)?e.KANJI:e.BYTE},e.toString=function(i){if(i&&i.id)return i.id;throw new Error("Invalid mode")},e.isValid=function(i){return i&&i.bit&&i.ccBits};function n(r){if(typeof r!="string")throw new Error("Param is not a string");switch(r.toLowerCase()){case"numeric":return e.NUMERIC;case"alphanumeric":return e.ALPHANUMERIC;case"kanji":return e.KANJI;case"byte":return e.BYTE;default:throw new Error("Unknown mode: "+r)}}e.from=function(i,l){if(e.isValid(i))return i;try{return n(i)}catch{return l}}})(G);(function(e){const t=_,a=Ie,n=Te,r=G,i=at,l=7973,c=t.getBCHDigit(l);function s(p,v,E){for(let S=1;S<=40;S++)if(v<=e.getCapacity(S,E,p))return S}function u(p,v){return r.getCharCountIndicator(p,v)+4}function d(p,v){let E=0;return p.forEach(function(S){const q=u(S.mode,v);E+=q+S.getBitsLength()}),E}function h(p,v){for(let E=1;E<=40;E++)if(d(p,E)<=e.getCapacity(E,v,r.MIXED))return E}e.from=function(v,E){return i.isValid(v)?parseInt(v,10):E},e.getCapacity=function(v,E,S){if(!i.isValid(v))throw new Error("Invalid QR Code version");typeof S>"u"&&(S=r.BYTE);const q=t.getSymbolTotalCodewords(v),w=a.getTotalCodewordsCount(v,E),T=(q-w)*8;if(S===r.MIXED)return T;const b=T-u(S,v);switch(S){case r.NUMERIC:return Math.floor(b/10*3);case r.ALPHANUMERIC:return Math.floor(b/11*2);case r.KANJI:return Math.floor(b/13);case r.BYTE:default:return Math.floor(b/8)}},e.getBestVersionForData=function(v,E){let S;const q=n.from(E,n.M);if(Array.isArray(v)){if(v.length>1)return h(v,q);if(v.length===0)return 1;S=v[0]}else S=v;return s(S.mode,S.getLength(),q)},e.getEncodedBits=function(v){if(!i.isValid(v)||v<7)throw new Error("Invalid QR Code version");let E=v<<12;for(;t.getBCHDigit(E)-c>=0;)E^=l<<t.getBCHDigit(E)-c;return v<<12|E}})(Ft);var Ut={};const xe=_,Ot=1335,Ma=21522,yt=xe.getBCHDigit(Ot);Ut.getEncodedBits=function(t,a){const n=t.bit<<3|a;let r=n<<10;for(;xe.getBCHDigit(r)-yt>=0;)r^=Ot<<xe.getBCHDigit(r)-yt;return(n<<10|r)^Ma};var _t={};const Ba=G;function ee(e){this.mode=Ba.NUMERIC,this.data=e.toString()}ee.getBitsLength=function(t){return 10*Math.floor(t/3)+(t%3?t%3*3+1:0)};ee.prototype.getLength=function(){return this.data.length};ee.prototype.getBitsLength=function(){return ee.getBitsLength(this.data.length)};ee.prototype.write=function(t){let a,n,r;for(a=0;a+3<=this.data.length;a+=3)n=this.data.substr(a,3),r=parseInt(n,10),t.put(r,10);const i=this.data.length-a;i>0&&(n=this.data.substr(a),r=parseInt(n,10),t.put(r,i*3+1))};var Na=ee;const Ra=G,$e=["0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"," ","$","%","*","+","-",".","/",":"];function te(e){this.mode=Ra.ALPHANUMERIC,this.data=e}te.getBitsLength=function(t){return 11*Math.floor(t/2)+6*(t%2)};te.prototype.getLength=function(){return this.data.length};te.prototype.getBitsLength=function(){return te.getBitsLength(this.data.length)};te.prototype.write=function(t){let a;for(a=0;a+2<=this.data.length;a+=2){let n=$e.indexOf(this.data[a])*45;n+=$e.indexOf(this.data[a+1]),t.put(n,11)}this.data.length%2&&t.put($e.indexOf(this.data[a]),6)};var Da=te;const Aa=G;function ae(e){this.mode=Aa.BYTE,typeof e=="string"?this.data=new TextEncoder().encode(e):this.data=new Uint8Array(e)}ae.getBitsLength=function(t){return t*8};ae.prototype.getLength=function(){return this.data.length};ae.prototype.getBitsLength=function(){return ae.getBitsLength(this.data.length)};ae.prototype.write=function(e){for(let t=0,a=this.data.length;t<a;t++)e.put(this.data[t],8)};var $a=ae;const qa=G,Fa=_;function ne(e){this.mode=qa.KANJI,this.data=e}ne.getBitsLength=function(t){return t*13};ne.prototype.getLength=function(){return this.data.length};ne.prototype.getBitsLength=function(){return ne.getBitsLength(this.data.length)};ne.prototype.write=function(e){let t;for(t=0;t<this.data.length;t++){let a=Fa.toSJIS(this.data[t]);if(a>=33088&&a<=40956)a-=33088;else if(a>=57408&&a<=60351)a-=49472;else throw new Error("Invalid SJIS character: "+this.data[t]+`
Make sure your charset is UTF-8`);a=(a>>>8&255)*192+(a&255),e.put(a,13)}};var Pa=ne,Ht={exports:{}};(function(e){var t={single_source_shortest_paths:function(a,n,r){var i={},l={};l[n]=0;var c=t.PriorityQueue.make();c.push(n,0);for(var s,u,d,h,p,v,E,S,q;!c.empty();){s=c.pop(),u=s.value,h=s.cost,p=a[u]||{};for(d in p)p.hasOwnProperty(d)&&(v=p[d],E=h+v,S=l[d],q=typeof l[d]>"u",(q||S>E)&&(l[d]=E,c.push(d,E),i[d]=u))}if(typeof r<"u"&&typeof l[r]>"u"){var w=["Could not find a path from ",n," to ",r,"."].join("");throw new Error(w)}return i},extract_shortest_path_from_predecessor_list:function(a,n){for(var r=[],i=n;i;)r.push(i),a[i],i=a[i];return r.reverse(),r},find_path:function(a,n,r){var i=t.single_source_shortest_paths(a,n,r);return t.extract_shortest_path_from_predecessor_list(i,r)},PriorityQueue:{make:function(a){var n=t.PriorityQueue,r={},i;a=a||{};for(i in n)n.hasOwnProperty(i)&&(r[i]=n[i]);return r.queue=[],r.sorter=a.sorter||n.default_sorter,r},default_sorter:function(a,n){return a.cost-n.cost},push:function(a,n){var r={value:a,cost:n};this.queue.push(r),this.queue.sort(this.sorter)},pop:function(){return this.queue.shift()},empty:function(){return this.queue.length===0}}};e.exports=t})(Ht);var Ua=Ht.exports;(function(e){const t=G,a=Na,n=Da,r=$a,i=Pa,l=z,c=_,s=Ua;function u(w){return unescape(encodeURIComponent(w)).length}function d(w,T,b){const y=[];let B;for(;(B=w.exec(b))!==null;)y.push({data:B[0],index:B.index,mode:T,length:B[0].length});return y}function h(w){const T=d(l.NUMERIC,t.NUMERIC,w),b=d(l.ALPHANUMERIC,t.ALPHANUMERIC,w);let y,B;return c.isKanjiModeEnabled()?(y=d(l.BYTE,t.BYTE,w),B=d(l.KANJI,t.KANJI,w)):(y=d(l.BYTE_KANJI,t.BYTE,w),B=[]),T.concat(b,y,B).sort(function($,U){return $.index-U.index}).map(function($){return{data:$.data,mode:$.mode,length:$.length}})}function p(w,T){switch(T){case t.NUMERIC:return a.getBitsLength(w);case t.ALPHANUMERIC:return n.getBitsLength(w);case t.KANJI:return i.getBitsLength(w);case t.BYTE:return r.getBitsLength(w)}}function v(w){return w.reduce(function(T,b){const y=T.length-1>=0?T[T.length-1]:null;return y&&y.mode===b.mode?(T[T.length-1].data+=b.data,T):(T.push(b),T)},[])}function E(w){const T=[];for(let b=0;b<w.length;b++){const y=w[b];switch(y.mode){case t.NUMERIC:T.push([y,{data:y.data,mode:t.ALPHANUMERIC,length:y.length},{data:y.data,mode:t.BYTE,length:y.length}]);break;case t.ALPHANUMERIC:T.push([y,{data:y.data,mode:t.BYTE,length:y.length}]);break;case t.KANJI:T.push([y,{data:y.data,mode:t.BYTE,length:u(y.data)}]);break;case t.BYTE:T.push([{data:y.data,mode:t.BYTE,length:u(y.data)}])}}return T}function S(w,T){const b={},y={start:{}};let B=["start"];for(let R=0;R<w.length;R++){const $=w[R],U=[];for(let V=0;V<$.length;V++){const I=$[V],P=""+R+V;U.push(P),b[P]={node:I,lastCount:0},y[P]={};for(let j=0;j<B.length;j++){const H=B[j];b[H]&&b[H].node.mode===I.mode?(y[H][P]=p(b[H].lastCount+I.length,I.mode)-p(b[H].lastCount,I.mode),b[H].lastCount+=I.length):(b[H]&&(b[H].lastCount=I.length),y[H][P]=p(I.length,I.mode)+4+t.getCharCountIndicator(I.mode,T))}}B=U}for(let R=0;R<B.length;R++)y[B[R]].end=0;return{map:y,table:b}}function q(w,T){let b;const y=t.getBestModeForData(w);if(b=t.from(T,y),b!==t.BYTE&&b.bit<y.bit)throw new Error('"'+w+'" cannot be encoded with mode '+t.toString(b)+`.
 Suggested mode is: `+t.toString(y));switch(b===t.KANJI&&!c.isKanjiModeEnabled()&&(b=t.BYTE),b){case t.NUMERIC:return new a(w);case t.ALPHANUMERIC:return new n(w);case t.KANJI:return new i(w);case t.BYTE:return new r(w)}}e.fromArray=function(T){return T.reduce(function(b,y){return typeof y=="string"?b.push(q(y,null)):y.data&&b.push(q(y.data,y.mode)),b},[])},e.fromString=function(T,b){const y=h(T,c.isKanjiModeEnabled()),B=E(y),R=S(B,b),$=s.find_path(R.map,"start","end"),U=[];for(let V=1;V<$.length-1;V++)U.push(R.table[$[V]].node);return e.fromArray(v(U))},e.rawSplit=function(T){return e.fromArray(h(T,c.isKanjiModeEnabled()))}})(_t);const Le=_,qe=Te,Oa=ya,_a=Ea,Ha=Rt,Va=Dt,ze=At,je=Ie,xa=Ca,we=Ft,za=Ut,ja=G,Fe=_t;function Ka(e,t){const a=e.size,n=Va.getPositions(t);for(let r=0;r<n.length;r++){const i=n[r][0],l=n[r][1];for(let c=-1;c<=7;c++)if(!(i+c<=-1||a<=i+c))for(let s=-1;s<=7;s++)l+s<=-1||a<=l+s||(c>=0&&c<=6&&(s===0||s===6)||s>=0&&s<=6&&(c===0||c===6)||c>=2&&c<=4&&s>=2&&s<=4?e.set(i+c,l+s,!0,!0):e.set(i+c,l+s,!1,!0))}}function Ja(e){const t=e.size;for(let a=8;a<t-8;a++){const n=a%2===0;e.set(a,6,n,!0),e.set(6,a,n,!0)}}function Ga(e,t){const a=Ha.getPositions(t);for(let n=0;n<a.length;n++){const r=a[n][0],i=a[n][1];for(let l=-2;l<=2;l++)for(let c=-2;c<=2;c++)l===-2||l===2||c===-2||c===2||l===0&&c===0?e.set(r+l,i+c,!0,!0):e.set(r+l,i+c,!1,!0)}}function Qa(e,t){const a=e.size,n=we.getEncodedBits(t);let r,i,l;for(let c=0;c<18;c++)r=Math.floor(c/3),i=c%3+a-8-3,l=(n>>c&1)===1,e.set(r,i,l,!0),e.set(i,r,l,!0)}function Pe(e,t,a){const n=e.size,r=za.getEncodedBits(t,a);let i,l;for(i=0;i<15;i++)l=(r>>i&1)===1,i<6?e.set(i,8,l,!0):i<8?e.set(i+1,8,l,!0):e.set(n-15+i,8,l,!0),i<8?e.set(8,n-i-1,l,!0):i<9?e.set(8,15-i-1+1,l,!0):e.set(8,15-i-1,l,!0);e.set(n-8,8,1,!0)}function Ya(e,t){const a=e.size;let n=-1,r=a-1,i=7,l=0;for(let c=a-1;c>0;c-=2)for(c===6&&c--;;){for(let s=0;s<2;s++)if(!e.isReserved(r,c-s)){let u=!1;l<t.length&&(u=(t[l]>>>i&1)===1),e.set(r,c-s,u),i--,i===-1&&(l++,i=7)}if(r+=n,r<0||a<=r){r-=n,n=-n;break}}}function Wa(e,t,a){const n=new Oa;a.forEach(function(s){n.put(s.mode.bit,4),n.put(s.getLength(),ja.getCharCountIndicator(s.mode,e)),s.write(n)});const r=Le.getSymbolTotalCodewords(e),i=je.getTotalCodewordsCount(e,t),l=(r-i)*8;for(n.getLengthInBits()+4<=l&&n.put(0,4);n.getLengthInBits()%8!==0;)n.putBit(0);const c=(l-n.getLengthInBits())/8;for(let s=0;s<c;s++)n.put(s%2?17:236,8);return Xa(n,e,t)}function Xa(e,t,a){const n=Le.getSymbolTotalCodewords(t),r=je.getTotalCodewordsCount(t,a),i=n-r,l=je.getBlocksCount(t,a),c=n%l,s=l-c,u=Math.floor(n/l),d=Math.floor(i/l),h=d+1,p=u-d,v=new xa(p);let E=0;const S=new Array(l),q=new Array(l);let w=0;const T=new Uint8Array(e.buffer);for(let $=0;$<l;$++){const U=$<s?d:h;S[$]=T.slice(E,E+U),q[$]=v.encode(S[$]),E+=U,w=Math.max(w,U)}const b=new Uint8Array(n);let y=0,B,R;for(B=0;B<w;B++)for(R=0;R<l;R++)B<S[R].length&&(b[y++]=S[R][B]);for(B=0;B<p;B++)for(R=0;R<l;R++)b[y++]=q[R][B];return b}function Za(e,t,a,n){let r;if(Array.isArray(e))r=Fe.fromArray(e);else if(typeof e=="string"){let u=t;if(!u){const d=Fe.rawSplit(e);u=we.getBestVersionForData(d,a)}r=Fe.fromString(e,u||40)}else throw new Error("Invalid data");const i=we.getBestVersionForData(r,a);if(!i)throw new Error("The amount of data is too big to be stored in a QR Code");if(!t)t=i;else if(t<i)throw new Error(`
The chosen QR Code version cannot contain this amount of data.
Minimum version required to store current data is: `+i+`.
`);const l=Wa(t,a,r),c=Le.getSymbolSize(t),s=new _a(c);return Ka(s,t),Ja(s),Ga(s,t),Pe(s,a,0),t>=7&&Qa(s,t),Ya(s,l),isNaN(n)&&(n=ze.getBestMask(s,Pe.bind(null,s,a))),ze.applyMask(n,s),Pe(s,a,n),{modules:s,version:t,errorCorrectionLevel:a,maskPattern:n,segments:r}}Bt.create=function(t,a){if(typeof t>"u"||t==="")throw new Error("No input text");let n=qe.M,r,i;return typeof a<"u"&&(n=qe.from(a.errorCorrectionLevel,qe.M),r=we.from(a.version),i=ze.from(a.maskPattern),a.toSJISFunc&&Le.setToSJISFunction(a.toSJISFunc)),Za(t,r,n,i)};var Vt={},nt={};(function(e){function t(a){if(typeof a=="number"&&(a=a.toString()),typeof a!="string")throw new Error("Color should be defined as hex string");let n=a.slice().replace("#","").split("");if(n.length<3||n.length===5||n.length>8)throw new Error("Invalid hex color: "+a);(n.length===3||n.length===4)&&(n=Array.prototype.concat.apply([],n.map(function(i){return[i,i]}))),n.length===6&&n.push("F","F");const r=parseInt(n.join(""),16);return{r:r>>24&255,g:r>>16&255,b:r>>8&255,a:r&255,hex:"#"+n.slice(0,6).join("")}}e.getOptions=function(n){n||(n={}),n.color||(n.color={});const r=typeof n.margin>"u"||n.margin===null||n.margin<0?4:n.margin,i=n.width&&n.width>=21?n.width:void 0,l=n.scale||4;return{width:i,scale:i?4:l,margin:r,color:{dark:t(n.color.dark||"#000000ff"),light:t(n.color.light||"#ffffffff")},type:n.type,rendererOpts:n.rendererOpts||{}}},e.getScale=function(n,r){return r.width&&r.width>=n+r.margin*2?r.width/(n+r.margin*2):r.scale},e.getImageWidth=function(n,r){const i=e.getScale(n,r);return Math.floor((n+r.margin*2)*i)},e.qrToImageData=function(n,r,i){const l=r.modules.size,c=r.modules.data,s=e.getScale(l,i),u=Math.floor((l+i.margin*2)*s),d=i.margin*s,h=[i.color.light,i.color.dark];for(let p=0;p<u;p++)for(let v=0;v<u;v++){let E=(p*u+v)*4,S=i.color.light;if(p>=d&&v>=d&&p<u-d&&v<u-d){const q=Math.floor((p-d)/s),w=Math.floor((v-d)/s);S=h[c[q*l+w]?1:0]}n[E++]=S.r,n[E++]=S.g,n[E++]=S.b,n[E]=S.a}}})(nt);(function(e){const t=nt;function a(r,i,l){r.clearRect(0,0,i.width,i.height),i.style||(i.style={}),i.height=l,i.width=l,i.style.height=l+"px",i.style.width=l+"px"}function n(){try{return document.createElement("canvas")}catch{throw new Error("You need to specify a canvas element")}}e.render=function(i,l,c){let s=c,u=l;typeof s>"u"&&(!l||!l.getContext)&&(s=l,l=void 0),l||(u=n()),s=t.getOptions(s);const d=t.getImageWidth(i.modules.size,s),h=u.getContext("2d"),p=h.createImageData(d,d);return t.qrToImageData(p.data,i,s),a(h,u,d),h.putImageData(p,0,0),u},e.renderToDataURL=function(i,l,c){let s=c;typeof s>"u"&&(!l||!l.getContext)&&(s=l,l=void 0),s||(s={});const u=e.render(i,l,s),d=s.type||"image/png",h=s.rendererOpts||{};return u.toDataURL(d,h.quality)}})(Vt);var xt={};const en=nt;function Et(e,t){const a=e.a/255,n=t+'="'+e.hex+'"';return a<1?n+" "+t+'-opacity="'+a.toFixed(2).slice(1)+'"':n}function Ue(e,t,a){let n=e+t;return typeof a<"u"&&(n+=" "+a),n}function tn(e,t,a){let n="",r=0,i=!1,l=0;for(let c=0;c<e.length;c++){const s=Math.floor(c%t),u=Math.floor(c/t);!s&&!i&&(i=!0),e[c]?(l++,c>0&&s>0&&e[c-1]||(n+=i?Ue("M",s+a,.5+u+a):Ue("m",r,0),r=0,i=!1),s+1<t&&e[c+1]||(n+=Ue("h",l),l=0)):r++}return n}xt.render=function(t,a,n){const r=en.getOptions(a),i=t.modules.size,l=t.modules.data,c=i+r.margin*2,s=r.color.light.a?"<path "+Et(r.color.light,"fill")+' d="M0 0h'+c+"v"+c+'H0z"/>':"",u="<path "+Et(r.color.dark,"stroke")+' d="'+tn(l,i,r.margin)+'"/>',d='viewBox="0 0 '+c+" "+c+'"',p='<svg xmlns="http://www.w3.org/2000/svg" '+(r.width?'width="'+r.width+'" height="'+r.width+'" ':"")+d+' shape-rendering="crispEdges">'+s+u+`</svg>
`;return typeof n=="function"&&n(null,p),p};const an=ha,Ke=Bt,zt=Vt,nn=xt;function rt(e,t,a,n,r){const i=[].slice.call(arguments,1),l=i.length,c=typeof i[l-1]=="function";if(!c&&!an())throw new Error("Callback required as last argument");if(c){if(l<2)throw new Error("Too few arguments provided");l===2?(r=a,a=t,t=n=void 0):l===3&&(t.getContext&&typeof r>"u"?(r=n,n=void 0):(r=n,n=a,a=t,t=void 0))}else{if(l<1)throw new Error("Too few arguments provided");return l===1?(a=t,t=n=void 0):l===2&&!t.getContext&&(n=a,a=t,t=void 0),new Promise(function(s,u){try{const d=Ke.create(a,n);s(e(d,t,n))}catch(d){u(d)}})}try{const s=Ke.create(a,n);r(null,e(s,t,n))}catch(s){r(s)}}Y.create=Ke.create;Y.toCanvas=rt.bind(null,zt.render);Y.toDataURL=rt.bind(null,zt.renderToDataURL);Y.toString=rt.bind(null,function(e,t,a){return nn.render(e,a)});let Je=null;function rn(e){Je=e}function W(){if(!Je)throw new Error("App bridge is not initialized");return Je}const on=["DEMO-INVITE","URFU-2025","DEMO"];function jt(e){return e.trim().toUpperCase()}function sn(e){const t=jt(e);return t?on.some(a=>a.toUpperCase()===t):!1}const f={view:"leaderboard",selectedUserId:null,selectedTeamId:null,usersSearch:"",teamsSearch:"",usersSort:"rank-asc",teamsSort:"rank-asc",usersFilterOpen:!1,teamsFilterOpen:!1,userProfileTab:"rating",rescueOpen:!1,rescueShowError:!1,rescueDraft:Kt(),usersSearchFocus:!1,teamsSearchFocus:!1};function Kt(){return{topic:"",tag:"",description:"",format:"",dateTime:""}}function Jt(e){f.view="user",f.selectedUserId=e,f.userProfileTab="rating",f.usersFilterOpen=!1,f.teamsFilterOpen=!1}function Gt(e){f.view="team",f.selectedTeamId=e,f.usersFilterOpen=!1,f.teamsFilterOpen=!1}function ln(){f.view="leaderboard",f.selectedUserId=null,f.selectedTeamId=null,f.rescueOpen=!1,f.rescueShowError=!1}function cn(){f.rescueOpen=!0,f.rescueShowError=!1}function Oe(){f.rescueOpen=!1,f.rescueShowError=!1}function k(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function un(){const e=f.rescueDraft;return e.topic.trim().length>0&&e.tag.trim().length>0&&e.description.trim().length>0&&e.format.trim().length>0&&e.dateTime.trim().length>0}function dn(){const e=f.rescueDraft;return`
        <div class="profile-modal team-overlay-modal team-rescue-modal event-create-modal" role="dialog" aria-modal="true" aria-label="Спасение">
            <div class="profile-modal-backdrop team-rescue-backdrop" data-close-rating-rescue="1"></div>
            <div class="profile-modal-card team-rescue-card">
                <button type="button" class="team-rescue-close" id="ratingRescueCloseButton" aria-label="Закрыть"></button>
                <h2 class="team-rescue-title">СПАСЕНИЕ</h2>
                ${f.rescueShowError?'<p class="rescue-validation-error" role="alert">ПОЛЯ НЕ ЗАПОЛНЕНЫ</p>':""}
                <form id="ratingRescueForm" class="team-rescue-form" novalidate>
                    <div class="team-rescue-topic-row">
                        <input
                            id="ratingRescueTopicInput"
                            class="team-rescue-field team-rescue-field--topic"
                            type="text"
                            placeholder="ТЕМА"
                            value="${k(e.topic)}"
                            autocomplete="off"
                        >
                        <input
                            id="ratingRescueTagInput"
                            class="team-rescue-field team-rescue-field--tag"
                            type="text"
                            placeholder="ТЕГ"
                            value="${k(e.tag)}"
                            autocomplete="off"
                        >
                    </div>
                    <textarea
                        id="ratingRescueDescriptionInput"
                        class="team-rescue-textarea"
                        placeholder=" "
                        aria-label="Описание ситуации"
                    >${k(e.description)}</textarea>
                    <div class="team-rescue-duo-row">
                        <input
                            id="ratingRescueFormatInput"
                            class="team-rescue-field team-rescue-field--duo"
                            type="text"
                            placeholder="ФОРМАТ"
                            value="${k(e.format)}"
                            autocomplete="off"
                        >
                        <input
                            id="ratingRescueDateTimeInput"
                            class="team-rescue-field team-rescue-field--duo"
                            type="text"
                            placeholder="ДАТА, ВРЕМЯ"
                            value="${k(e.dateTime)}"
                            autocomplete="off"
                        >
                    </div>
                    <button type="submit" class="team-rescue-submit">ОТПРАВИТЬ</button>
                </form>
            </div>
        </div>`}const it=[{id:"team-alpha",rank:1,name:"КОМАНДА АЛЬФА",points:1240,krk:8.6,members:[{id:"user-ivanov",displayName:"ИВАНОВ И.",roleLabel:"КАПИТАН"},{id:"user-kozlov",displayName:"КОЗЛОВ К.",roleLabel:"УЧАСТНИК"}]},{id:"team-beta",rank:2,name:"КОМАНДА БЕТА",points:1180,krk:8.1,members:[{id:"user-petrov",displayName:"ПЕТРОВ П.",roleLabel:"КАПИТАН"},{id:"user-novikov",displayName:"НОВИКОВ Н.",roleLabel:"УЧАСТНИК"}]},{id:"team-gamma",rank:3,name:"КОМАНДА ГАММА",points:1095,krk:7.8,members:[{id:"user-sidorov",displayName:"СИДОРОВ С.",roleLabel:"КАПИТАН"}]},{id:"team-delta",rank:4,name:"КОМАНДА ДЕЛЬТА",points:980,krk:7.2,members:[{id:"user-morozov",displayName:"МОРОЗОВ М.",roleLabel:"КАПИТАН"}]},{id:"team-epsilon",rank:5,name:"КОМАНДА ЭПСИЛОН",points:910,krk:6.9,members:[]},{id:"team-zeta",rank:6,name:"КОМАНДА ДЗЕТА",points:860,krk:6.5,members:[]},{id:"team-eta",rank:7,name:"КОМАНДА ЭТА",points:820,krk:6.2,members:[]}],ot=[{id:"user-ivanov",rank:1,name:"ИВАНОВ И.",points:420,hasTeam:!0,teamId:"team-alpha",league:"ЗОЛОТО",achievementsCount:12},{id:"user-petrov",rank:2,name:"ПЕТРОВ П.",points:405,hasTeam:!0,teamId:"team-beta",league:"СЕРЕБРО",achievementsCount:9},{id:"user-sidorov",rank:3,name:"СИДОРОВ С.",points:390,hasTeam:!0,teamId:"team-gamma",league:"СЕРЕБРО",achievementsCount:8},{id:"user-kozlov",rank:4,name:"КОЗЛОВ К.",points:360,hasTeam:!0,teamId:"team-alpha",league:"БРОНЗА",achievementsCount:6},{id:"user-novikov",rank:5,name:"НОВИКОВ Н.",points:340,hasTeam:!0,teamId:"team-beta",league:"БРОНЗА",achievementsCount:5},{id:"user-morozov",rank:6,name:"МОРОЗОВ М.",points:325,hasTeam:!0,teamId:"team-delta",league:"БАЗОВАЯ",achievementsCount:4},{id:"user-volkov",rank:7,name:"ВОЛКОВ В.",points:310,hasTeam:!1,teamId:null,league:"БАЗОВАЯ",achievementsCount:3},{id:"user-sokolov",rank:8,name:"СОКОЛОВ С.",points:295,hasTeam:!1,teamId:null,league:"БАЗОВАЯ",achievementsCount:2}];function mn(e){return ot.find(t=>t.id===e)}function fn(e){return it.find(t=>t.id===e)}function pn(e){const t=mn(e);if(!t)return'<p class="rating-profile-missing">Пользователь не найден.</p>';const n=W().isCurrentUserCaptain(),r=!t.hasTeam&&n,i=t.hasTeam&&!!t.teamId,l=f.userProfileTab==="rating",c=f.userProfileTab==="achievements",s=i?`<button type="button" class="rating-profile-action rating-profile-action--team" data-rating-open-team="${k(t.teamId??"")}">КОМАНДА</button>`:r?`<button type="button" class="rating-profile-action rating-profile-action--invite" data-rating-invite-user="${k(t.id)}">ПРИГЛАСИТЬ</button>`:"";return`
        <section class="rating-profile-card rating-profile-card--user" aria-label="Личные данные">
            <button type="button" class="rating-back-btn" data-rating-back>НАЗАД</button>
            <h2 class="rating-profile-title">ЛИЧНЫЕ ДАННЫЕ</h2>
            <p class="rating-profile-name">${k(t.name)}</p>
            <div class="rating-profile-tabs" role="tablist">
                <button
                    type="button"
                    class="rating-profile-tab${l?" is-active":""}"
                    data-rating-user-tab="rating"
                    role="tab"
                    aria-selected="${l}"
                >ЛИЧНЫЙ РЕЙТИНГ</button>
                <button
                    type="button"
                    class="rating-profile-tab${c?" is-active":""}"
                    data-rating-user-tab="achievements"
                    role="tab"
                    aria-selected="${c}"
                >ЛИЧНЫЕ ДОСТИЖЕНИЯ</button>
            </div>
            <div class="rating-profile-tab-panel">
                ${l?`
                <div class="rating-profile-stat-row">
                    <span class="rating-profile-stat-label">МЕСТО</span>
                    <span class="rating-profile-stat-value">${k(String(t.rank))}</span>
                </div>
                <div class="rating-profile-stat-row">
                    <span class="rating-profile-stat-label">БАЛЛЫ</span>
                    <span class="rating-profile-stat-value">${k(String(t.points))}</span>
                </div>
                <div class="rating-profile-stat-row">
                    <span class="rating-profile-stat-label">ЛИГА</span>
                    <span class="rating-profile-stat-value">${k(t.league)}</span>
                </div>`:`
                <div class="rating-achievements-grid">
                    ${Array.from({length:t.achievementsCount},(u,d)=>`
                        <div class="rating-achievement-pill">ДОСТИЖЕНИЕ ${d+1}</div>`).join("")}
                </div>`}
            </div>
            ${s}
        </section>`}function vn(e){e&&(Gt(e),W().render())}function gn(e){const t=fn(e);if(!t)return'<p class="rating-profile-missing">Команда не найдена.</p>';const a=t.members.length?t.members.map(n=>`
            <button type="button" class="rating-team-member-row" data-rating-user-id="${k(n.id)}">
                <span class="rating-team-member-name">${k(n.displayName)}</span>
                <span class="rating-team-member-role">${k(n.roleLabel)}</span>
            </button>`).join(""):'<p class="rating-team-members-empty">Участники пока не добавлены.</p>';return`
        <section class="rating-profile-card rating-profile-card--team" aria-label="Профиль команды">
            <button type="button" class="rating-back-btn" data-rating-back>НАЗАД</button>
            <h2 class="rating-profile-title">${k(t.name)}</h2>
            <div class="rating-team-blocks">
                <div class="rating-team-block rating-team-block--meta">
                    <h3 class="rating-team-block-title">НАЗВАНИЕ, КРК</h3>
                    <div class="rating-team-meta-row">
                        <span class="rating-team-meta-label">КРК</span>
                        <span class="rating-team-meta-value">${k(String(t.krk))}</span>
                    </div>
                    <div class="rating-team-meta-row">
                        <span class="rating-team-meta-label">БАЛЛЫ</span>
                        <span class="rating-team-meta-value">${k(String(t.points))}</span>
                    </div>
                </div>
                <div class="rating-team-block rating-team-block--members">
                    <h3 class="rating-team-block-title">УЧАСТНИКИ</h3>
                    <div class="rating-team-members-list">
                        ${a}
                    </div>
                </div>
                <div class="rating-team-block rating-team-block--history">
                    <h3 class="rating-team-block-title">ИСТОРИЯ АКТИВНОСТИ</h3>
                    <div class="rating-team-history-rows rating-team-history-rows--empty" aria-label="История активности пока пуста"></div>
                </div>
            </div>
            <button
                type="button"
                class="rating-team-photo"
                data-rating-open-rescue="1"
                aria-label="Фото команды — открыть спасение"
            ></button>
            <button type="button" class="rating-team-rescue-pill" data-rating-open-rescue="1">СПАСЕНИЕ</button>
        </section>`}function hn(e){Jt(e)}function bn(){cn(),W().render()}function Qt(e,t){const a=t.trim().toLowerCase();return a?e.filter(n=>String(n.rank).includes(a)||n.label.toLowerCase().includes(a)||String(n.points).includes(a)):e}function Yt(e,t){const a=[...e];switch(t){case"rank-desc":return a.sort((n,r)=>r.rank-n.rank);case"points-desc":return a.sort((n,r)=>r.points-n.points);case"points-asc":return a.sort((n,r)=>n.points-r.points);case"name-asc":return a.sort((n,r)=>n.label.localeCompare(r.label,"ru"));case"rank-asc":default:return a.sort((n,r)=>n.rank-r.rank)}}function yn(e){return`
        <article class="rating-podium-slot ${e===1?"rating-podium-slot--first":e===2?"rating-podium-slot--second":"rating-podium-slot--third"}" aria-label="${e} место">
            <span class="rating-podium-rank">${e}</span>
            <span class="rating-podium-points">БАЛЛЫ</span>
        </article>`}function Wt(e){const t=new Map(e.map(a=>[a.rank,a]));return[2,1,3].map(a=>t.get(a)?yn(a):`
                    <article class="rating-podium-slot rating-podium-slot--empty rating-podium-slot--${a===1?"first":a===2?"second":"third"}" aria-hidden="true">
                        <span class="rating-podium-rank">${a}</span>
                        <span class="rating-podium-points">БАЛЛЫ</span>
                    </article>`).join("")}const En=[{key:"rank-asc",label:"МЕСТО ↑"},{key:"rank-desc",label:"МЕСТО ↓"},{key:"points-desc",label:"БАЛЛЫ ↓"},{key:"points-asc",label:"БАЛЛЫ ↑"},{key:"name-asc",label:"ИМЯ А–Я"}];function Xt(e,t,a){const n=En.map(r=>`
        <button
            type="button"
            class="rating-filter-option${r.key===t?" is-active":""}"
            data-rating-sort="${e}"
            data-rating-sort-key="${r.key}"
        >${r.label}</button>`).join("");return`
        <div class="rating-filter-menu${a?" is-open":""}" data-rating-filter-menu="${e}" ${a?"":"hidden"}>
            ${n}
        </div>`}function Zt(e,t,a){return`
        <button type="button" class="rating-list-row rating-list-row--clickable" role="listitem" ${t}="${k(a)}">
            <span class="rating-list-main">${k(String(e.rank))}</span>
            <span class="rating-list-label">${k(e.label)}</span>
            <span class="rating-list-points">БАЛЛЫ</span>
        </button>`}function wn(){return it.map(e=>({rank:e.rank,label:e.name,points:e.points}))}function Cn(){const e=f.teamsSearch,t=Qt(wn(),e),a=Yt(t,f.teamsSort),n=a.filter(i=>i.rank>=4),r=n.length?n.map(i=>{const l=it.find(c=>c.rank===i.rank);return Zt(i,"data-rating-team-id",(l==null?void 0:l.id)??String(i.rank))}).join(""):'<p class="rating-list-empty">Ничего не найдено</p>';return`
        <section class="rating-panel" aria-label="Рейтинг команд">
            <h3 class="rating-panel-heading">КОМАНДЫ</h3>
            <div class="rating-toolbar">
                <input
                    type="search"
                    class="rating-search-input"
                    id="ratingTeamsSearchInput"
                    placeholder="ПОИСК"
                    value="${k(e)}"
                    autocomplete="off"
                >
                <div class="rating-filter-wrap">
                    <button type="button" class="rating-filter-btn" data-rating-filter-toggle="teams" aria-expanded="${f.teamsFilterOpen}">ФИЛЬТР</button>
                    ${Xt("teams",f.teamsSort,f.teamsFilterOpen)}
                </div>
            </div>
            <div class="rating-panel-body">
                <div class="rating-podium" role="list" aria-label="Тройка лидеров команд">
                    ${Wt(a)}
                </div>
                <div class="rating-list-scroll" role="list" aria-label="Команды с 4 места">
                    ${r}
                </div>
            </div>
        </section>`}function Sn(){return ot.map(e=>({rank:e.rank,label:e.name,points:e.points}))}function Tn(){const e=f.usersSearch,t=Qt(Sn(),e),a=Yt(t,f.usersSort),n=a.filter(i=>i.rank>=4),r=n.length?n.map(i=>{const l=ot.find(c=>c.rank===i.rank);return Zt(i,"data-rating-user-id",(l==null?void 0:l.id)??String(i.rank))}).join(""):'<p class="rating-list-empty">Ничего не найдено</p>';return`
        <section class="rating-panel rating-panel--users" aria-label="Рейтинг пользователей">
            <h3 class="rating-panel-heading">ПОЛЬЗОВАТЕЛИ</h3>
            <div class="rating-toolbar">
                <input
                    type="search"
                    class="rating-search-input"
                    id="ratingUsersSearchInput"
                    placeholder="ПОИСК"
                    value="${k(e)}"
                    autocomplete="off"
                >
                <div class="rating-filter-wrap">
                    <button type="button" class="rating-filter-btn" data-rating-filter-toggle="users" aria-expanded="${f.usersFilterOpen}">ФИЛЬТР</button>
                    ${Xt("users",f.usersSort,f.usersFilterOpen)}
                </div>
            </div>
            <div class="rating-panel-body">
                <div class="rating-podium" role="list" aria-label="Тройка лидеров пользователей">
                    ${Wt(a)}
                </div>
                <div class="rating-list-scroll" role="list" aria-label="Пользователи с 4 места">
                    ${r}
                </div>
            </div>
        </section>`}function F(e){return e instanceof HTMLInputElement}function O(e){return e instanceof HTMLButtonElement}function Ge(e){return e instanceof HTMLFormElement}function Me(e){return e instanceof HTMLTextAreaElement}function In(){return f.view==="user"&&f.selectedUserId?pn(f.selectedUserId):f.view==="team"&&f.selectedTeamId?gn(f.selectedTeamId):`
        <div class="rating-panels-stack">
            ${Cn()}
            ${Tn()}
        </div>`}function kn(e){return`
        <section class="profile-main rating-dashboard-main rating-page">
            ${e}
            ${In()}
        </section>`}function Ln(){return f.rescueOpen?dn():""}function Mn(e){const t=e.querySelector("#ratingRescueTopicInput"),a=e.querySelector("#ratingRescueTagInput"),n=e.querySelector("#ratingRescueDescriptionInput"),r=e.querySelector("#ratingRescueFormatInput"),i=e.querySelector("#ratingRescueDateTimeInput");F(t)&&(f.rescueDraft.topic=t.value),F(a)&&(f.rescueDraft.tag=a.value),Me(n)&&(f.rescueDraft.description=n.value),F(r)&&(f.rescueDraft.format=r.value),F(i)&&(f.rescueDraft.dateTime=i.value)}function Bn(e){if(f.usersSearchFocus){f.usersSearchFocus=!1;const t=e.querySelector("#ratingUsersSearchInput");if(F(t)){const a=t.value.length;t.focus(),t.setSelectionRange(a,a)}return}if(f.teamsSearchFocus){f.teamsSearchFocus=!1;const t=e.querySelector("#ratingTeamsSearchInput");if(F(t)){const a=t.value.length;t.focus(),t.setSelectionRange(a,a)}}}function Nn(e){const t=W(),a=e.querySelector("#ratingUsersSearchInput");F(a)&&a.addEventListener("input",()=>{f.usersSearch=a.value,f.usersSearchFocus=!0,t.render()});const n=e.querySelector("#ratingTeamsSearchInput");F(n)&&n.addEventListener("input",()=>{f.teamsSearch=n.value,f.teamsSearchFocus=!0,t.render()}),e.querySelectorAll("[data-rating-filter-toggle]").forEach(s=>{s.addEventListener("click",u=>{u.stopPropagation();const d=s.dataset.ratingFilterToggle;d==="users"?(f.usersFilterOpen=!f.usersFilterOpen,f.teamsFilterOpen=!1):d==="teams"&&(f.teamsFilterOpen=!f.teamsFilterOpen,f.usersFilterOpen=!1),t.render()})}),e.querySelectorAll("[data-rating-sort-key]").forEach(s=>{s.addEventListener("click",()=>{const u=s.dataset.ratingSort,d=s.dataset.ratingSortKey;d&&(u==="users"?(f.usersSort=d,f.usersFilterOpen=!1):u==="teams"&&(f.teamsSort=d,f.teamsFilterOpen=!1),t.render())})}),f.view==="leaderboard"&&(e.querySelectorAll("[data-rating-user-id]").forEach(s=>{s.addEventListener("click",()=>{const u=s.dataset.ratingUserId;u&&(Jt(u),t.render())})}),e.querySelectorAll("[data-rating-team-id]").forEach(s=>{s.addEventListener("click",()=>{const u=s.dataset.ratingTeamId;u&&(Gt(u),t.render())})}));const r=e.querySelector("[data-rating-back]");if(O(r)&&r.addEventListener("click",()=>{ln(),t.render()}),e.querySelectorAll("[data-rating-user-tab]").forEach(s=>{s.addEventListener("click",()=>{const u=s.dataset.ratingUserTab;(u==="rating"||u==="achievements")&&(f.userProfileTab=u,t.render())})}),e.querySelectorAll("[data-rating-invite-user]").forEach(s=>{s.addEventListener("click",()=>{t.setStatus("Приглашение отправлено (демо)."),t.render()})}),e.querySelectorAll("[data-rating-open-team]").forEach(s=>{s.addEventListener("click",()=>{const u=s.dataset.ratingOpenTeam??"";vn(u)})}),f.view==="team"&&e.querySelectorAll(".rating-team-member-row[data-rating-user-id]").forEach(s=>{s.addEventListener("click",()=>{const u=s.dataset.ratingUserId;u&&(hn(u),t.render())})}),e.querySelectorAll("[data-rating-open-rescue]").forEach(s=>{s.addEventListener("click",()=>{bn()})}),Bn(e),!f.rescueOpen)return;const i=e.querySelector("#ratingRescueCloseButton");O(i)&&i.addEventListener("click",()=>{Oe(),t.render()}),e.querySelectorAll("[data-close-rating-rescue]").forEach(s=>{s.addEventListener("click",()=>{Oe(),t.render()})});const l=e.querySelector("#ratingRescueForm"),c=(s,u)=>{const d=e.querySelector(s);F(d)?d.addEventListener("input",()=>{f.rescueDraft[u]=d.value,f.rescueShowError=!1}):Me(d)&&d.addEventListener("input",()=>{f.rescueDraft[u]=d.value,f.rescueShowError=!1})};c("#ratingRescueTopicInput","topic"),c("#ratingRescueTagInput","tag"),c("#ratingRescueDescriptionInput","description"),c("#ratingRescueFormatInput","format"),c("#ratingRescueDateTimeInput","dateTime"),Ge(l)&&l.addEventListener("submit",s=>{if(s.preventDefault(),Mn(e),!un()){f.rescueShowError=!0,t.render();return}f.rescueShowError=!1,f.rescueDraft=Kt(),Oe(),t.setStatus("Спасение: запрос помощи отправлен (демо)."),t.render()})}function ea(){return{topic:"",tag:"",description:"",format:"",dateTime:""}}function Rn(){return{name:"",direction:""}}const g={noTeamView:"landing",inviteCodeInput:"",inviteCodeError:"",createTeamDraft:Rn(),eventModal:"none",eventDraft:ea(),eventShareLink:"",eventShowValidationError:!1};function Dn(){g.eventModal="create",g.eventShowValidationError=!1}function An(e){g.eventModal="success",g.eventShareLink=e,g.eventShowValidationError=!1}function ie(){g.eventModal="none",g.eventShowValidationError=!1}function wt(){g.eventDraft=ea()}function $n(e){return e.topic.trim().length>0&&e.tag.trim().length>0&&e.description.trim().length>0&&e.format.trim().length>0&&e.dateTime.trim().length>0}function qn(){const e=g.eventDraft;return`
        <div class="profile-modal team-overlay-modal team-rescue-modal event-create-modal team-page-event-modal" role="dialog" aria-modal="true" aria-label="Создание события">
            <div class="profile-modal-backdrop team-rescue-backdrop" data-close-team-event-modal="1"></div>
            <div class="profile-modal-card team-rescue-card">
                <button type="button" class="team-rescue-close" id="teamEventCloseCreateButton" aria-label="Закрыть"></button>
                <h2 class="team-rescue-title">СОБЫТИЕ</h2>
                ${g.eventShowValidationError?'<p class="team-validation-error team-validation-error--modal" role="alert">ЗАПОЛНИТЕ ВСЕ ПОЛЯ</p>':""}
                <form id="teamEventCreateForm" class="team-rescue-form" novalidate>
                    <div class="team-rescue-topic-row">
                        <input
                            id="teamEventCreateTopicInput"
                            class="team-rescue-field team-rescue-field--topic"
                            type="text"
                            placeholder="ТЕМА"
                            value="${k(e.topic)}"
                            autocomplete="off"
                        >
                        <input
                            id="teamEventCreateTagInput"
                            class="team-rescue-field team-rescue-field--tag"
                            type="text"
                            placeholder="ТЕГ"
                            value="${k(e.tag)}"
                            autocomplete="off"
                        >
                    </div>
                    <textarea
                        id="teamEventCreateDescriptionInput"
                        class="team-rescue-textarea"
                        placeholder=" "
                        aria-label="Описание события"
                    >${k(e.description)}</textarea>
                    <div class="team-rescue-duo-row">
                        <input
                            id="teamEventCreateFormatInput"
                            class="team-rescue-field team-rescue-field--duo"
                            type="text"
                            placeholder="ФОРМАТ"
                            value="${k(e.format)}"
                            autocomplete="off"
                        >
                        <input
                            id="teamEventCreateDateTimeInput"
                            class="team-rescue-field team-rescue-field--duo"
                            type="text"
                            placeholder="ДАТА, ВРЕМЯ"
                            value="${k(e.dateTime)}"
                            autocomplete="off"
                        >
                    </div>
                    <button type="submit" class="team-rescue-submit">СОЗДАТЬ</button>
                </form>
            </div>
        </div>`}function Fn(){return`
        <div class="profile-modal team-overlay-modal event-success-modal team-page-event-modal" role="dialog" aria-modal="true" aria-label="Событие создано">
            <div class="profile-modal-backdrop team-rescue-backdrop" data-close-team-event-modal="1"></div>
            <div class="profile-modal-card event-success-card">
                <button type="button" class="team-rescue-close" id="teamEventCloseSuccessButton" aria-label="Закрыть"></button>
                <h2 class="profile-modal-title event-success-title">УСПЕШНО!</h2>
                <div class="event-success-link-row">
                    <div class="event-success-link-field">ССЫЛКА</div>
                    <button type="button" class="event-success-link-copy" id="teamEventCopyLinkButton">СКОПИРОВАТЬ</button>
                </div>
                <div class="event-success-qr-wrap">
                    <img id="teamEventSuccessQrImg" class="event-success-qr" width="200" height="200" alt="">
                </div>
                <button type="button" class="event-success-done" id="teamEventSuccessDoneButton">ГОТОВО</button>
            </div>
        </div>`}function Pn(){const e=W(),t=e.getTeamTitle(),a=e.getTeamSubtitle(),n=e.getTeamMembers(),i=e.isCurrentUserCaptain()?'<button type="button" class="team-top-pill team-top-pill-plus" id="teamOpenRequestsHeaderButton" aria-label="Заявки">+</button>':"",l=n.length?n.map((c,s)=>`
            <div class="team-member-card">
                <div class="team-member-avatar" aria-hidden="true">${c.avatarUrl?`<img src="${k(c.avatarUrl)}" alt="" loading="lazy">`:""}</div>
                <div class="team-member-name">${k(c.displayName)}</div>
                <div class="team-member-role">${k(c.roleLabel)}</div>
                <button type="button" class="team-member-action" data-team-card-action="vote" data-member-index="${s}">ГОЛОСОВАТЬ</button>
            </div>`).join(""):'<p class="team-members-empty">Участники появятся здесь после приглашения в команду.</p>';return`
        <div class="team-active-wrap">
            <header class="team-top-bar">
                <div class="team-top-headings">
                    <span class="team-top-title">${k(t)}</span>
                    ${a?`<span class="team-top-subtitle">${k(a)}</span>`:""}
                </div>
                <span class="team-top-dot" aria-hidden="true"></span>
                <button type="button" class="team-top-pill" id="teamKrkButton">КРК</button>
                ${i}
            </header>

            <div class="team-active-blocks">
                <div class="team-panel team-info-panel">
                    <h3 class="team-block-title">НАЗВАНИЕ, КРК</h3>
                    <div class="team-info-row">
                        <span class="team-info-label">КОМАНДА</span>
                        <span class="team-info-value">${k(t)}</span>
                    </div>
                    <div class="team-info-row">
                        <span class="team-info-label">КРК</span>
                        <span class="team-info-value">—</span>
                    </div>
                </div>

                <div class="team-panel team-members-panel">
                    <h3 class="team-block-title">УЧАСТНИКИ</h3>
                    <div class="team-members-grid">
                        ${l}
                    </div>
                </div>

                <div class="team-panel team-history-panel">
                    <div class="team-history-head">
                        <h3 class="team-block-title">ИСТОРИЯ АКТИВНОСТИ</h3>
                        <button type="button" class="team-top-pill team-check-in-pill" id="teamCheckInButton">CHECK-IN</button>
                    </div>
                    <div class="team-history-rows team-history-rows--empty" aria-label="История активности пока пуста"></div>
                </div>
            </div>

            <div class="team-rescue-bar">
                <button type="button" class="team-rescue-pill" id="teamRescueButton">СПАСЕНИЕ</button>
            </div>

            <button type="button" class="team-fab-create" id="teamOpenCreateEventButton" aria-label="Создать событие">+</button>
        </div>`}function Un(){if(g.noTeamView==="create-form"){const t=g.createTeamDraft;return`
            <section class="team-no-team-block team-no-team-block--create" aria-label="Создание команды">
                <h2 class="team-no-team-title">СОЗДАНИЕ КОМАНДЫ</h2>
                <input
                    id="teamCreateNameInput"
                    class="team-no-team-input"
                    type="text"
                    placeholder="НАЗВАНИЕ"
                    value="${k(t.name)}"
                    autocomplete="off"
                >
                <input
                    id="teamCreateDirectionInput"
                    class="team-no-team-input"
                    type="text"
                    placeholder="НАПРАВЛЕНИЕ"
                    value="${k(t.direction)}"
                    autocomplete="off"
                >
                <div class="team-no-team-actions">
                    <button type="button" class="team-no-team-btn team-no-team-btn--primary" id="teamConfirmCreateButton">СОЗДАТЬ КОМАНДУ</button>
                    <button type="button" class="team-no-team-btn team-no-team-btn--ghost" data-team-no-team-back>НАЗАД</button>
                </div>
            </section>`}return`
        <section class="team-no-team-block" aria-label="Нет команды">
            <h2 class="team-no-team-title">НЕТ КОМАНДЫ</h2>
            <p class="team-no-team-hint">СОЗДАЙТЕ КОМАНДУ ИЛИ ВСТУПИТЕ ПО КОДУ ПРИГЛАШЕНИЯ</p>
            ${g.inviteCodeError?`<p class="team-validation-error" role="alert">${k(g.inviteCodeError)}</p>`:""}
            <button type="button" class="team-no-team-btn team-no-team-btn--primary" id="teamOpenCreateFormButton">СОЗДАТЬ КОМАНДУ</button>
            <form id="teamJoinByCodeForm" class="team-join-form" novalidate>
                <input
                    id="teamInviteCodeInput"
                    class="team-no-team-input"
                    type="text"
                    placeholder="ВВЕСТИ КОД ПРИГЛАШЕНИЯ"
                    value="${k(g.inviteCodeInput)}"
                    autocomplete="off"
                >
                <button type="submit" class="team-no-team-btn team-no-team-btn--secondary">ВСТУПИТЬ</button>
            </form>
        </section>`}function Qe(){const e=g.eventDraft,t=encodeURIComponent((e.topic.trim()||"sobytie").replace(/\s+/g,"-").toLowerCase());return`${window.location.origin}/events/${t}`}function On(e){const a=W().hasTeamAccess()?Pn():Un();return`
        <section class="profile-main team-dashboard-main team-page">
            ${e}
            ${a}
        </section>`}function _n(){return g.eventModal==="create"?qn():g.eventModal==="success"?Fn():""}async function Hn(e){const t=e.querySelector("#teamEventSuccessQrImg");if(!(t instanceof HTMLImageElement))return;const a=g.eventShareLink.trim()||Qe();try{t.src=await Y.toDataURL(a,{width:200,margin:2,color:{dark:"#2a2a2a",light:"#ffffff"}}),t.alt="QR-код ссылки на событие"}catch{t.removeAttribute("src"),t.alt="Не удалось сформировать QR"}}function _e(e){const t=e.querySelector("#teamEventCreateTopicInput"),a=e.querySelector("#teamEventCreateTagInput"),n=e.querySelector("#teamEventCreateDescriptionInput"),r=e.querySelector("#teamEventCreateFormatInput"),i=e.querySelector("#teamEventCreateDateTimeInput");F(t)&&(g.eventDraft.topic=t.value),F(a)&&(g.eventDraft.tag=a.value),Me(n)&&(g.eventDraft.description=n.value),F(r)&&(g.eventDraft.format=r.value),F(i)&&(g.eventDraft.dateTime=i.value)}function Vn(e){const t=W();if(!t.hasTeamAccess()){const c=e.querySelector("#teamOpenCreateFormButton");O(c)&&c.addEventListener("click",()=>{g.noTeamView="create-form",g.inviteCodeError="",t.render()}),e.querySelectorAll("[data-team-no-team-back]").forEach(v=>{v.addEventListener("click",()=>{g.noTeamView="landing",t.render()})});const s=e.querySelector("#teamCreateNameInput");F(s)&&s.addEventListener("input",()=>{g.createTeamDraft.name=s.value});const u=e.querySelector("#teamCreateDirectionInput");F(u)&&u.addEventListener("input",()=>{g.createTeamDraft.direction=u.value});const d=e.querySelector("#teamConfirmCreateButton");O(d)&&d.addEventListener("click",()=>{const v=g.createTeamDraft.name.trim()||"КОМАНДА",E=g.createTeamDraft.direction.trim();t.createTeam(v,E),g.noTeamView="landing",g.createTeamDraft={name:"",direction:""},t.setStatus("Команда создана (демо)."),t.render()});const h=e.querySelector("#teamInviteCodeInput");F(h)&&h.addEventListener("input",()=>{g.inviteCodeInput=h.value,g.inviteCodeError=""});const p=e.querySelector("#teamJoinByCodeForm");Ge(p)&&p.addEventListener("submit",v=>{v.preventDefault(),F(h)&&(g.inviteCodeInput=h.value);const E=t.joinTeamByInviteCode(g.inviteCodeInput);if(!E.ok){g.inviteCodeError=E.errorMessage,t.render();return}g.inviteCodeInput="",g.inviteCodeError="",t.setStatus("Вы вступили в команду (демо)."),t.render()});return}const a=e.querySelector("#teamOpenCreateEventButton");O(a)&&a.addEventListener("click",()=>{Dn(),t.render()});const n=e.querySelector("#teamKrkButton");O(n)&&n.addEventListener("click",()=>{t.navigateToRating()});const r=e.querySelector("#teamCheckInButton");O(r)&&r.addEventListener("click",()=>{t.setStatus("Check-in зарегистрирован (демо)."),t.render()});const i=e.querySelector("#teamRescueButton");O(i)&&i.addEventListener("click",()=>{t.openTeamRescue()});const l=e.querySelector("#teamOpenRequestsHeaderButton");if(O(l)&&l.addEventListener("click",()=>{t.openTeamOverlayModal("requests")}),e.querySelectorAll("[data-team-card-action]").forEach(c=>{c.addEventListener("click",()=>{const s=Number(c.dataset.memberIndex??"0");t.openTeamOverlayModal("vote",s)})}),g.eventModal!=="none"){if(e.querySelectorAll("[data-close-team-event-modal]").forEach(c=>{c.addEventListener("click",()=>{g.eventModal==="create"&&_e(e),ie(),t.render()})}),g.eventModal==="create"){const c=e.querySelector("#teamEventCloseCreateButton");O(c)&&c.addEventListener("click",()=>{_e(e),ie(),t.render()});const s=(d,h)=>{const p=e.querySelector(d);F(p)?p.addEventListener("input",()=>{g.eventDraft[h]=p.value,g.eventShowValidationError=!1}):Me(p)&&p.addEventListener("input",()=>{g.eventDraft[h]=p.value,g.eventShowValidationError=!1})};s("#teamEventCreateTopicInput","topic"),s("#teamEventCreateTagInput","tag"),s("#teamEventCreateDescriptionInput","description"),s("#teamEventCreateFormatInput","format"),s("#teamEventCreateDateTimeInput","dateTime");const u=e.querySelector("#teamEventCreateForm");Ge(u)&&u.addEventListener("submit",d=>{if(d.preventDefault(),_e(e),!$n(g.eventDraft)){g.eventShowValidationError=!0,t.render();return}const h=Qe();An(h),t.render()});return}if(g.eventModal==="success"){const c=e.querySelector("#teamEventCopyLinkButton");O(c)&&c.addEventListener("click",async()=>{const d=g.eventShareLink||Qe();try{await navigator.clipboard.writeText(d),t.setStatus("Ссылка на событие скопирована.")}catch{t.setStatus("Не удалось скопировать ссылку.","error")}t.render()});const s=e.querySelector("#teamEventCloseSuccessButton");O(s)&&s.addEventListener("click",()=>{wt(),ie(),t.setStatus("Событие создано (демо)."),t.render()});const u=e.querySelector("#teamEventSuccessDoneButton");O(u)&&u.addEventListener("click",()=>{wt(),ie(),t.setStatus("Событие создано (демо)."),t.render()})}}}const xn="team-exam:open-rescue";function ta(e){return{id:e.id,userName:e.userName,email:e.email,role:e.role,firstName:e.firstName,lastName:e.lastName,middleName:e.middleName,nickname:e.nickname,bio:e.bio,avatarUrl:e.avatarUrl,contactEmail:e.contactEmail,telegramHandle:e.telegramHandle,phoneNumber:e.phoneNumber,studentTicketNumber:e.studentTicketNumber,groupId:e.groupId,groupTitle:e.groupTitle,teamId:e.teamId,teamName:e.teamName,teamInviteCode:e.teamInviteCode,isCaptain:e.isCaptain,teamScore:e.teamScore}}const st="team-exam-auth",zn="team-exam-local-team:",jn="team-exam-profile:";function Kn(){{const e="";return e.length===0?"":e.replace(/\/$/,"")}}const Jn=Kn();let X;const o={view:"home",signIn:{email:"",password:""},signUp:{email:"",password:"",passwordConfirm:""},profile:null,profileEdits:null,profileModal:"none",profileAchievementTitle:"",profileCreateTeamName:"",profileCreateTeamDirection:"",profileInviteLink:"",profileFormDraft:null,dashboardSection:"profile",teamModal:"none",teamRescueDraft:null,eventsCalendarScope:"all",eventsFeedTab:"activity",eventsWeekOffset:0,eventsModal:"none",eventsCreateDraft:null,eventsShareLink:"",teamVoteMemberIndex:0,teamRequestsInviteLink:"",localCreatedTeam:null,statusMessage:"",statusTone:"default",isSubmitting:!1},Ct=document.getElementById("homeScreen"),ve=document.getElementById("appScreen"),He=document.getElementById("profileShell"),m=document.getElementById("profileMount"),Ce=document.getElementById("authLayout"),Ye=document.getElementById("authModalCard"),he=document.getElementById("authSwitchColumn"),be=document.getElementById("formContent");Wn();function D(e){return e instanceof HTMLElement}function A(e){return e instanceof HTMLInputElement}function N(e){return e instanceof HTMLButtonElement}function Se(e){return e instanceof HTMLFormElement}function St(e,t){const a=document.querySelector(e);if(!t(a))throw new Error(`Required element not found: ${e}`);return a}function se(e){return A(e)?e.value:""}function lt(e){o.view=e,C()}function L(e,t="default"){o.statusMessage=e,o.statusTone=t}function x(){o.statusMessage="",o.statusTone="default"}function aa(){return{topic:"",tag:"",description:"",league:"",deadline:"",photoFileName:""}}function Be(){return o.teamRescueDraft||(o.teamRescueDraft=aa()),o.teamRescueDraft}function Tt(){o.view==="account"&&(o.dashboardSection="team",da("rescue"))}function Gn(){return pt().map(e=>({id:e.id,displayName:e.displayName,roleLabel:e.roleLabel,avatarUrl:e.avatarUrl}))}function Qn(e){if(!sn(e))return{ok:!1,errorMessage:"НЕВЕРНЫЙ КОД ПРИГЛАШЕНИЯ"};const t=jt(e),a=me(),n=a?[a]:[];return o.localCreatedTeam={name:"КОМАНДА ДЕМО",inviteCode:t,direction:"ВСТУПЛЕНИЕ ПО КОДУ",members:n},Z(),o.profile&&(o.profile={...o.profile,teamName:o.localCreatedTeam.name,teamInviteCode:o.localCreatedTeam.inviteCode}),{ok:!0,errorMessage:""}}function Yn(e,t){var c,s;const a=e.trim()||"КОМАНДА",n=((s=(c=o.profile)==null?void 0:c.teamInviteCode)==null?void 0:s.trim())||`local-${Date.now().toString(36)}`,r=`${window.location.origin}/team/${encodeURIComponent(a)}?invite=${encodeURIComponent(n)}`;o.profileInviteLink=r;const i=me(),l=i?[i]:[];o.localCreatedTeam={name:a,inviteCode:n,direction:t.trim(),members:l},Z(),o.profile&&(o.profile={...o.profile,teamName:o.localCreatedTeam.name,teamInviteCode:o.localCreatedTeam.inviteCode})}async function Wn(){rn({render:C,setStatus:L,clearStatus:x,isCurrentUserCaptain:Mr,hasTeamAccess:ar,getTeamTitle:()=>dt()||"НАЗВАНИЕ",getTeamSubtitle:()=>{var t,a;return((a=(t=o.localCreatedTeam)==null?void 0:t.direction)==null?void 0:a.trim())??""},getTeamMembers:Gn,joinTeamByInviteCode:Qn,createTeam:Yn,openTeamOverlayModal:(t,a)=>da(t,a),openTeamRescue:Tt,navigateToRating:()=>{o.dashboardSection="rating",le(),x(),C()}}),document.addEventListener(xn,()=>{Tt()});const e=vt();if(C(),!!e){o.isSubmitting=!0,o.view="sign-in",L("Восстанавливаем сессию..."),C();try{o.profile=await De(e.token),re(),o.view="account",L("Сессия восстановлена.")}catch(t){pa(),L(Ae(t),"error"),o.view="sign-in"}finally{o.isSubmitting=!1,C()}}}function C(){if(!D(Ct)||!D(ve)||!D(Ce)||!D(Ye)||!D(he)||!D(be))return;const e=o.view==="home",t=o.view==="account";Ct.classList.add("screen-active"),ve.classList.toggle("screen-active",!e),ve.classList.toggle("is-account",t),ve.setAttribute("aria-hidden",String(e)),document.body.classList.toggle("modal-open",!e&&!t),D(He)&&D(m)&&(He.classList.toggle("hidden",!t),He.setAttribute("aria-hidden",String(!t)),Ce.classList.toggle("hidden",t)),e||(t?Ur():Xn())}function Xn(){if(!(!D(Ce)||!D(Ye)||!D(he)||!D(be))){if(Ye.classList.toggle("mode-sign-up",o.view==="sign-up"),o.view==="sign-in"){he.innerHTML=`
            <button type="button" class="auth-switch-pill" data-view="sign-up">РЕГИСТРАЦИЯ</button>
        `,be.innerHTML=`
            <form id="signInForm" class="auth-form auth-form-modal">
                <h1 class="auth-modal-heading">ВХОД</h1>
                ${Mt()}
                <input class="auth-modal-field" name="email" type="email" placeholder="ЭЛЕКТРОННАЯ ПОЧТА" value="${M(o.signIn.email)}" required>
                <div class="auth-login-password-row">
                    <input class="auth-modal-field auth-modal-field-password" name="password" type="password" placeholder="ПАРОЛЬ" value="${M(o.signIn.password)}" required>
                    <button class="auth-inline-pill" type="button" id="signInRestoreButton">ВОССТАНОВИТЬ</button>
                </div>
                <button class="auth-submit-pill" type="submit" ${o.isSubmitting?"disabled":""}>
                    ${o.isSubmitting?"ПОДКЛЮЧЕНИЕ...":"ПРИСОЕДИНИТЬСЯ"}
                </button>
            </form>
        `;const e=St("#signInForm",Se),t=e.querySelector("#signInRestoreButton");N(t)&&t.addEventListener("click",()=>{L("Восстановление пароля скоро будет доступно."),ye()});const a=e.elements.namedItem("password");A(a)&&a.addEventListener("input",()=>{o.signIn.password=a.value});const n=e.elements.namedItem("email");A(n)&&n.addEventListener("input",()=>{o.signIn.email=n.value}),e.addEventListener("submit",r=>{r.preventDefault(),_r(e)})}o.view==="sign-up"&&(he.innerHTML=`
            <button type="button" class="auth-switch-pill" data-view="sign-in">ВХОД</button>
        `,be.innerHTML=`
            <form id="signUpForm" class="auth-form auth-form-modal">
                <h1 class="auth-modal-heading">РЕГИСТРАЦИЯ</h1>
                ${Mt()}
                <input class="auth-modal-field" name="email" type="email" placeholder="ЭЛЕКТРОННАЯ ПОЧТА" value="${M(o.signUp.email)}" required>
                <input class="auth-modal-field" name="password" type="password" placeholder="ПАРОЛЬ" value="${M(o.signUp.password)}" required minlength="6">
                <input class="auth-modal-field" name="passwordConfirm" type="password" placeholder="ПОДТВЕРЖДЕНИЕ ПАРОЛЯ" value="${M(o.signUp.passwordConfirm)}" required minlength="6">
                <button class="auth-submit-pill" type="submit" ${o.isSubmitting?"disabled":""}>
                    ${o.isSubmitting?"СОЗДАНИЕ...":"ПРИСОЕДИНИТЬСЯ"}
                </button>
            </form>
        `,Zn(St("#signUpForm",Se))),Ce.querySelectorAll("[data-view]").forEach(e=>{e.addEventListener("click",()=>{const t=e.dataset.view;t&&(x(),lt(t))})})}}function Zn(e){const t=e.elements.namedItem("email"),a=e.elements.namedItem("password"),n=e.elements.namedItem("passwordConfirm");!A(t)||!A(a)||!A(n)||(t.addEventListener("input",()=>{o.signUp.email=t.value}),a.addEventListener("input",()=>{o.signUp.password=a.value}),n.addEventListener("input",()=>{o.signUp.passwordConfirm=n.value}),e.addEventListener("submit",r=>{r.preventDefault(),Hr(e)}))}function na(e){return e&&([e.firstName,e.lastName].filter(Boolean).join(" ").trim()||e.nickname||e.userName)||""}function ct(){var t,a;return((a=(t=o.profileEdits)==null?void 0:t.fullName)==null?void 0:a.trim())?o.profileEdits.fullName:na(o.profile)}function ra(){var e,t;return((e=o.profileEdits)==null?void 0:e.group)??((t=o.profile)==null?void 0:t.groupTitle)??""}function ut(){var e,t;return((e=o.profileEdits)==null?void 0:e.avatarDataUrl)??((t=o.profile)==null?void 0:t.avatarUrl)??""}function er(){o.profileEdits=null,o.profileModal="none",o.profileAchievementTitle="",o.profileCreateTeamName="",o.profileCreateTeamDirection="",o.profileInviteLink="",o.profileFormDraft=null,o.dashboardSection="profile",o.teamModal="none",o.teamVoteMemberIndex=0,o.teamRequestsInviteLink="",o.localCreatedTeam=null}function tr(){return`
        <div class="team-history-row" aria-hidden="true"></div>
        <div class="team-history-row">
            <span class="team-history-points-pill">БАЛЛЫ</span>
        </div>
        <div class="team-history-row" aria-hidden="true"></div>
        <div class="team-history-row team-history-row--points-leading">
            <span class="team-history-points-pill">БАЛЛЫ</span>
        </div>`}function ar(){var e;return!!((e=o.profile)!=null&&e.teamId)||!!o.localCreatedTeam}function dt(){var e,t,a;return((t=(e=o.profile)==null?void 0:e.teamName)==null?void 0:t.trim())||((a=o.localCreatedTeam)==null?void 0:a.name)||""}function de(){var a,n,r;const e=dt().trim()||"КОМАНДА",t=((n=(a=o.profile)==null?void 0:a.teamInviteCode)==null?void 0:n.trim())||((r=o.localCreatedTeam)==null?void 0:r.inviteCode)||"DEMO-INVITE";return`${window.location.origin}/team/${encodeURIComponent(e)}?invite=${encodeURIComponent(t)}`}function We(e){return`${zn}${e}`}function ia(e){return`${jn}${e}`}function oa(e){const t=localStorage.getItem(ia(e));if(!t)return{};try{return JSON.parse(t)}catch{return{}}}function sa(e,t){const a=oa(e);localStorage.setItem(ia(e),JSON.stringify({...a,...t}))}function nr(){const e=o.profile,t=o.profileEdits;!e||!t||sa(e.id,{fullName:t.fullName,group:t.group,avatarDataUrl:t.avatarDataUrl,dashboardSection:o.dashboardSection})}function le(){const e=o.profile;e&&sa(e.id,{dashboardSection:o.dashboardSection})}function rr(){const e=o.profile;if(!e)return;const t=oa(e.id);typeof t.fullName=="string"&&typeof t.group=="string"&&(o.profileEdits={fullName:t.fullName,group:t.group,avatarDataUrl:t.avatarDataUrl??null}),(t.dashboardSection==="profile"||t.dashboardSection==="team"||t.dashboardSection==="rating"||t.dashboardSection==="events")&&(o.dashboardSection=t.dashboardSection)}const la=["ПН","ВТ","СР","ЧТ","ПТ"],ir=["ЯНВАРЬ","ФЕВРАЛЬ","МАРТ","АПРЕЛЬ","МАЙ","ИЮНЬ","ИЮЛЬ","АВГУСТ","СЕНТЯБРЬ","ОКТЯБРЬ","НОЯБРЬ","ДЕКАБРЬ"],or=new Date(2026,3,20),sr=[[{id:"ev-mon-1",isMine:!0}],[{id:"ev-tue-1",isMine:!1}],[{id:"ev-wed-1",isMine:!0},{id:"ev-wed-2",isMine:!0}],[{id:"ev-thu-1",isMine:!1},{id:"ev-thu-2",isMine:!0}],[]],Xe=[[],[],[],[],[]],lr=[{id:"act-1",hasPoints:!0},{id:"act-2",hasPoints:!1},{id:"act-3",hasPoints:!0}],cr=[{id:"news-1",title:"ТЕМА",lineCount:4},{id:"news-2",title:"ТЕМА",lineCount:3}];function ca(){const e=new Date(or);return e.setDate(e.getDate()+o.eventsWeekOffset*7),e}function ur(e){return`${ir[e.getMonth()]??"МЕСЯЦ"} ${e.getFullYear()} Г.`}function dr(e){const t=sr[e]??[],a=Xe[e]??[];return[...t,...a]}function mr(e){const t=dr(e);return o.eventsCalendarScope==="all"?t:t.filter(a=>a.isMine)}function fr(e){return`<div class="events-calendar-card" role="listitem" aria-label="Событие ${M(e.id)}"></div>`}function pr(e){const t=ca(),a=new Date(t);a.setDate(t.getDate()+e);const n=la[e]??"ПН",r=a.getDate(),l=mr(e).map(c=>fr(c)).join("");return`
        <div class="events-calendar-col" role="listitem">
            <div class="events-calendar-col-head">${n}, ${r}</div>
            <div class="events-calendar-col-body" role="list">
                ${l}
            </div>
        </div>`}function vr(){const e=ca(),t=ur(e),a=o.eventsCalendarScope==="all",n=o.eventsCalendarScope==="mine",r=la.map((i,l)=>pr(l)).join("");return`
        <section class="events-calendar-block" aria-label="Календарь недели">
            <header class="events-calendar-toolbar">
                <div class="events-calendar-month-group">
                    <span class="events-calendar-month-pill">${M(t)}</span>
                    <button type="button" class="events-calendar-month-toggle" id="eventsWeekNavButton" aria-label="Следующая неделя"></button>
                </div>
                <div class="events-calendar-toolbar-end">
                    <div class="events-calendar-scope" role="group" aria-label="Фильтр событий">
                        <button
                            type="button"
                            class="events-calendar-scope-btn${a?" is-active":""}"
                            data-events-calendar-scope="all"
                            aria-pressed="${a}"
                        >ВСЕ</button>
                        <button
                            type="button"
                            class="events-calendar-scope-btn${n?" is-active":""}"
                            data-events-calendar-scope="mine"
                            aria-pressed="${n}"
                        >МОИ</button>
                    </div>
                    <button type="button" class="events-calendar-create-btn" id="eventsOpenCreateButton" aria-label="Создать событие">+</button>
                </div>
            </header>
            <div class="events-calendar-grid" role="list" aria-label="Дни недели">
                ${r}
            </div>
        </section>`}function gr(){const e=lr.map(t=>{const a=t.hasPoints?'<span class="events-activity-points">БАЛЛЫ</span>':"";return`
            <div class="events-activity-row${t.hasPoints?"":" events-activity-row--plain"}" role="listitem">
                ${a}
            </div>`}).join("");return`
        <div
            class="events-feed-panel events-feed-panel--activity"
            id="eventsFeedPanelActivity"
            role="tabpanel"
            aria-labelledby="eventsFeedTabActivity"
            ${o.eventsFeedTab==="activity"?"":"hidden"}
        >
            <div class="events-activity-list" role="list">
                ${e}
            </div>
        </div>`}function hr(e){const t=["92%","78%","64%","48%"];return Array.from({length:e},(a,n)=>`<span class="events-news-line" style="width: ${t[n%t.length]}"></span>`).join("")}function br(){const e=cr.map(t=>`
        <article class="events-news-card" role="listitem">
            <div class="events-news-media" aria-hidden="true"></div>
            <div class="events-news-copy">
                <h3 class="events-news-title">${M(t.title)}</h3>
                <div class="events-news-lines" aria-hidden="true">
                    ${hr(t.lineCount)}
                </div>
            </div>
        </article>`).join("");return`
        <div
            class="events-feed-panel events-feed-panel--news"
            id="eventsFeedPanelNews"
            role="tabpanel"
            aria-labelledby="eventsFeedTabNews"
            ${o.eventsFeedTab==="news"?"":"hidden"}
        >
            <div class="events-news-list" role="list">
                ${e}
            </div>
        </div>`}function yr(){const e=o.eventsFeedTab==="activity",t=o.eventsFeedTab==="news";return`
        <section class="events-feed-block" aria-label="Информационные ленты">
            <div class="events-feed-tabs" role="tablist" aria-label="Ленты">
                <button
                    type="button"
                    class="events-feed-tab${e?" is-active":""}"
                    id="eventsFeedTabActivity"
                    role="tab"
                    aria-selected="${e}"
                    aria-controls="eventsFeedPanelActivity"
                    data-events-feed-tab="activity"
                >ЛЕНТА АКТИВНОСТЕЙ</button>
                <button
                    type="button"
                    class="events-feed-tab${t?" is-active":""}"
                    id="eventsFeedTabNews"
                    role="tab"
                    aria-selected="${t}"
                    aria-controls="eventsFeedPanelNews"
                    data-events-feed-tab="news"
                >ЛЕНТА НОВОСТЕЙ</button>
            </div>
            <div class="events-feed-panels">
                ${gr()}
                ${br()}
            </div>
        </section>`}function Er(e){return`
            <section class="profile-main events-dashboard-main">
                ${e}
                <div class="events-panels-stack">
                    ${vr()}
                    ${yr()}
                </div>
            </section>`}function wr(){if(!D(m)||o.dashboardSection!=="events")return;const e=m.querySelector("#eventsWeekNavButton");N(e)&&e.addEventListener("click",()=>{o.eventsWeekOffset+=1,x(),C()}),m.querySelectorAll("[data-events-calendar-scope]").forEach(a=>{a.addEventListener("click",()=>{const n=a.dataset.eventsCalendarScope;(n==="all"||n==="mine")&&(o.eventsCalendarScope=n,x(),C())})}),m.querySelectorAll("[data-events-feed-tab]").forEach(a=>{a.addEventListener("click",()=>{const n=a.dataset.eventsFeedTab;(n==="activity"||n==="news")&&(o.eventsFeedTab=n,x(),C())})});const t=m.querySelector("#eventsOpenCreateButton");N(t)&&t.addEventListener("click",()=>{Cr()})}function Ze(){return{topic:"",tag:"",description:"",format:"",dateTime:""}}function Ne(){return o.eventsCreateDraft||(o.eventsCreateDraft=Ze()),o.eventsCreateDraft}function mt(){const e=o.eventsCreateDraft,t=encodeURIComponent(((e==null?void 0:e.topic.trim())||"sobytie").replace(/\s+/g,"-").toLowerCase());return`${window.location.origin}/events/${t}`}function Cr(){o.view==="account"&&(o.dashboardSection="events",o.profileModal="none",o.teamModal="none",o.eventsModal="create",Ne(),le(),x(),C())}function Sr(){o.eventsModal="success",o.eventsShareLink=mt(),C()}function ge(){o.eventsModal="none",C()}function Tr(){const e=Xe.findIndex(a=>a.length===0),t=e>=0?e:4;Xe[t].push({id:`ev-user-${Date.now().toString(36)}`,isMine:!0})}async function Ir(){if(!D(m))return;const e=m.querySelector("#eventsSuccessQrImg");if(!(e instanceof HTMLImageElement))return;const t=o.eventsShareLink.trim()||mt();try{e.src=await Y.toDataURL(t,{width:200,margin:2,color:{dark:"#2a2a2a",light:"#ffffff"}}),e.alt="QR-код ссылки на событие"}catch{e.removeAttribute("src"),e.alt="Не удалось сформировать QR"}}function Ve(){if(!D(m)||o.eventsModal!=="create")return;const e=Ne(),t=m.querySelector("#eventCreateTopicInput"),a=m.querySelector("#eventCreateTagInput"),n=m.querySelector("#eventCreateDescriptionInput"),r=m.querySelector("#eventCreateFormatInput"),i=m.querySelector("#eventCreateDateTimeInput");A(t)&&(e.topic=t.value),A(a)&&(e.tag=a.value),n instanceof HTMLTextAreaElement&&(e.description=n.value),A(r)&&(e.format=r.value),A(i)&&(e.dateTime=i.value)}function kr(){if(o.eventsModal==="create"){const e=Ne();return`
                <div class="profile-modal team-overlay-modal team-rescue-modal event-create-modal" role="dialog" aria-modal="true" aria-label="Создание события">
                    <div class="profile-modal-backdrop team-rescue-backdrop" data-close-events-modal="1"></div>
                    <div class="profile-modal-card team-rescue-card">
                        <button type="button" class="team-rescue-close" id="eventsCloseCreateButton" aria-label="Закрыть"></button>
                        <h2 class="team-rescue-title">СОБЫТИЕ</h2>
                        <form id="eventCreateForm" class="team-rescue-form" novalidate>
                            <div class="team-rescue-topic-row">
                                <input
                                    id="eventCreateTopicInput"
                                    class="team-rescue-field team-rescue-field--topic"
                                    type="text"
                                    placeholder="ТЕМА"
                                    value="${M(e.topic)}"
                                    autocomplete="off"
                                >
                                <input
                                    id="eventCreateTagInput"
                                    class="team-rescue-field team-rescue-field--tag"
                                    type="text"
                                    placeholder="ТЕГ"
                                    value="${M(e.tag)}"
                                    autocomplete="off"
                                >
                            </div>
                            <textarea
                                id="eventCreateDescriptionInput"
                                class="team-rescue-textarea"
                                placeholder=" "
                                aria-label="Описание события"
                            >${M(e.description)}</textarea>
                            <div class="team-rescue-duo-row">
                                <input
                                    id="eventCreateFormatInput"
                                    class="team-rescue-field team-rescue-field--duo"
                                    type="text"
                                    placeholder="ФОРМАТ"
                                    value="${M(e.format)}"
                                    autocomplete="off"
                                >
                                <input
                                    id="eventCreateDateTimeInput"
                                    class="team-rescue-field team-rescue-field--duo"
                                    type="text"
                                    placeholder="ДАТА, ВРЕМЯ"
                                    value="${M(e.dateTime)}"
                                    autocomplete="off"
                                >
                            </div>
                            <button type="submit" class="team-rescue-submit">СОЗДАТЬ</button>
                        </form>
                    </div>
                </div>`}return o.eventsModal==="success"?`
                <div class="profile-modal team-overlay-modal event-success-modal" role="dialog" aria-modal="true" aria-label="Событие создано">
                    <div class="profile-modal-backdrop team-rescue-backdrop" data-close-events-modal="1"></div>
                    <div class="profile-modal-card event-success-card">
                        <button type="button" class="team-rescue-close" id="eventsCloseSuccessButton" aria-label="Закрыть"></button>
                        <h2 class="profile-modal-title event-success-title">УСПЕШНО!</h2>
                        <div class="event-success-link-row">
                            <div class="event-success-link-field">ССЫЛКА</div>
                            <button type="button" class="event-success-link-copy" id="eventsCopyLinkButton">СКОПИРОВАТЬ</button>
                        </div>
                        <div class="event-success-qr-wrap">
                            <img id="eventsSuccessQrImg" class="event-success-qr" width="200" height="200" alt="">
                        </div>
                        <button type="button" class="event-success-done" id="eventsSuccessDoneButton">ГОТОВО</button>
                    </div>
                </div>`:""}function Lr(){if(!(!D(m)||o.eventsModal==="none")){if(m.querySelectorAll("[data-close-events-modal]").forEach(e=>{e.addEventListener("click",()=>{o.eventsModal==="create"&&Ve(),ge()})}),o.eventsModal==="create"){const e=Ne(),t=m.querySelector("#eventsCloseCreateButton");N(t)&&t.addEventListener("click",()=>{Ve(),ge()});const a=m.querySelector("#eventCreateTopicInput"),n=m.querySelector("#eventCreateTagInput"),r=m.querySelector("#eventCreateDescriptionInput"),i=m.querySelector("#eventCreateFormatInput"),l=m.querySelector("#eventCreateDateTimeInput"),c=m.querySelector("#eventCreateForm"),s=(u,d)=>{A(u)&&u.addEventListener("input",()=>{e[d]=u.value})};s(a,"topic"),s(n,"tag"),s(i,"format"),s(l,"dateTime"),r instanceof HTMLTextAreaElement&&r.addEventListener("input",()=>{e.description=r.value}),Se(c)&&c.addEventListener("submit",u=>{if(u.preventDefault(),Ve(),!e.topic.trim()){L("Укажите тему события.","error"),C();return}Tr(),Sr()});return}if(o.eventsModal==="success"){const e=m.querySelector("#eventsCloseSuccessButton");N(e)&&e.addEventListener("click",()=>{o.eventsCreateDraft=Ze(),ge(),L("Событие создано."),C()});const t=m.querySelector("#eventsCopyLinkButton");N(t)&&t.addEventListener("click",async()=>{const n=o.eventsShareLink||mt();try{await navigator.clipboard.writeText(n),L("Ссылка на событие скопирована.")}catch{L("Не удалось скопировать ссылку.","error")}C()});const a=m.querySelector("#eventsSuccessDoneButton");N(a)&&a.addEventListener("click",()=>{o.eventsCreateDraft=Ze(),ge(),L("Событие создано."),C()})}}}function ua(){const e=o.profile,t=o.localCreatedTeam;if(!e||!(t!=null&&t.members.length))return;const a=`user-${e.id}`,n=ft();if(!n)return;let r=!1;const i=t.members.map(l=>l.id!==a?l:(r=!0,{...n,roleLabel:l.roleLabel,isCaptain:l.isCaptain}));r&&(o.localCreatedTeam={...t,members:i},Z())}function re(){rr(),Nr(),ua()}function Mr(){return o.profile?o.profile.isCaptain?!0:!!o.localCreatedTeam:!1}function ft(){const e=o.profile;return e?{id:`user-${e.id}`,displayName:ct()||na(e)||"УЧАСТНИК",roleLabel:e.isCaptain?"КАПИТАН":"УЧАСТНИК",avatarUrl:ut()||e.avatarUrl||"",isCaptain:e.isCaptain}:null}function me(){const e=ft();return e?{...e,roleLabel:"КАПИТАН",isCaptain:!0}:null}function Br(e){if(!e||typeof e!="object")return null;const t=e;return typeof t.id!="string"||typeof t.displayName!="string"?null:{id:t.id,displayName:t.displayName,roleLabel:typeof t.roleLabel=="string"?t.roleLabel:"УЧАСТНИК",avatarUrl:typeof t.avatarUrl=="string"?t.avatarUrl:"",isCaptain:!!t.isCaptain}}function pt(){var t;if(o.localCreatedTeam){const a=o.localCreatedTeam.members;if(a.length>0)return a;const n=me();return n?[n]:[]}const e=o.profile;if(e&&(e.teamId!=null||(t=e.teamName)!=null&&t.trim())){const a=ft();return a?[a]:[]}return[]}function Z(){const e=o.profile,t=o.localCreatedTeam;if(!e||!t)return;const a={name:t.name,inviteCode:t.inviteCode,direction:t.direction,inviteLink:o.profileInviteLink.trim()||de(),members:t.members};localStorage.setItem(We(e.id),JSON.stringify(a))}function Nr(){const e=o.profile;if(!e)return;if(e.teamId!=null){localStorage.removeItem(We(e.id));return}const t=localStorage.getItem(We(e.id));if(t)try{const a=JSON.parse(t);if(typeof a.name!="string"||typeof a.inviteCode!="string")return;const n=Array.isArray(a.members)?a.members.map(Br).filter(Boolean):[],r=me(),i=n.length>0?n:r?[r]:[],l=typeof a.direction=="string"?a.direction:"";o.localCreatedTeam={name:a.name,inviteCode:a.inviteCode,direction:l,members:i},typeof a.inviteLink=="string"&&a.inviteLink.trim()&&(o.profileInviteLink=a.inviteLink.trim()),o.profile={...e,teamName:a.name,teamInviteCode:a.inviteCode}}catch{}}async function Rr(){if(!D(m))return;const e=m.querySelector("#profileSuccessQrImg");if(!(e instanceof HTMLImageElement))return;const t=o.profileInviteLink.trim()||de();try{e.src=await Y.toDataURL(t,{width:200,margin:2,color:{dark:"#2a2a2a",light:"#ffffff"}}),e.alt="QR-код ссылки-приглашения"}catch{e.removeAttribute("src"),e.alt="Не удалось сформировать QR"}}function da(e,t=0){o.profileModal="none",o.profileFormDraft=null,o.eventsModal="none",ie(),o.teamModal=e;const a=pt(),n=a.length>0?Math.min(Math.max(0,t),a.length-1):0;o.teamVoteMemberIndex=n,e==="requests"&&(o.teamRequestsInviteLink=de()),e==="rescue"&&Be(),C()}function Q(){o.teamModal="none",C()}function It(){if(!D(m)||o.teamModal!=="rescue")return;const e=Be(),t=m.querySelector("#teamRescueTopicInput"),a=m.querySelector("#teamRescueTagInput"),n=m.querySelector("#teamRescueDescriptionInput"),r=m.querySelector("#teamRescueLeagueInput"),i=m.querySelector("#teamRescueDeadlineInput");A(t)&&(e.topic=t.value),A(a)&&(e.tag=a.value),n instanceof HTMLTextAreaElement&&(e.description=n.value),A(r)&&(e.league=r.value),A(i)&&(e.deadline=i.value)}function Dr(){if(!D(m)||o.teamModal!=="rescue")return;const e=Be(),t=m.querySelector("#teamCloseRescueButton");N(t)&&t.addEventListener("click",()=>{It(),Q()});const a=m.querySelector("#teamRescueTopicInput"),n=m.querySelector("#teamRescueTagInput"),r=m.querySelector("#teamRescueDescriptionInput"),i=m.querySelector("#teamRescueLeagueInput"),l=m.querySelector("#teamRescueDeadlineInput"),c=m.querySelector("#teamRescuePhotoInput"),s=m.querySelector("#teamRescuePhotoLabel"),u=m.querySelector("#teamRescueForm"),d=(h,p)=>{A(h)&&h.addEventListener("input",()=>{e[p]=h.value})};d(a,"topic"),d(n,"tag"),d(i,"league"),d(l,"deadline"),r instanceof HTMLTextAreaElement&&r.addEventListener("input",()=>{e.description=r.value}),A(c)&&c.addEventListener("change",()=>{var p;const h=(p=c.files)==null?void 0:p[0];e.photoFileName=(h==null?void 0:h.name)??"",s instanceof HTMLElement&&(s.textContent=e.photoFileName.trim()||"ФОТО")}),Se(u)&&u.addEventListener("submit",h=>{if(h.preventDefault(),It(),!e.topic.trim()){L("Укажите тему запроса на спасение.","error"),C();return}o.teamRescueDraft=aa(),Q(),L("Спасение: запрос помощи отправлен (демо)."),C()})}function Ar(){if(o.teamModal==="vote"){const e=pt(),t=e[o.teamVoteMemberIndex]??e[0],a=t!=null&&t.avatarUrl?`<img src="${M(t.avatarUrl)}" alt="" loading="lazy">`:"",n=(t==null?void 0:t.roleLabel)??"РОЛЬ";return`
                <div class="profile-modal team-overlay-modal" role="dialog" aria-modal="true" aria-label="Голосование">
                    <div class="profile-modal-backdrop" data-close-team-modal="1"></div>
                    <div class="profile-modal-card team-vote-card">
                        <button type="button" class="profile-modal-dot" id="teamCloseVoteButton" aria-label="Закрыть"></button>
                        <h2 class="profile-modal-title">ГОЛОСОВАНИЕ</h2>
                        <div class="team-vote-hero">
                            <div class="${a?"team-vote-avatar has-image":"team-vote-avatar"}" aria-hidden="true">${a}</div>
                            <div class="team-vote-role-pill">${M(n)}</div>
                        </div>
                        <div class="team-history-rows team-vote-rows">
                            ${tr()}
                        </div>
                    </div>
                </div>`}if(o.teamModal==="rescue"){const e=Be(),t=e.photoFileName.trim()||"ФОТО";return`
                <div class="profile-modal team-overlay-modal team-rescue-modal" role="dialog" aria-modal="true" aria-label="Спасение">
                    <div class="profile-modal-backdrop team-rescue-backdrop" data-close-team-modal="1"></div>
                    <div class="profile-modal-card team-rescue-card">
                        <button type="button" class="team-rescue-close" id="teamCloseRescueButton" aria-label="Закрыть"></button>
                        <h2 class="team-rescue-title">СПАСЕНИЕ</h2>
                        <form id="teamRescueForm" class="team-rescue-form" novalidate>
                            <div class="team-rescue-topic-row">
                                <input
                                    id="teamRescueTopicInput"
                                    class="team-rescue-field team-rescue-field--topic"
                                    type="text"
                                    placeholder="ТЕМА"
                                    value="${M(e.topic)}"
                                    autocomplete="off"
                                >
                                <input
                                    id="teamRescueTagInput"
                                    class="team-rescue-field team-rescue-field--tag"
                                    type="text"
                                    placeholder="ТЕГ"
                                    value="${M(e.tag)}"
                                    autocomplete="off"
                                >
                            </div>
                            <textarea
                                id="teamRescueDescriptionInput"
                                class="team-rescue-textarea"
                                placeholder=" "
                                aria-label="Описание ситуации"
                            >${M(e.description)}</textarea>
                            <div class="team-rescue-photo-row">
                                <span class="team-rescue-photo-label" id="teamRescuePhotoLabel">${M(t)}</span>
                                <label class="team-rescue-photo-btn">
                                    ВЫБРАТЬ
                                    <input
                                        type="file"
                                        id="teamRescuePhotoInput"
                                        class="team-rescue-file"
                                        accept="image/*"
                                        hidden
                                    >
                                </label>
                            </div>
                            <div class="team-rescue-duo-row">
                                <input
                                    id="teamRescueLeagueInput"
                                    class="team-rescue-field team-rescue-field--duo"
                                    type="text"
                                    placeholder="ЛИГА"
                                    value="${M(e.league)}"
                                    autocomplete="off"
                                >
                                <input
                                    id="teamRescueDeadlineInput"
                                    class="team-rescue-field team-rescue-field--duo"
                                    type="text"
                                    placeholder="ДЕДЛАЙН"
                                    value="${M(e.deadline)}"
                                    autocomplete="off"
                                >
                            </div>
                            <button type="submit" class="team-rescue-submit">ОТПРАВИТЬ</button>
                        </form>
                    </div>
                </div>`}return o.teamModal==="requests"?(o.teamRequestsInviteLink||de(),`
                <div class="profile-modal team-overlay-modal" role="dialog" aria-modal="true" aria-label="Заявки">
                    <div class="profile-modal-backdrop" data-close-team-modal="1"></div>
                    <div class="profile-modal-card team-requests-card">
                        <button type="button" class="profile-modal-dot" id="teamCloseRequestsButton" aria-label="Закрыть"></button>
                        <h2 class="profile-modal-title">ЗАЯВКИ</h2>
                        <div class="team-requests-carousel" aria-hidden="false">
                            <div class="team-request-slide is-dim">
                                <div class="team-request-avatar"></div>
                                <p class="team-request-label">ИМЯ ФАМИЛИЯ</p>
                                <div class="team-request-mini-row">
                                    <button type="button" class="team-request-dot-pill" disabled aria-hidden="true"></button>
                                    <button type="button" class="team-request-dot-pill is-muted" disabled aria-hidden="true"></button>
                                </div>
                            </div>
                            <div class="team-request-slide is-center">
                                <div class="team-request-avatar"></div>
                                <p class="team-request-label">ИМЯ ФАМИЛИЯ</p>
                                <div class="team-request-mini-row">
                                    <button type="button" class="team-request-dot-pill" id="teamRequestAcceptButton" aria-label="Принять"></button>
                                    <button type="button" class="team-request-dot-pill is-decline" id="teamRequestDeclineButton" aria-label="Отклонить"></button>
                                </div>
                            </div>
                            <div class="team-request-slide is-dim">
                                <div class="team-request-avatar"></div>
                                <p class="team-request-label">ИМЯ ФАМИЛИЯ</p>
                                <div class="team-request-mini-row">
                                    <button type="button" class="team-request-dot-pill" disabled aria-hidden="true"></button>
                                    <button type="button" class="team-request-dot-pill is-muted" disabled aria-hidden="true"></button>
                                </div>
                            </div>
                        </div>
                        <div class="profile-link-row team-requests-link-row">
                            <div class="profile-link-field">ССЫЛКА</div>
                            <button type="button" class="profile-link-copy" id="teamRequestsCopyLinkButton">СКОПИРОВАТЬ</button>
                        </div>
                        <div class="team-requests-bottom-placeholder" aria-hidden="true"></div>
                    </div>
                </div>`):""}function kt(e){o.teamModal="none",o.eventsModal="none",o.profileModal=e,e==="personal"&&(o.profileFormDraft={fullName:ct(),group:ra(),avatarDataUrl:ut()||null}),C()}function K(){o.profileModal="none",o.profileFormDraft=null,C()}const $r=20;function qr(){return Array.from({length:$r},(t,a)=>a).map(t=>`
        <button type="button" class="profile-achievement-item" data-achievement-index="${t}">
            <span class="profile-achievement-circle"></span>
            <span class="profile-achievement-caption">НАЗВАНИЕ</span>
        </button>`).join("")}function Fr(){const e=o.profileFormDraft;switch(o.profileModal){case"personal":return e?`
                <div class="profile-modal" role="dialog" aria-modal="true" aria-label="Личные данные">
                    <div class="profile-modal-backdrop" data-close-modal="1"></div>
                    <div class="profile-modal-card">
                        <h2 class="profile-modal-title">ЛИЧНЫЕ ДАННЫЕ</h2>
                        <div class="profile-modal-field profile-modal-photo-row">
                            <span class="profile-modal-photo-label">ФОТО</span>
                            <label class="profile-modal-file">
                                <input id="profileAvatarInput" type="file" accept="image/*" hidden>
                                <span class="profile-pill-button">ВЫБРАТЬ</span>
                            </label>
                        </div>
                        <input id="profileNameInput" class="profile-modal-input" type="text" placeholder="ИМЯ ФАМИЛИЯ" value="${M(e.fullName)}">
                        <input id="profileGroupInput" class="profile-modal-input" type="text" placeholder="АКАДЕМ. ГРУППА" value="${M(e.group)}">
                        <button type="button" class="profile-pill-wide" id="profileSavePersonalButton">СОХРАНИТЬ</button>
                        <button type="button" class="profile-modal-text" id="profileOpenPasswordButton">ВОССТАНОВЛЕНИЕ ПАРОЛЯ</button>
                    </div>
                </div>
            `:"";case"password":return`
                <div class="profile-modal" role="dialog" aria-modal="true" aria-label="Восстановление пароля">
                    <div class="profile-modal-backdrop" data-close-modal="1"></div>
                    <div class="profile-modal-card">
                        <h2 class="profile-modal-title">ВОССТАНОВЛЕНИЕ ПАРОЛЯ</h2>
                        <input id="profileNewPasswordInput" class="profile-modal-input" type="password" placeholder="НОВЫЙ ПАРОЛЬ">
                        <input id="profileConfirmPasswordInput" class="profile-modal-input" type="password" placeholder="ПОДТВЕРЖДЕНИЕ">
                        <button type="button" class="profile-pill-wide" id="profileSavePasswordButton">СОХРАНИТЬ</button>
                    </div>
                </div>
            `;case"noTeam":return`
                <div class="profile-modal" role="dialog" aria-modal="true" aria-label="Нет команды">
                    <div class="profile-modal-backdrop" data-close-modal="1"></div>
                    <div class="profile-modal-card profile-modal-card-compact">
                        <button type="button" class="profile-modal-dot" id="profileCloseNoTeamButton" aria-label="Закрыть"></button>
                        <h2 class="profile-modal-title">НЕТ КОМАНДЫ</h2>
                        <div class="profile-modal-stack">
                            <button type="button" class="profile-pill-wide" id="profileFindTeamButton">НАЙТИ</button>
                            <button type="button" class="profile-pill-wide" id="profileOpenCreateTeamButton">СОЗДАТЬ</button>
                        </div>
                    </div>
                </div>
            `;case"createTeam":return`
                <div class="profile-modal" role="dialog" aria-modal="true" aria-label="Создание команды">
                    <div class="profile-modal-backdrop" data-close-modal="1"></div>
                    <div class="profile-modal-card">
                        <h2 class="profile-modal-title">СОЗДАНИЕ КОМАНДЫ</h2>
                        <input id="profileTeamNameInput" class="profile-modal-input" type="text" placeholder="НАЗВАНИЕ" value="${M(o.profileCreateTeamName)}">
                        <input id="profileTeamDirectionInput" class="profile-modal-input" type="text" placeholder="НАПРАВЛЕНИЕ" value="${M(o.profileCreateTeamDirection)}">
                        <div class="profile-modal-stack">
                            <button type="button" class="profile-pill-wide" id="profileConfirmCreateTeamButton">СОЗДАТЬ</button>
                            <button type="button" class="profile-pill-wide profile-pill-outline" id="profileBackFromCreateTeamButton">НАЗАД</button>
                        </div>
                    </div>
                </div>
            `;case"teamSuccess":return`
                <div class="profile-modal" role="dialog" aria-modal="true" aria-label="Команда создана">
                    <div class="profile-modal-backdrop" data-close-modal="1"></div>
                    <div class="profile-modal-card profile-modal-card-success">
                        <button type="button" class="profile-modal-dot" id="profileCloseSuccessButton" aria-label="Закрыть"></button>
                        <h2 class="profile-modal-title">УСПЕШНО!</h2>
                        <div class="profile-link-row">
                            <div class="profile-link-field">ССЫЛКА</div>
                            <button type="button" class="profile-link-copy" id="profileCopyInviteButton">СКОПИРОВАТЬ</button>
                        </div>
                        <div class="profile-success-qr-wrap">
                            <img id="profileSuccessQrImg" class="profile-success-qr" width="200" height="200" alt="">
                        </div>
                        <button type="button" class="profile-pill-wide" id="profileSuccessGoButton">ПЕРЕЙТИ</button>
                    </div>
                </div>
            `;case"achievement":return`
                <div class="profile-modal" role="dialog" aria-modal="true" aria-label="Достижение">
                    <div class="profile-modal-backdrop" data-close-modal="1"></div>
                    <div class="profile-modal-card profile-modal-card-achievement">
                        <button type="button" class="profile-modal-dot" id="profileCloseAchievementButton" aria-label="Закрыть"></button>
                        <div class="profile-achievement-hero"></div>
                        <p class="profile-achievement-name">${M(o.profileAchievementTitle||"НАЗВАНИЕ")}</p>
                        <div class="profile-achievement-body"></div>
                        <div class="profile-achievement-meta">
                            <span class="profile-achievement-meta-label">БАЛЛЫ</span>
                            <span class="profile-achievement-meta-value"></span>
                        </div>
                    </div>
                </div>
            `;default:return""}}function Pr(e){const t=e.parentElement;if(!(t!=null&&t.classList.contains("profile-achievements-scroll-wrap")))return;const a=e.scrollWidth-e.clientWidth,n=a>4,r=e.scrollLeft<=4,i=e.scrollLeft>=a-4;t.classList.toggle("is-scrollable",n),n?(t.classList.toggle("is-at-start",r),t.classList.toggle("is-at-end",i)):t.classList.add("is-at-start","is-at-end")}function Ur(){if(!D(m))return;const e=o.profile,t="ЛИГА",a=String((e==null?void 0:e.teamScore)??0),n="РЕЙТИНГ",r="—",i="—",l=ct(),c=ra(),u=dt()||"КОМАНДА",d=o.statusMessage?`<p class="profile-inline-status ${o.statusTone==="error"?"is-error":""}">${M(o.statusMessage)}</p>`:"",h=o.dashboardSection==="profile"?" is-active":"",p=o.dashboardSection==="team"?" is-active":"",v=o.dashboardSection==="rating"?" is-active":"",E=o.dashboardSection==="events"?" is-active":"",S=o.dashboardSection==="team"?On(d):o.dashboardSection==="rating"?kn(d):o.dashboardSection==="events"?Er(d):`
            <section class="profile-main">
                ${d}
                <div class="profile-hero-card">
                    <div class="profile-top">
                        <div class="profile-photo-col">
                            <div class="profile-photo"></div>
                        </div>
                        <div class="profile-stats-col" aria-label="Сводка: лига, баллы, рейтинг">
                            <div class="profile-stat-track">
                                <span class="profile-stat-orb profile-stat-orb--muted" aria-hidden="true">${t}</span>
                                <span class="profile-stat-value">${M(i)}</span>
                            </div>
                            <div class="profile-stat-track">
                                <span class="profile-stat-orb profile-stat-orb--muted" aria-hidden="true">БАЛЛЫ</span>
                                <span class="profile-stat-value profile-stat-value--num">${M(a)}</span>
                            </div>
                            <div class="profile-stat-track profile-stat-track--rating">
                                <span class="profile-stat-orb profile-stat-orb--accent" aria-hidden="true">${n}</span>
                                <span class="profile-stat-value">${M(r)}</span>
                            </div>
                        </div>
                    </div>
                    <div class="profile-pills-row">
                        <div class="profile-info-pill profile-info-pill--name">${M(l||"ИМЯ ФАМИЛИЯ")}</div>
                        <div class="profile-info-pill profile-info-pill--group">${M(c||"АКАДЕМ. ГРУППА")}</div>
                        <button type="button" class="profile-info-pill profile-info-pill-accent" id="profileTeamPillButton">${M(u)}</button>
                    </div>
                </div>
                <div class="profile-achievements">
                    <h3 class="profile-achievements-title">ДОСТИЖЕНИЯ</h3>
                    <div class="profile-achievements-scroll-wrap">
                        <div class="profile-achievements-fade profile-achievements-fade-left" aria-hidden="true"></div>
                        <div class="profile-achievements-fade profile-achievements-fade-right" aria-hidden="true"></div>
                        <div class="profile-achievements-scroll" id="profileAchievementsScroll">
                            ${qr()}
                        </div>
                    </div>
                </div>
            </section>`;m.innerHTML=`
        <div class="profile-app">
            <aside class="profile-sidebar" aria-label="Разделы">
                <nav class="profile-nav-top">
                    <button type="button" class="profile-nav-button${h}" data-dashboard="profile">ПРОФИЛЬ</button>
                    <button type="button" class="profile-nav-button${p}" data-dashboard="team">КОМАНДА</button>
                    <button type="button" class="profile-nav-button${v}" data-dashboard="rating">РЕЙТИНГ</button>
                    <button type="button" class="profile-nav-button${E}" data-dashboard="events">СОБЫТИЯ</button>
                    <button type="button" class="profile-nav-button" data-dashboard-placeholder="news">НОВОСТИ</button>
                </nav>
                <nav class="profile-nav-bottom">
                    <button type="button" class="profile-nav-button" id="profileSettingsButton">НАСТРОЙКИ</button>
                    <button type="button" class="profile-nav-button" id="profileLogoutButton">ПОКИНУТЬ</button>
                </nav>
            </aside>
            ${S}
        </div>
        ${Fr()}
        ${Ar()}
        ${kr()}
        ${Ln()}
        ${_n()}
    `,Or(),o.profileModal==="teamSuccess"&&Rr(),o.eventsModal==="success"&&Ir(),o.dashboardSection==="team"&&g.eventModal==="success"&&D(m)&&Hn(m)}function Or(){if(!D(m))return;const e=m.querySelector(".profile-photo");if(e instanceof HTMLElement){const I=ut();I?(e.classList.add("has-image"),e.style.backgroundImage=`url(${JSON.stringify(I)})`):(e.classList.remove("has-image"),e.style.removeProperty("background-image"))}X==null||X.disconnect(),X=void 0;const t=m.querySelector("#profileAchievementsScroll");if(t instanceof HTMLElement){const I=()=>{Pr(t)};t.addEventListener("scroll",I,{passive:!0}),requestAnimationFrame(I),X=new ResizeObserver(()=>I()),X.observe(t)}const a=m.querySelector("#profileLogoutButton");N(a)&&a.addEventListener("click",()=>{pa(),o.profile=null,er(),o.signIn.password="",L("Сессия завершена."),lt("sign-in")});const n=m.querySelector("#profileSettingsButton");N(n)&&n.addEventListener("click",()=>{kt("personal")});const r=m.querySelector("#profileTeamPillButton");N(r)&&r.addEventListener("click",()=>{o.dashboardSection="team",le(),x(),C()}),m.querySelectorAll("[data-dashboard]").forEach(I=>{I.addEventListener("click",()=>{const P=I.dataset.dashboard;P&&(o.dashboardSection=P,le(),x(),C())})}),m.querySelectorAll("[data-dashboard-placeholder]").forEach(I=>{I.addEventListener("click",()=>{L("Раздел скоро будет доступен."),C()})}),o.dashboardSection==="rating"&&D(m)&&Nn(m),o.dashboardSection==="team"&&D(m)&&Vn(m),wr(),Lr(),Dr(),m.querySelectorAll("[data-close-team-modal]").forEach(I=>{I.addEventListener("click",()=>{Q()})});const i=m.querySelector("#teamCloseVoteButton");N(i)&&i.addEventListener("click",()=>{Q()});const l=m.querySelector("#teamCloseRequestsButton");N(l)&&l.addEventListener("click",()=>{Q()});const c=m.querySelector("#teamRequestsCopyLinkButton");N(c)&&c.addEventListener("click",async()=>{const I=o.teamRequestsInviteLink||de();try{await navigator.clipboard.writeText(I),L("Ссылка-приглашение скопирована.")}catch{L("Не удалось скопировать ссылку.","error")}C()});const s=m.querySelector("#teamRequestAcceptButton");N(s)&&s.addEventListener("click",()=>{if(o.localCreatedTeam){const I={id:`invite-${Date.now().toString(36)}`,displayName:"Новый участник (демо)",roleLabel:"УЧАСТНИК",avatarUrl:"",isCaptain:!1};o.localCreatedTeam={...o.localCreatedTeam,members:[...o.localCreatedTeam.members,I]},Z()}L("Заявка принята (демо)."),Q()});const u=m.querySelector("#teamRequestDeclineButton");N(u)&&u.addEventListener("click",()=>{L("Заявка отклонена (демо)."),Q()}),m.querySelectorAll(".profile-achievement-item").forEach(I=>{I.addEventListener("click",()=>{o.profileAchievementTitle="НАЗВАНИЕ",kt("achievement")})}),m.querySelectorAll("[data-close-modal]").forEach(I=>{I.addEventListener("click",()=>{K()})});const d=m.querySelector("#profileNameInput");A(d)&&o.profileFormDraft&&d.addEventListener("input",()=>{o.profileFormDraft.fullName=d.value});const h=m.querySelector("#profileGroupInput");A(h)&&o.profileFormDraft&&h.addEventListener("input",()=>{o.profileFormDraft.group=h.value});const p=m.querySelector("#profileAvatarInput");A(p)&&o.profileFormDraft&&p.addEventListener("change",()=>{var j;const I=(j=p.files)==null?void 0:j[0];if(!I)return;const P=new FileReader;P.onload=()=>{typeof P.result=="string"&&o.profileFormDraft&&(o.profileFormDraft.avatarDataUrl=P.result,C())},P.readAsDataURL(I)});const v=m.querySelector("#profileOpenPasswordButton");N(v)&&v.addEventListener("click",()=>{o.profileModal="password",o.profileFormDraft=null,C()});const E=m.querySelector("#profileSavePasswordButton");N(E)&&E.addEventListener("click",()=>{L("Пароль обновлён (демо)."),K()});const S=m.querySelector("#profileCloseNoTeamButton");N(S)&&S.addEventListener("click",()=>{K()});const q=m.querySelector("#profileFindTeamButton");N(q)&&q.addEventListener("click",()=>{L("Поиск команды скоро будет доступен."),K()});const w=m.querySelector("#profileOpenCreateTeamButton");N(w)&&w.addEventListener("click",()=>{o.profileCreateTeamName="",o.profileCreateTeamDirection="",o.profileModal="createTeam",C()});const T=m.querySelector("#profileTeamNameInput");A(T)&&T.addEventListener("input",()=>{o.profileCreateTeamName=T.value});const b=m.querySelector("#profileTeamDirectionInput");A(b)&&b.addEventListener("input",()=>{o.profileCreateTeamDirection=b.value});const y=m.querySelector("#profileConfirmCreateTeamButton");N(y)&&y.addEventListener("click",()=>{var gt,ht;const I=o.profileCreateTeamName.trim()||"КОМАНДА",P=((ht=(gt=o.profile)==null?void 0:gt.teamInviteCode)==null?void 0:ht.trim())||`local-${Date.now().toString(36)}`,j=`${window.location.origin}/team/${encodeURIComponent(I)}?invite=${encodeURIComponent(P)}`;o.profileInviteLink=j;const H=me(),va=H?[H]:[],ga=o.profileCreateTeamDirection.trim();o.localCreatedTeam={name:I,inviteCode:P,direction:ga,members:va},Z(),o.profileModal="teamSuccess",C()});const B=m.querySelector("#profileBackFromCreateTeamButton");N(B)&&B.addEventListener("click",()=>{o.profileModal="noTeam",C()});const R=m.querySelector("#profileCopyInviteButton");N(R)&&R.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(o.profileInviteLink),L("Ссылка скопирована.")}catch{L("Не удалось скопировать ссылку.","error")}C()});const $=m.querySelector("#profileCloseSuccessButton");N($)&&$.addEventListener("click",()=>{K()});const U=m.querySelector("#profileSuccessGoButton");N(U)&&U.addEventListener("click",()=>{o.profile&&o.localCreatedTeam&&(o.profile={...o.profile,teamName:o.localCreatedTeam.name,teamInviteCode:o.localCreatedTeam.inviteCode},Z()),K(),o.dashboardSection="team",le(),x(),C()});const V=m.querySelector("#profileCloseAchievementButton");N(V)&&V.addEventListener("click",()=>{K()})}async function _r(e){o.signIn.email=se(e.elements.namedItem("email")).trim(),o.signIn.password=se(e.elements.namedItem("password")),o.isSubmitting=!0,L("Подключаемся к серверу..."),C();try{const t=await Re("/api/auth/login",{method:"POST",body:JSON.stringify({email:o.signIn.email,password:o.signIn.password})});fa(t),typeof t.id=="number"&&t.id>0?(o.profile=ta(t),re(),ma(t.token)):(o.profile=await De(t.token),re()),o.signIn.password="",o.view="account",L("Вход выполнен.")}catch(t){L(Ae(t),"error")}finally{o.isSubmitting=!1,C()}}const Lt=6;async function Hr(e){if(o.signUp.email=se(e.elements.namedItem("email")).trim(),o.signUp.password=se(e.elements.namedItem("password")),o.signUp.passwordConfirm=se(e.elements.namedItem("passwordConfirm")),!o.signUp.email||!o.signUp.password){L("Заполните email и пароль.","error"),ye();return}if(o.signUp.password.length<Lt){L(`Пароль не короче ${Lt} символов (требование сервера).`,"error"),ye();return}if(o.signUp.password!==o.signUp.passwordConfirm){L("Пароли не совпадают.","error"),ye();return}o.isSubmitting=!0,L("Создаём аккаунт..."),C();try{const t=await Re("/api/auth/register",{method:"POST",body:JSON.stringify({userName:Vr(o.signUp.email),email:o.signUp.email,password:o.signUp.password})});fa(t),typeof t.id=="number"&&t.id>0?(o.profile=ta(t),re(),ma(t.token)):(o.profile=await De(t.token),re()),o.view="account",o.signUp.password="",o.signUp.passwordConfirm="",L("Регистрация завершена.")}catch(t){L(Ae(t),"error")}finally{o.isSubmitting=!1,C()}}async function Re(e,t){const a=new Headers(t==null?void 0:t.headers);a.set("Accept","application/json"),t!=null&&t.body&&!a.has("Content-Type")&&a.set("Content-Type","application/json");const n=await fetch(`${Jn}${e}`,{...t,headers:a});if(!n.ok){let r=`Ошибка ${n.status}`;try{const i=await n.json();if(i.errors){const l=Object.values(i.errors).flat().find(c=>c==null?void 0:c.trim().length);l&&(r=l)}r===`Ошибка ${n.status}`&&(r=i.detail||i.message||i.title||r)}catch{r=n.statusText||r}throw new Error(xr(r))}return await n.json()}function De(e){return Re("/api/auth/me",{headers:{Authorization:`Bearer ${e}`}})}function ma(e){(async()=>{try{const t=await De(e),a=vt();if((a==null?void 0:a.token)!==e||o.view!=="account")return;o.profile=t,re(),C()}catch{}})()}function fa(e){const t={token:e.token,expiresAtUtc:e.expiresAtUtc};localStorage.setItem(st,JSON.stringify(t))}function vt(){const e=localStorage.getItem(st);if(!e)return null;try{const t=JSON.parse(e);return!t.token||!t.expiresAtUtc?null:t}catch{return null}}function pa(){localStorage.removeItem(st)}function Vr(e){var a;return(((a=e.split("@")[0])==null?void 0:a.trim())||"student").replace(/[^a-zA-Z0-9._-]/g,"").slice(0,100)||"student"}function ye(){const e=document.querySelector(".status-message");if(!(e instanceof HTMLElement)){C();return}e.textContent=o.statusMessage,e.classList.toggle("status-error",o.statusTone==="error"),e.classList.toggle("hidden",!o.statusMessage)}function Mt(){const e=o.statusTone==="error"?"status-error":"",t=o.statusMessage?"":"hidden";return`<p class="status-message ${e} ${t}">${M(o.statusMessage)}</p>`}function Ae(e){return e instanceof Error?e.message:"Не удалось выполнить запрос."}function xr(e){return{"User with this email already exists.":"Пользователь с таким email уже зарегистрирован.","Invalid email or password.":"Неверная почта или пароль."}[e]??e}function M(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function zr(e){const t=e.trim().split(/\s+/).filter(Boolean);return t.length===0?{firstName:"",lastName:""}:t.length===1?{firstName:t[0]??"",lastName:""}:{firstName:t[0]??"",lastName:t.slice(1).join(" ")}}function jr(e,t){const{firstName:a,lastName:n}=zr(t.fullName),r=t.group.trim(),i=(e.groupTitle??"").trim(),l=r===i&&e.groupId!=null&&e.groupId>0?e.groupId:null,s=t.avatarDataUrl&&t.avatarDataUrl.startsWith("data:")?t.avatarDataUrl:t.avatarDataUrl??e.avatarUrl??"",u=e.studentTicketNumber;return{firstName:a,lastName:n,middleName:e.middleName??"",nickname:e.nickname??"",bio:e.bio??"",avatarUrl:s,contactEmail:e.contactEmail??"",telegramHandle:e.telegramHandle??"",phoneNumber:e.phoneNumber??"",studentTicketNumber:u&&u>0?u:null,groupId:l&&l>0?l:null,academicGroupLabel:r}}async function Kr(){if(o.profileModal!=="personal")return;const e=o.profileFormDraft,t=o.profile;if(!e||!t){L("Откройте форму через «НАСТРОЙКИ» и попробуйте снова.","error"),C();return}o.profileEdits={fullName:e.fullName,group:e.group,avatarDataUrl:e.avatarDataUrl};try{nr()}catch{L("Не удалось сохранить в браузер (часто из‑за слишком большого фото). Попробуйте файл меньшего размера.","error"),C();return}try{ua()}catch{}const a=vt(),n=jr(t,e);if(K(),a){(async()=>{try{const r=await Re("/api/profile",{method:"PUT",headers:{Authorization:`Bearer ${a.token}`},body:JSON.stringify(n)});o.profile=r,L("Данные сохранены на сервере и в этом браузере.")}catch(r){L(`Сохранено в браузере. Сервер: ${Ae(r)}`,"error")}C()})();return}L("Сохранено локально (нет активной сессии для сервера)."),C()}m instanceof HTMLElement&&m.addEventListener("click",e=>{const t=e.target;t instanceof Element&&t.closest("#profileSavePersonalButton")&&(e.preventDefault(),Kr())});document.querySelectorAll("[data-view]").forEach(e=>{e.addEventListener("click",()=>{const t=e.dataset.view;t&&(x(),lt(t))})});C();
