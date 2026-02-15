(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))s(o);new MutationObserver(o=>{for(const n of o)if(n.type==="childList")for(const i of n.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&s(i)}).observe(document,{childList:!0,subtree:!0});function e(o){const n={};return o.integrity&&(n.integrity=o.integrity),o.referrerPolicy&&(n.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?n.credentials="include":o.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function s(o){if(o.ep)return;o.ep=!0;const n=e(o);fetch(o.href,n)}})();function H(r,t=document.body){const e=t.querySelector(r);if(e)return e;const s=t.querySelectorAll("*");for(const o of s)if(o.shadowRoot){const n=H(r,o.shadowRoot);if(n)return n}return null}const Bt="torchlit-state",Dt="data-tour-id",Nt=10,Ht={getItem:()=>null,setItem:()=>{}};function qt(){try{const r="__torchlit_test__";return localStorage.setItem(r,r),localStorage.removeItem(r),localStorage}catch{return Ht}}class Ut{constructor(t={}){this.tours=new Map,this.activeTourId=null,this.currentStepIndex=0,this.listeners=new Set,this.storageKey=t.storageKey??Bt,this.storage=t.storage??qt(),this.targetAttribute=t.targetAttribute??Dt,this.spotlightPadding=t.spotlightPadding??Nt,this.persistedState=this.loadState()}loadState(){try{const t=this.storage.getItem(this.storageKey);if(t){const e=JSON.parse(t);return{completed:Array.isArray(e.completed)?e.completed:[],dismissed:Array.isArray(e.dismissed)?e.dismissed:[]}}}catch(t){console.error("[torchlit] Failed to load state:",t)}return{completed:[],dismissed:[]}}saveState(){try{this.storage.setItem(this.storageKey,JSON.stringify(this.persistedState))}catch(t){console.error("[torchlit] Failed to save state:",t)}}register(t){Array.isArray(t)?t.forEach(e=>this.tours.set(e.id,e)):this.tours.set(t.id,t)}getTour(t){return this.tours.get(t)}getAvailableTours(){return Array.from(this.tours.values())}shouldAutoStart(t){const e=this.tours.get(t);return!e||e.trigger!=="first-visit"?!1:!this.persistedState.completed.includes(t)&&!this.persistedState.dismissed.includes(t)}isActive(){return this.activeTourId!==null}start(t){const e=this.tours.get(t);!e||e.steps.length===0||(this.activeTourId=t,this.currentStepIndex=0,this.notify())}nextStep(){if(!this.activeTourId)return;const t=this.tours.get(this.activeTourId);this.currentStepIndex<t.steps.length-1?(this.currentStepIndex++,this.notify()):t.loop?(this.currentStepIndex=0,this.notify()):this.completeTour()}prevStep(){this.activeTourId&&this.currentStepIndex>0&&(this.currentStepIndex--,this.notify())}skipTour(){var s;if(!this.activeTourId)return;const t=this.activeTourId,e=this.tours.get(t);this.persistedState.dismissed.includes(t)||(this.persistedState.dismissed.push(t),this.saveState()),this.activeTourId=null,this.currentStepIndex=0,this.notify(),(s=e==null?void 0:e.onSkip)==null||s.call(e)}completeTour(){var s;if(!this.activeTourId)return;const t=this.activeTourId,e=this.tours.get(t);this.persistedState.completed.includes(t)||(this.persistedState.completed.push(t),this.saveState()),this.activeTourId=null,this.currentStepIndex=0,this.notify(),(s=e==null?void 0:e.onComplete)==null||s.call(e)}getSnapshot(){if(!this.activeTourId)return null;const t=this.tours.get(this.activeTourId);if(!t)return null;const e=t.steps[this.currentStepIndex];if(!e)return null;const s=this.findTarget(e.target),o=(s==null?void 0:s.getBoundingClientRect())??null;return{tourId:this.activeTourId,tourName:t.name,step:e,stepIndex:this.currentStepIndex,totalSteps:t.steps.length,targetRect:o,targetElement:s}}findTarget(t){return H(`[${this.targetAttribute}="${t}"]`,document.body)}subscribe(t){return this.listeners.add(t),()=>this.listeners.delete(t)}notify(){const t=this.getSnapshot();this.listeners.forEach(e=>e(t))}resetAll(){this.persistedState={completed:[],dismissed:[]},this.activeTourId=null,this.currentStepIndex=0,this.tours.clear(),this.saveState(),this.notify()}}function Ft(r){return new Ut(r)}/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const K=globalThis,st=K.ShadowRoot&&(K.ShadyCSS===void 0||K.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,ot=Symbol(),lt=new WeakMap;let _t=class{constructor(t,e,s){if(this._$cssResult$=!0,s!==ot)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(st&&t===void 0){const s=e!==void 0&&e.length===1;s&&(t=lt.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),s&&lt.set(e,t))}return t}toString(){return this.cssText}};const zt=r=>new _t(typeof r=="string"?r:r+"",void 0,ot),jt=(r,...t)=>{const e=r.length===1?r[0]:t.reduce((s,o,n)=>s+(i=>{if(i._$cssResult$===!0)return i.cssText;if(typeof i=="number")return i;throw Error("Value passed to 'css' function must be a 'css' function result: "+i+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(o)+r[n+1],r[0]);return new _t(e,r,ot)},Wt=(r,t)=>{if(st)r.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const e of t){const s=document.createElement("style"),o=K.litNonce;o!==void 0&&s.setAttribute("nonce",o),s.textContent=e.cssText,r.appendChild(s)}},ct=st?r=>r:r=>r instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return zt(e)})(r):r;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:Vt,defineProperty:Kt,getOwnPropertyDescriptor:Gt,getOwnPropertyNames:Yt,getOwnPropertySymbols:Jt,getPrototypeOf:Qt}=Object,S=globalThis,dt=S.trustedTypes,Zt=dt?dt.emptyScript:"",X=S.reactiveElementPolyfillSupport,q=(r,t)=>r,G={toAttribute(r,t){switch(t){case Boolean:r=r?Zt:null;break;case Object:case Array:r=r==null?r:JSON.stringify(r)}return r},fromAttribute(r,t){let e=r;switch(t){case Boolean:e=r!==null;break;case Number:e=r===null?null:Number(r);break;case Object:case Array:try{e=JSON.parse(r)}catch{e=null}}return e}},it=(r,t)=>!Vt(r,t),ut={attribute:!0,type:String,converter:G,reflect:!1,useDefault:!1,hasChanged:it};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),S.litPropertyMetadata??(S.litPropertyMetadata=new WeakMap);let O=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??(this.l=[])).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=ut){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const s=Symbol(),o=this.getPropertyDescriptor(t,s,e);o!==void 0&&Kt(this.prototype,t,o)}}static getPropertyDescriptor(t,e,s){const{get:o,set:n}=Gt(this.prototype,t)??{get(){return this[e]},set(i){this[e]=i}};return{get:o,set(i){const a=o==null?void 0:o.call(this);n==null||n.call(this,i),this.requestUpdate(t,a,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??ut}static _$Ei(){if(this.hasOwnProperty(q("elementProperties")))return;const t=Qt(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(q("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(q("properties"))){const e=this.properties,s=[...Yt(e),...Jt(e)];for(const o of s)this.createProperty(o,e[o])}const t=this[Symbol.metadata];if(t!==null){const e=litPropertyMetadata.get(t);if(e!==void 0)for(const[s,o]of e)this.elementProperties.set(s,o)}this._$Eh=new Map;for(const[e,s]of this.elementProperties){const o=this._$Eu(e,s);o!==void 0&&this._$Eh.set(o,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const s=new Set(t.flat(1/0).reverse());for(const o of s)e.unshift(ct(o))}else t!==void 0&&e.push(ct(t));return e}static _$Eu(t,e){const s=e.attribute;return s===!1?void 0:typeof s=="string"?s:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){var t;this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),(t=this.constructor.l)==null||t.forEach(e=>e(this))}addController(t){var e;(this._$EO??(this._$EO=new Set)).add(t),this.renderRoot!==void 0&&this.isConnected&&((e=t.hostConnected)==null||e.call(t))}removeController(t){var e;(e=this._$EO)==null||e.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const s of e.keys())this.hasOwnProperty(s)&&(t.set(s,this[s]),delete this[s]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Wt(t,this.constructor.elementStyles),t}connectedCallback(){var t;this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),(t=this._$EO)==null||t.forEach(e=>{var s;return(s=e.hostConnected)==null?void 0:s.call(e)})}enableUpdating(t){}disconnectedCallback(){var t;(t=this._$EO)==null||t.forEach(e=>{var s;return(s=e.hostDisconnected)==null?void 0:s.call(e)})}attributeChangedCallback(t,e,s){this._$AK(t,s)}_$ET(t,e){var n;const s=this.constructor.elementProperties.get(t),o=this.constructor._$Eu(t,s);if(o!==void 0&&s.reflect===!0){const i=(((n=s.converter)==null?void 0:n.toAttribute)!==void 0?s.converter:G).toAttribute(e,s.type);this._$Em=t,i==null?this.removeAttribute(o):this.setAttribute(o,i),this._$Em=null}}_$AK(t,e){var n,i;const s=this.constructor,o=s._$Eh.get(t);if(o!==void 0&&this._$Em!==o){const a=s.getPropertyOptions(o),l=typeof a.converter=="function"?{fromAttribute:a.converter}:((n=a.converter)==null?void 0:n.fromAttribute)!==void 0?a.converter:G;this._$Em=o;const c=l.fromAttribute(e,a.type);this[o]=c??((i=this._$Ej)==null?void 0:i.get(o))??c,this._$Em=null}}requestUpdate(t,e,s,o=!1,n){var i;if(t!==void 0){const a=this.constructor;if(o===!1&&(n=this[t]),s??(s=a.getPropertyOptions(t)),!((s.hasChanged??it)(n,e)||s.useDefault&&s.reflect&&n===((i=this._$Ej)==null?void 0:i.get(t))&&!this.hasAttribute(a._$Eu(t,s))))return;this.C(t,e,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:s,reflect:o,wrapped:n},i){s&&!(this._$Ej??(this._$Ej=new Map)).has(t)&&(this._$Ej.set(t,i??e??this[t]),n!==!0||i!==void 0)||(this._$AL.has(t)||(this.hasUpdated||s||(e=void 0),this._$AL.set(t,e)),o===!0&&this._$Em!==t&&(this._$Eq??(this._$Eq=new Set)).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var s;if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(const[n,i]of this._$Ep)this[n]=i;this._$Ep=void 0}const o=this.constructor.elementProperties;if(o.size>0)for(const[n,i]of o){const{wrapped:a}=i,l=this[n];a!==!0||this._$AL.has(n)||l===void 0||this.C(n,void 0,i,l)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),(s=this._$EO)==null||s.forEach(o=>{var n;return(n=o.hostUpdate)==null?void 0:n.call(o)}),this.update(e)):this._$EM()}catch(o){throw t=!1,this._$EM(),o}t&&this._$AE(e)}willUpdate(t){}_$AE(t){var e;(e=this._$EO)==null||e.forEach(s=>{var o;return(o=s.hostUpdated)==null?void 0:o.call(s)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&(this._$Eq=this._$Eq.forEach(e=>this._$ET(e,this[e]))),this._$EM()}updated(t){}firstUpdated(t){}};O.elementStyles=[],O.shadowRootOptions={mode:"open"},O[q("elementProperties")]=new Map,O[q("finalized")]=new Map,X==null||X({ReactiveElement:O}),(S.reactiveElementVersions??(S.reactiveElementVersions=[])).push("2.1.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const U=globalThis,ht=r=>r,Y=U.trustedTypes,pt=Y?Y.createPolicy("lit-html",{createHTML:r=>r}):void 0,kt="$lit$",A=`lit$${Math.random().toFixed(9).slice(2)}$`,Tt="?"+A,Xt=`<${Tt}>`,P=document,z=()=>P.createComment(""),j=r=>r===null||typeof r!="object"&&typeof r!="function",nt=Array.isArray,te=r=>nt(r)||typeof(r==null?void 0:r[Symbol.iterator])=="function",tt=`[ 	
\f\r]`,D=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,gt=/-->/g,mt=/>/g,x=RegExp(`>|${tt}(?:([^\\s"'>=/]+)(${tt}*=${tt}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),ft=/'/g,vt=/"/g,Ct=/^(?:script|style|textarea|title)$/i,ee=r=>(t,...e)=>({_$litType$:r,strings:t,values:e}),v=ee(1),M=Symbol.for("lit-noChange"),g=Symbol.for("lit-nothing"),yt=new WeakMap,C=P.createTreeWalker(P,129);function Lt(r,t){if(!nt(r)||!r.hasOwnProperty("raw"))throw Error("invalid template strings array");return pt!==void 0?pt.createHTML(t):t}const re=(r,t)=>{const e=r.length-1,s=[];let o,n=t===2?"<svg>":t===3?"<math>":"",i=D;for(let a=0;a<e;a++){const l=r[a];let c,u,d=-1,p=0;for(;p<l.length&&(i.lastIndex=p,u=i.exec(l),u!==null);)p=i.lastIndex,i===D?u[1]==="!--"?i=gt:u[1]!==void 0?i=mt:u[2]!==void 0?(Ct.test(u[2])&&(o=RegExp("</"+u[2],"g")),i=x):u[3]!==void 0&&(i=x):i===x?u[0]===">"?(i=o??D,d=-1):u[1]===void 0?d=-2:(d=i.lastIndex-u[2].length,c=u[1],i=u[3]===void 0?x:u[3]==='"'?vt:ft):i===vt||i===ft?i=x:i===gt||i===mt?i=D:(i=x,o=void 0);const h=i===x&&r[a+1].startsWith("/>")?" ":"";n+=i===D?l+Xt:d>=0?(s.push(c),l.slice(0,d)+kt+l.slice(d)+A+h):l+A+(d===-2?a:h)}return[Lt(r,n+(r[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),s]};class W{constructor({strings:t,_$litType$:e},s){let o;this.parts=[];let n=0,i=0;const a=t.length-1,l=this.parts,[c,u]=re(t,e);if(this.el=W.createElement(c,s),C.currentNode=this.el.content,e===2||e===3){const d=this.el.content.firstChild;d.replaceWith(...d.childNodes)}for(;(o=C.nextNode())!==null&&l.length<a;){if(o.nodeType===1){if(o.hasAttributes())for(const d of o.getAttributeNames())if(d.endsWith(kt)){const p=u[i++],h=o.getAttribute(d).split(A),m=/([.?@])?(.*)/.exec(p);l.push({type:1,index:n,name:m[2],strings:h,ctor:m[1]==="."?oe:m[1]==="?"?ie:m[1]==="@"?ne:J}),o.removeAttribute(d)}else d.startsWith(A)&&(l.push({type:6,index:n}),o.removeAttribute(d));if(Ct.test(o.tagName)){const d=o.textContent.split(A),p=d.length-1;if(p>0){o.textContent=Y?Y.emptyScript:"";for(let h=0;h<p;h++)o.append(d[h],z()),C.nextNode(),l.push({type:2,index:++n});o.append(d[p],z())}}}else if(o.nodeType===8)if(o.data===Tt)l.push({type:2,index:n});else{let d=-1;for(;(d=o.data.indexOf(A,d+1))!==-1;)l.push({type:7,index:n}),d+=A.length-1}n++}}static createElement(t,e){const s=P.createElement("template");return s.innerHTML=t,s}}function B(r,t,e=r,s){var i,a;if(t===M)return t;let o=s!==void 0?(i=e._$Co)==null?void 0:i[s]:e._$Cl;const n=j(t)?void 0:t._$litDirective$;return(o==null?void 0:o.constructor)!==n&&((a=o==null?void 0:o._$AO)==null||a.call(o,!1),n===void 0?o=void 0:(o=new n(r),o._$AT(r,e,s)),s!==void 0?(e._$Co??(e._$Co=[]))[s]=o:e._$Cl=o),o!==void 0&&(t=B(r,o._$AS(r,t.values),o,s)),t}class se{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:s}=this._$AD,o=((t==null?void 0:t.creationScope)??P).importNode(e,!0);C.currentNode=o;let n=C.nextNode(),i=0,a=0,l=s[0];for(;l!==void 0;){if(i===l.index){let c;l.type===2?c=new V(n,n.nextSibling,this,t):l.type===1?c=new l.ctor(n,l.name,l.strings,this,t):l.type===6&&(c=new ae(n,this,t)),this._$AV.push(c),l=s[++a]}i!==(l==null?void 0:l.index)&&(n=C.nextNode(),i++)}return C.currentNode=P,o}p(t){let e=0;for(const s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(t,s,e),e+=s.strings.length-2):s._$AI(t[e])),e++}}class V{get _$AU(){var t;return((t=this._$AM)==null?void 0:t._$AU)??this._$Cv}constructor(t,e,s,o){this.type=2,this._$AH=g,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=s,this.options=o,this._$Cv=(o==null?void 0:o.isConnected)??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return e!==void 0&&(t==null?void 0:t.nodeType)===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=B(this,t,e),j(t)?t===g||t==null||t===""?(this._$AH!==g&&this._$AR(),this._$AH=g):t!==this._$AH&&t!==M&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):te(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==g&&j(this._$AH)?this._$AA.nextSibling.data=t:this.T(P.createTextNode(t)),this._$AH=t}$(t){var n;const{values:e,_$litType$:s}=t,o=typeof s=="number"?this._$AC(t):(s.el===void 0&&(s.el=W.createElement(Lt(s.h,s.h[0]),this.options)),s);if(((n=this._$AH)==null?void 0:n._$AD)===o)this._$AH.p(e);else{const i=new se(o,this),a=i.u(this.options);i.p(e),this.T(a),this._$AH=i}}_$AC(t){let e=yt.get(t.strings);return e===void 0&&yt.set(t.strings,e=new W(t)),e}k(t){nt(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let s,o=0;for(const n of t)o===e.length?e.push(s=new V(this.O(z()),this.O(z()),this,this.options)):s=e[o],s._$AI(n),o++;o<e.length&&(this._$AR(s&&s._$AB.nextSibling,o),e.length=o)}_$AR(t=this._$AA.nextSibling,e){var s;for((s=this._$AP)==null?void 0:s.call(this,!1,!0,e);t!==this._$AB;){const o=ht(t).nextSibling;ht(t).remove(),t=o}}setConnected(t){var e;this._$AM===void 0&&(this._$Cv=t,(e=this._$AP)==null||e.call(this,t))}}class J{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,s,o,n){this.type=1,this._$AH=g,this._$AN=void 0,this.element=t,this.name=e,this._$AM=o,this.options=n,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=g}_$AI(t,e=this,s,o){const n=this.strings;let i=!1;if(n===void 0)t=B(this,t,e,0),i=!j(t)||t!==this._$AH&&t!==M,i&&(this._$AH=t);else{const a=t;let l,c;for(t=n[0],l=0;l<n.length-1;l++)c=B(this,a[s+l],e,l),c===M&&(c=this._$AH[l]),i||(i=!j(c)||c!==this._$AH[l]),c===g?t=g:t!==g&&(t+=(c??"")+n[l+1]),this._$AH[l]=c}i&&!o&&this.j(t)}j(t){t===g?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class oe extends J{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===g?void 0:t}}class ie extends J{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==g)}}class ne extends J{constructor(t,e,s,o,n){super(t,e,s,o,n),this.type=5}_$AI(t,e=this){if((t=B(this,t,e,0)??g)===M)return;const s=this._$AH,o=t===g&&s!==g||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,n=t!==g&&(s===g||o);o&&this.element.removeEventListener(this.name,this,s),n&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){var e;typeof this._$AH=="function"?this._$AH.call(((e=this.options)==null?void 0:e.host)??this.element,t):this._$AH.handleEvent(t)}}class ae{constructor(t,e,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){B(this,t)}}const et=U.litHtmlPolyfillSupport;et==null||et(W,V),(U.litHtmlVersions??(U.litHtmlVersions=[])).push("3.3.2");const le=(r,t,e)=>{const s=(e==null?void 0:e.renderBefore)??t;let o=s._$litPart$;if(o===void 0){const n=(e==null?void 0:e.renderBefore)??null;s._$litPart$=o=new V(t.insertBefore(z(),n),n,void 0,e??{})}return o._$AI(r),o};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const I=globalThis;let F=class extends O{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var e;const t=super.createRenderRoot();return(e=this.renderOptions).renderBefore??(e.renderBefore=t.firstChild),t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=le(e,this.renderRoot,this.renderOptions)}connectedCallback(){var t;super.connectedCallback(),(t=this._$Do)==null||t.setConnected(!0)}disconnectedCallback(){var t;super.disconnectedCallback(),(t=this._$Do)==null||t.setConnected(!1)}render(){return M}};var $t;F._$litElement$=!0,F.finalized=!0,($t=I.litElementHydrateSupport)==null||$t.call(I,{LitElement:F});const rt=I.litElementPolyfillSupport;rt==null||rt({LitElement:F});(I.litElementVersions??(I.litElementVersions=[])).push("4.2.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const ce=r=>(t,e)=>{e!==void 0?e.addInitializer(()=>{customElements.define(r,t)}):customElements.define(r,t)};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const de={attribute:!0,type:String,converter:G,reflect:!1,hasChanged:it},ue=(r=de,t,e)=>{const{kind:s,metadata:o}=e;let n=globalThis.litPropertyMetadata.get(o);if(n===void 0&&globalThis.litPropertyMetadata.set(o,n=new Map),s==="setter"&&((r=Object.create(r)).wrapped=!0),n.set(e.name,r),s==="accessor"){const{name:i}=e;return{set(a){const l=t.get.call(this);t.set.call(this,a),this.requestUpdate(i,l,r,!0,a)},init(a){return a!==void 0&&this.C(i,void 0,r,a),a}}}if(s==="setter"){const{name:i}=e;return function(a){const l=this[i];t.call(this,a),this.requestUpdate(i,l,r,!0,a)}}throw Error("Unsupported decorator location: "+s)};function It(r){return(t,e)=>typeof e=="object"?ue(r,t,e):((s,o,n)=>{const i=o.hasOwnProperty(n);return o.constructor.createProperty(n,s),i?Object.getOwnPropertyDescriptor(o,n):void 0})(r,t,e)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function Pt(r){return It({...r,state:!0,attribute:!1})}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const he=r=>(...t)=>({_$litDirective$:r,values:t});let pe=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,s){this._$Ct=t,this._$AM=e,this._$Ci=s}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}};/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const ge={},me=(r,t=ge)=>r._$AH=t;/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const fe=he(class extends pe{constructor(){super(...arguments),this.key=g}render(r,t){return this.key=r,t}update(r,[t,e]){return t!==this.key&&(me(r),this.key=t),e}});var ve=Object.defineProperty,ye=Object.getOwnPropertyDescriptor,Q=(r,t,e,s)=>{for(var o=s>1?void 0:s?ye(t,e):t,n=r.length-1,i;n>=0;n--)(i=r[n])&&(o=(s?i(t,e,o):i(o))||o);return s&&o&&ve(t,e,o),o};const E=320,_=270,f=16,N=24,be=3e3;let R=class extends F{constructor(){super(...arguments),this.snapshot=null,this.visible=!1,this.previouslyFocused=null,this.autoAdvanceTimer=null,this.lastResolvedPlacement="bottom",this.scrollRafId=0,this.savedScrollY=0,this.activeTourId=null,this.handleResize=()=>{this.snapshot&&this.service&&(this.snapshot=this.service.getSnapshot())},this.handleScroll=()=>{!this.snapshot||!this.service||this.scrollRafId||(this.scrollRafId=requestAnimationFrame(()=>{this.scrollRafId=0,this.snapshot&&this.service&&(this.snapshot=this.service.getSnapshot())}))},this.handleKeydown=r=>{!this.snapshot||!this.service||(r.key==="Escape"?(r.preventDefault(),this.clearAutoAdvance(),this.service.skipTour()):r.key==="ArrowRight"||r.key==="Enter"?(r.preventDefault(),this.clearAutoAdvance(),this.service.nextStep()):r.key==="ArrowLeft"?(r.preventDefault(),this.clearAutoAdvance(),this.service.prevStep()):r.key==="Tab"&&this.trapFocus(r))},this.handleBackdropClick=()=>{var r;this.clearAutoAdvance(),(r=this.service)==null||r.skipTour()}}connectedCallback(){super.connectedCallback(),this.service&&this.attachService(),window.addEventListener("resize",this.handleResize),window.addEventListener("scroll",this.handleScroll,!0),window.addEventListener("keydown",this.handleKeydown)}disconnectedCallback(){var r;super.disconnectedCallback(),(r=this.unsubscribe)==null||r.call(this),this.clearAutoAdvance(),this.scrollRafId&&cancelAnimationFrame(this.scrollRafId),window.removeEventListener("resize",this.handleResize),window.removeEventListener("scroll",this.handleScroll,!0),window.removeEventListener("keydown",this.handleKeydown)}updated(r){var t;r.has("service")&&this.service&&((t=this.unsubscribe)==null||t.call(this),this.attachService()),this.visible&&this.snapshot&&(this.adjustTooltipPosition(),this.updateComplete.then(()=>{var s;const e=(s=this.shadowRoot)==null?void 0:s.querySelector(".tour-tooltip, .tour-center-card");e==null||e.focus()}))}adjustTooltipPosition(){var i,a,l;if(this.lastResolvedPlacement!=="top")return;const r=(i=this.shadowRoot)==null?void 0:i.querySelector(".tour-tooltip"),t=(a=this.snapshot)==null?void 0:a.targetRect;if(!r||!t)return;const e=((l=this.service)==null?void 0:l.spotlightPadding)??10,s=r.getBoundingClientRect().height,o=t.top-e-f-s,n=Math.max(N,o);r.style.top=`${n}px`}attachService(){this.unsubscribe=this.service.subscribe(r=>this.handleTourChange(r))}clearAutoAdvance(){this.autoAdvanceTimer!==null&&(clearTimeout(this.autoAdvanceTimer),this.autoAdvanceTimer=null)}startAutoAdvance(r){this.clearAutoAdvance(),this.autoAdvanceTimer=setTimeout(()=>{var t;this.autoAdvanceTimer=null,(t=this.service)==null||t.nextStep()},r)}waitForTarget(r,t=be){var n;const s=`[${((n=this.service)==null?void 0:n.targetAttribute)??"data-tour-id"}="${r}"]`,o=H(s,document.body);return o?Promise.resolve(o):new Promise(i=>{let a=!1;const l=new MutationObserver(()=>{const c=H(s,document.body);c&&(a=!0,l.disconnect(),i(c))});l.observe(document.body,{childList:!0,subtree:!0}),setTimeout(()=>{a||(l.disconnect(),i(H(s,document.body)))},t)})}fitsInViewport(r){return r.getBoundingClientRect().height+_+f*2<window.innerHeight}async handleTourChange(r){var t,e;if(this.clearAutoAdvance(),!r){const s=this.activeTourId;this.visible=!1,this.activeTourId=null,setTimeout(()=>{var i;this.snapshot=null,this.previouslyFocused&&(this.previouslyFocused.focus(),this.previouslyFocused=null);const o=s?(i=this.service)==null?void 0:i.getTour(s):null,n=(o==null?void 0:o.onEndScroll)??"restore";n==="restore"?window.scrollTo({top:this.savedScrollY,behavior:"smooth"}):n==="top"&&window.scrollTo({top:0,behavior:"smooth"})},300);return}if(this.snapshot||(document.activeElement instanceof HTMLElement&&(this.previouslyFocused=document.activeElement),this.savedScrollY=window.scrollY,this.activeTourId=r.tourId),r.step.beforeShow)try{await r.step.beforeShow()}catch(s){console.error("[torchlit] beforeShow hook failed:",s)}if(r.step.route&&this.dispatchEvent(new CustomEvent("tour-route-change",{detail:{route:r.step.route},bubbles:!0,composed:!0})),r.step.target&&r.step.target!=="_none_"?(await this.waitForTarget(r.step.target),this.snapshot=this.service.getSnapshot()):this.snapshot=r,(t=this.snapshot)!=null&&t.targetElement){const s=this.snapshot.targetElement.getBoundingClientRect(),o=window.innerHeight,n=this.fitsInViewport(this.snapshot.targetElement),i=this.snapshot.step.placement,a=((e=this.service)==null?void 0:e.spotlightPadding)??10;(n?s.top>=0&&s.bottom<=o&&s.left>=0&&s.right<=window.innerWidth:i==="top"?s.top>=_+f+a&&s.top<o:s.top>=0&&s.top<o)||(await this.scrollAndSettle(this.snapshot.targetElement,i),this.snapshot=this.service.getSnapshot())}requestAnimationFrame(()=>{var s;this.visible=!0,(s=this.snapshot)!=null&&s.step.autoAdvance&&this.startAutoAdvance(this.snapshot.step.autoAdvance)})}scrollAndSettle(r,t){var o;const e=window.innerHeight,s=r.getBoundingClientRect();if(this.fitsInViewport(r))r.scrollIntoView({behavior:"smooth",block:"center",inline:"nearest"});else{const n=((o=this.service)==null?void 0:o.spotlightPadding)??10,i=t==="top"?_+f+n:e*.15,a=window.scrollY+s.top-i;window.scrollTo({top:Math.max(0,a),behavior:"smooth"})}return new Promise(n=>{let i=r.getBoundingClientRect().top,a=0,l=0;const c=setTimeout(()=>{cancelAnimationFrame(l),n()},1500),u=()=>{const d=r.getBoundingClientRect().top;Math.abs(d-i)<1?a++:a=0,i=d,a>=3?(clearTimeout(c),n()):l=requestAnimationFrame(u)};l=requestAnimationFrame(u)})}trapFocus(r){var n,i,a;const t=(n=this.shadowRoot)==null?void 0:n.querySelector(".tour-tooltip, .tour-center-card");if(!t)return;const e=t.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');if(e.length===0)return;const s=e[0],o=e[e.length-1];r.shiftKey?((i=this.shadowRoot)==null?void 0:i.activeElement)===s&&(r.preventDefault(),o.focus()):((a=this.shadowRoot)==null?void 0:a.activeElement)===o&&(r.preventDefault(),s.focus())}bestPlacement(r,t){var l;const e=((l=this.service)==null?void 0:l.spotlightPadding)??10,s=window.innerWidth,o=window.innerHeight,n=c=>{switch(c){case"bottom":return r.bottom+e+f+_<o;case"top":return r.top-e-f-_>0;case"right":return r.right+e+f+E<s;case"left":return r.left-e-f-E>0}},i={top:"bottom",bottom:"top",left:"right",right:"left"},a={top:["left","right"],bottom:["left","right"],left:["top","bottom"],right:["top","bottom"]};if(n(t))return t;if(n(i[t]))return i[t];for(const c of a[t])if(n(c))return c;return t}getTooltipPosition(r,t){var a;const e=((a=this.service)==null?void 0:a.spotlightPadding)??10,s=window.innerHeight,o=Math.max(0,r.top),n=Math.min(s,r.bottom),i=(o+n)/2;switch(t){case"right":return{top:i-80,left:r.right+e+f};case"left":return{top:i-80,left:r.left-e-f-E};case"bottom":return{top:r.bottom+e+f,left:r.left+r.width/2-E/2};case"top":return{top:r.top-e-f,left:r.left+r.width/2-E/2};default:return{top:r.bottom+f,left:r.left}}}clampToViewport(r){return{top:Math.max(N,Math.min(r.top,window.innerHeight-_-N)),left:Math.max(N,Math.min(r.left,window.innerWidth-E-N))}}getArrowClass(r){switch(r){case"right":return"arrow-right";case"left":return"arrow-left";case"bottom":return"arrow-bottom";case"top":return"arrow-top";default:return"arrow-bottom"}}getArrowOffset(r,t,e){if(e==="top"||e==="bottom"){const d=r.left+r.width/2-t.left;return`${Math.max(20,Math.min(d,E-20))}px`}const n=Math.max(0,r.top),i=Math.min(window.innerHeight,r.bottom),l=(n+i)/2-t.top;return`${Math.max(20,Math.min(l,_-20))}px`}render(){var p;if(!this.snapshot)return v``;const{step:r,stepIndex:t,totalSteps:e,targetRect:s}=this.snapshot;if(!s)return this.renderCenteredStep(r,t,e);const o=((p=this.service)==null?void 0:p.spotlightPadding)??10,n=r.spotlightBorderRadius?`border-radius: ${r.spotlightBorderRadius};`:"",i=`
      top: ${s.top-o}px;
      left: ${s.left-o}px;
      width: ${s.width+o*2}px;
      height: ${s.height+o*2}px;
      ${n}
    `,a=this.bestPlacement(s,r.placement);this.lastResolvedPlacement=a;const l=this.clampToViewport(this.getTooltipPosition(s,a)),c=this.getArrowOffset(s,l,a),u=`top: ${l.top}px; left: ${l.left}px;`,d=`Step ${t+1} of ${e}: ${r.title}`;return v`
      <!-- Screen reader announcement -->
      <div class="sr-only" role="status" aria-live="polite" aria-atomic="true">
        ${d}
      </div>

      <div
        class="tour-backdrop ${this.visible?"visible":""}"
        part="backdrop"
        @click=${this.handleBackdropClick}
      ></div>

      <div class="tour-spotlight" part="spotlight" style=${i}></div>

      <div
        class="tour-tooltip ${this.visible?"visible":""}"
        part="tooltip"
        style=${u}
        role="dialog"
        aria-modal="true"
        aria-label="${r.title}"
        aria-describedby="tour-desc"
        tabindex="-1"
      >
        <div class="tour-arrow ${this.getArrowClass(a)}" style="--arrow-offset: ${c}"></div>

        <div class="tour-step-badge" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          Step ${t+1} of ${e}
        </div>

        <h3 class="tour-title">${r.title}</h3>
        <div class="tour-message" id="tour-desc">${r.message}</div>

        ${this.renderProgressDots(t,e)}
        ${this.renderFooter(t,e)}
        ${this.renderAutoProgress(r,t)}
      </div>
    `}renderProgressDots(r,t){return t<=1?g:v`
      <div class="tour-progress" role="group" aria-label="Tour progress">
        ${Array.from({length:t},(e,s)=>v`
          <div
            class="tour-dot ${s===r?"active":s<r?"completed":""}"
            role="presentation"
          ></div>
        `)}
      </div>
    `}renderFooter(r,t,e="Finish",s="Finish tour",o=!0){return v`
      <div class="tour-footer">
        <button
          class="tour-skip"
          aria-label="Skip tour"
          @click=${()=>{this.clearAutoAdvance(),this.service.skipTour()}}
        >
          Skip tour
        </button>
        <div class="tour-nav">
          ${r>0?v`
            <button
              class="tour-btn"
              aria-label="Go to previous step"
              @click=${()=>{this.clearAutoAdvance(),this.service.prevStep()}}
            >
              ${o?v`
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              `:g}
              Back
            </button>
          `:g}
          <button
            class="tour-btn primary"
            aria-label="${r===t-1?s:"Go to next step"}"
            @click=${()=>{this.clearAutoAdvance(),this.service.nextStep()}}
          >
            ${r===t-1?e:"Next"}
            ${r<t-1?v`
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            `:o?v`
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            `:g}
          </button>
        </div>
      </div>
    `}renderAutoProgress(r,t){return r.autoAdvance?fe(t,v`
      <div
        class="tour-auto-progress"
        style="animation: autoAdvanceFill ${r.autoAdvance}ms linear forwards;"
        aria-hidden="true"
      ></div>
    `):g}renderCenteredStep(r,t,e){const s=`Step ${t+1} of ${e}: ${r.title}`;return v`
      <!-- Screen reader announcement -->
      <div class="sr-only" role="status" aria-live="polite" aria-atomic="true">
        ${s}
      </div>

      <div
        class="tour-backdrop ${this.visible?"visible":""}"
        part="backdrop"
        @click=${this.handleBackdropClick}
      ></div>

      <div
        class="tour-center-card ${this.visible?"visible":""}"
        part="center-card"
        role="dialog"
        aria-modal="true"
        aria-label="${r.title}"
        aria-describedby="tour-desc-center"
        tabindex="-1"
      >
        <div class="tour-center-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>

        <h3 class="tour-title">${r.title}</h3>
        <div class="tour-message" id="tour-desc-center">${r.message}</div>

        ${this.renderProgressDots(t,e)}
        ${this.renderFooter(t,e,"Let's go!","Start the tour",!1)}
        ${this.renderAutoProgress(r,t)}
      </div>
    `}};R.styles=jt`
    :host {
      display: block;
    }

    /* ── Visually hidden (sr-only) ─────────────────── */

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    /* ── Backdrop ──────────────────────────────────── */

    .tour-backdrop {
      position: fixed;
      inset: 0;
      z-index: 9998;
      pointer-events: auto;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .tour-backdrop.visible {
      opacity: 1;
    }

    /* ── Spotlight (box-shadow cutout) ─────────────── */

    .tour-spotlight {
      position: fixed;
      z-index: 9999;
      border-radius: var(--tour-spotlight-radius, var(--radius-lg, 0.75rem));
      box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.55);
      transition: top 0.35s cubic-bezier(0.4, 0, 0.2, 1),
                  left 0.35s cubic-bezier(0.4, 0, 0.2, 1),
                  width 0.35s cubic-bezier(0.4, 0, 0.2, 1),
                  height 0.35s cubic-bezier(0.4, 0, 0.2, 1);
      pointer-events: none;
    }

    /* Subtle pulsing ring around spotlight */
    .tour-spotlight::after {
      content: '';
      position: absolute;
      inset: -4px;
      border-radius: inherit;
      border: 2px solid var(--tour-primary, var(--primary, #F26122));
      opacity: 0.5;
      animation: spotlightPulse 2s ease-in-out infinite;
    }

    @keyframes spotlightPulse {
      0%, 100% { opacity: 0.3; transform: scale(1); }
      50% { opacity: 0.7; transform: scale(1.01); }
    }

    /* ── Tooltip ───────────────────────────────────── */

    .tour-tooltip {
      position: fixed;
      z-index: 10000;
      box-sizing: border-box;
      width: 320px;
      background: var(--tour-card, var(--card, #fff));
      border: 1px solid var(--tour-border, var(--border, #e5e5e5));
      border-radius: var(--tour-tooltip-radius, var(--radius-lg, 0.75rem));
      box-shadow: 0 20px 40px -8px rgba(0, 0, 0, 0.2),
                  0 8px 16px -4px rgba(0, 0, 0, 0.1);
      padding: 1.25rem;
      pointer-events: auto;
      opacity: 0;
      transform: translateY(8px) scale(0.96);
      transition: opacity 0.25s ease, transform 0.25s ease,
                  top 0.35s cubic-bezier(0.4, 0, 0.2, 1),
                  left 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .tour-tooltip:focus {
      outline: none;
    }

    .tour-tooltip.visible {
      opacity: 1;
      transform: translateY(0) scale(1);
    }

    /* Arrow — position along edge is set via inline --arrow-offset */
    .tour-arrow {
      position: absolute;
      width: 12px;
      height: 12px;
      background: var(--tour-card, var(--card, #fff));
      border: 1px solid var(--tour-border, var(--border, #e5e5e5));
      transform: rotate(45deg);
    }

    /* tooltip is above target → arrow at bottom of tooltip pointing down */
    .tour-arrow.arrow-top {
      bottom: -7px;
      left: var(--arrow-offset, 50%);
      margin-left: -6px;
      border-top: none;
      border-left: none;
    }

    /* tooltip is below target → arrow at top of tooltip pointing up */
    .tour-arrow.arrow-bottom {
      top: -7px;
      left: var(--arrow-offset, 50%);
      margin-left: -6px;
      border-bottom: none;
      border-right: none;
    }

    /* tooltip is right of target → arrow on left edge pointing left */
    .tour-arrow.arrow-left {
      right: -7px;
      top: var(--arrow-offset, 50%);
      margin-top: -6px;
      border-bottom: none;
      border-left: none;
    }

    /* tooltip is left of target → arrow on right edge pointing right */
    .tour-arrow.arrow-right {
      left: -7px;
      top: var(--arrow-offset, 50%);
      margin-top: -6px;
      border-top: none;
      border-right: none;
    }

    /* ── Tooltip content ──────────────────────────── */

    .tour-step-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.6875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--tour-primary, var(--primary, #F26122));
      margin-bottom: 0.5rem;
    }

    .tour-title {
      margin: 0 0 0.375rem;
      font-size: 1rem;
      font-weight: 600;
      color: var(--tour-foreground, var(--foreground, #1a1a1a));
      line-height: 1.3;
    }

    .tour-message {
      margin: 0 0 1rem;
      font-size: 0.8125rem;
      color: var(--tour-muted-foreground, var(--muted-foreground, #737373));
      line-height: 1.55;
    }

    /* ── Progress dots ────────────────────────────── */

    .tour-progress {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      margin-bottom: 1rem;
    }

    .tour-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--tour-muted, var(--muted, #e5e5e5));
      transition: background 0.2s, transform 0.2s;
    }

    .tour-dot.active {
      background: var(--tour-primary, var(--primary, #F26122));
      transform: scale(1.3);
    }

    .tour-dot.completed {
      background: var(--tour-primary, var(--primary, #F26122));
      opacity: 0.5;
    }

    /* ── Auto-advance progress bar ────────────────── */

    .tour-auto-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      max-width: 100%;
      height: 3px;
      background: var(--tour-primary, var(--primary, #F26122));
      opacity: 0.7;
      border-radius: 0 0 var(--tour-tooltip-radius, var(--radius-lg, 0.75rem)) var(--tour-tooltip-radius, var(--radius-lg, 0.75rem));
    }

    @keyframes autoAdvanceFill {
      from { width: 0%; }
      to { width: 100%; }
    }

    /* ── Footer buttons ───────────────────────────── */

    .tour-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .tour-skip {
      font-size: 0.75rem;
      color: var(--tour-muted-foreground, var(--muted-foreground, #737373));
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.25rem 0;
      transition: color 0.15s;
    }

    .tour-skip:hover {
      color: var(--tour-foreground, var(--foreground, #1a1a1a));
    }

    .tour-nav {
      display: flex;
      gap: 0.5rem;
    }

    .tour-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.4rem 0.875rem;
      font-size: 0.8125rem;
      font-weight: 500;
      border-radius: var(--tour-btn-radius, var(--radius-md, 0.5rem));
      border: 1px solid var(--tour-border, var(--border, #e5e5e5));
      background: var(--tour-background, var(--background, #fff));
      color: var(--tour-foreground, var(--foreground, #1a1a1a));
      cursor: pointer;
      transition: all 0.15s;
    }

    .tour-btn:hover {
      background: var(--tour-muted, var(--muted, #f5f5f5));
    }

    .tour-btn:focus-visible {
      outline: 2px solid var(--tour-primary, var(--primary, #F26122));
      outline-offset: 2px;
    }

    .tour-btn.primary {
      background: var(--tour-primary, var(--primary, #F26122));
      color: var(--tour-primary-foreground, var(--primary-foreground, #fff));
      border-color: var(--tour-primary, var(--primary, #F26122));
    }

    .tour-btn.primary:hover {
      opacity: 0.9;
    }

    .tour-btn svg {
      width: 14px;
      height: 14px;
    }

    /* ── Welcome / no-target step ─────────────────── */

    .tour-center-card {
      position: fixed;
      z-index: 10000;
      box-sizing: border-box;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0.96);
      width: 400px;
      max-width: calc(100vw - 2rem);
      background: var(--tour-card, var(--card, #fff));
      border: 1px solid var(--tour-border, var(--border, #e5e5e5));
      border-radius: var(--tour-card-radius, var(--radius-xl, 1rem));
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      padding: 2rem;
      text-align: center;
      pointer-events: auto;
      opacity: 0;
      transition: opacity 0.3s ease, transform 0.3s ease;
    }

    .tour-center-card:focus {
      outline: none;
    }

    .tour-center-card.visible {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }

    .tour-center-icon {
      width: 48px;
      height: 48px;
      margin: 0 auto 1rem;
      background: var(--tour-primary, var(--primary, #F26122));
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--tour-primary-foreground, var(--primary-foreground, #fff));
    }
  `;Q([It({attribute:!1})],R.prototype,"service",2);Q([Pt()],R.prototype,"snapshot",2);Q([Pt()],R.prototype,"visible",2);R=Q([ce("torchlit-overlay")],R);customElements.get("torchlit-overlay")||customElements.define("torchlit-overlay",R);const b=Ft({storageKey:"torchlit-docs"}),Rt=document.querySelector("torchlit-overlay");Rt.service=b;function L(r){document.querySelectorAll(".page").forEach(s=>s.classList.remove("active")),document.querySelectorAll(".nav-item").forEach(s=>s.classList.remove("active"));const t=document.getElementById(`page-${r}`),e=document.querySelector(`.nav-item[data-page="${r}"]`);t&&t.classList.add("active"),e&&e.classList.add("active")}window.switchPage=L;document.querySelectorAll(".nav-item").forEach(r=>{r.addEventListener("click",()=>{L(r.dataset.page),Mt()})});const Ot=document.querySelector(".sidebar"),at=document.getElementById("sidebar-backdrop"),we=document.getElementById("btn-menu");function Mt(){Ot.classList.remove("open"),at.classList.remove("visible")}we.addEventListener("click",()=>{const r=Ot.classList.toggle("open");at.classList.toggle("visible",r)});at.addEventListener("click",Mt);Rt.addEventListener("tour-route-change",r=>{L(r.detail.route)});b.register([{id:"onboarding",name:"Welcome Tour",trigger:"first-visit",steps:[{target:"_none_",title:"Welcome to the Torchlit Docs!",message:"This site is both the documentation and a live demo of Torchlit. Let's take a quick tour. Use arrow keys or click Next.",placement:"bottom"},{target:"nav-overview",title:"Overview",message:"The docs home page with install instructions, key stats, and a quick-start snippet.",placement:"right"},{target:"overview-stats",title:"At a Glance",message:"Key metrics about Torchlit — bundle size, dependencies, and framework support. The spotlight highlights exactly what you need.",placement:"bottom",beforeShow:()=>L("overview")},{target:"overview-features",title:"Key Features",message:"Shadow DOM traversal, framework-agnostic design, CSS theming, and a tiny bundle. These cards detail what makes Torchlit different.",placement:"top",beforeShow:()=>L("overview")},{target:"nav-guide",title:"Getting Started",message:"The step-by-step setup guide — install, configure, and launch your first tour.",placement:"right"},{target:"nav-recipes",title:"Recipes",message:"Ready-to-copy patterns for React, Vue, Svelte, kiosk mode, multi-page apps, shadow DOM targets, and more.",placement:"right"},{target:"guide-demo",title:"Interactive Examples",message:"The spotlight followed you to a new page! Try these live demos — each one shows a different Torchlit feature with its code.",placement:"top",beforeShow:()=>L("styling")},{target:"header-help",title:"Contextual Help",message:"Click the ? button anytime for page-specific help. Each section has its own help tour. You're all set!",placement:"bottom",beforeShow:()=>L("overview")}],onComplete:()=>console.log("[docs] Onboarding complete!"),onSkip:()=>console.log("[docs] Onboarding skipped")},{id:"overview-help",name:"Overview Help",trigger:"manual",steps:[{target:"overview-stats",title:"Quick Stats",message:"Key metrics about Torchlit at a glance — bundle size, peer dependency, and framework support.",placement:"bottom"},{target:"overview-features",title:"Feature Highlights",message:"Each card describes a core feature. Hover them for a subtle lift effect — all CSS, no JavaScript.",placement:"top"},{target:"header-theme",title:"Theme Toggle",message:"Switch between light and dark mode. The tour overlay adapts automatically via CSS custom properties — zero config.",placement:"bottom"}]},{id:"guide-help",name:"Getting Started Help",trigger:"manual",steps:[{target:"guide-search",title:"Search Docs",message:"Filter the guide steps by keyword — type to narrow down what you need.",placement:"bottom"},{target:"nav-styling",title:"See It In Action",message:"Head to the Styling page for interactive examples you can run live, plus a theme playground and CSS custom property reference.",placement:"right"}]},{id:"api-help",name:"API Reference Help",trigger:"manual",steps:[{target:"api-search",title:"Jump to Symbol",message:'Type a method name, property, or type to jump straight to it — works like Cmd+K. Try "nextStep" or "autoAdvance".',placement:"bottom"},{target:"api-service",title:"Quick Navigation",message:"Use these pills to jump to any section: TourService, Overlay, Types, or deepQuery.",placement:"bottom"}]},{id:"styling-help",name:"Styling Help",trigger:"manual",steps:[{target:"guide-demo",title:"Interactive Examples",message:"Run live demos right here and click View Code to see the configuration behind each one.",placement:"top"},{target:"styling-search",title:"Search",message:"Jump to any CSS property or section — start typing to filter.",placement:"bottom"},{target:"styling-props",title:"CSS Custom Properties",message:"All the CSS variables you can set — each has a --tour-* prefix, a generic fallback, and a sensible default.",placement:"top"},{target:"styling-dark",title:"Dark Mode",message:"Override the fallback tokens in a .dark class or prefers-color-scheme media query — zero JS needed.",placement:"top"},{target:"styling-parts",title:"::part() Selectors",message:"For deeper customization beyond colors — change shadows, borders, or add glow effects to the spotlight.",placement:"top"}]},{id:"recipes-help",name:"Recipes Help",trigger:"manual",steps:[{target:"recipes-search",title:"Search Recipes",message:'Type a keyword like "React", "kiosk", or "shadow" to filter recipes instantly.',placement:"bottom"},{target:"recipes-frameworks",title:"Framework Integration",message:"Ready-to-copy setup code for React, Vue, Svelte, and plain JS/TS.",placement:"top"},{target:"recipes-spa",title:"SPA & Routing",message:"Patterns for tours that span multiple views in single-page apps.",placement:"top"},{target:"recipes-kiosk",title:"Kiosk Mode",message:"Auto-advancing, looping tours for demos and digital signage.",placement:"top"},{target:"recipes-storage",title:"Custom Storage",message:"Swap localStorage for sessionStorage or an API-backed adapter.",placement:"top"}]}]);const $e={overview:"overview-help",guide:"guide-help",recipes:"recipes-help",api:"api-help",styling:"styling-help"};document.getElementById("btn-help").addEventListener("click",()=>{var e;const r=((e=document.querySelector(".nav-item.active"))==null?void 0:e.dataset.page)||"overview",t=$e[r];t&&b.start(t)});document.getElementById("btn-theme").addEventListener("click",()=>{document.documentElement.classList.toggle("dark")});document.getElementById("btn-reset").addEventListener("click",()=>{b.resetAll(),location.reload()});const bt=document.querySelector('[data-tour-id="guide-search"] input');bt&&bt.addEventListener("input",r=>{const t=r.target.value.trim().toLowerCase(),e=document.getElementById("page-guide");if(!e)return;e.querySelectorAll(".step, .doc-section").forEach(o=>{var i;if(!t){o.style.display="";return}const n=((i=o.textContent)==null?void 0:i.toLowerCase())??"";o.style.display=n.includes(t)?"":"none"})});const wt=document.getElementById("recipes-search-input");wt&&wt.addEventListener("input",r=>{const t=r.target.value.trim().toLowerCase(),e=document.getElementById("page-recipes");if(!e)return;e.querySelectorAll(".doc-section").forEach(o=>{var i,a,l;const n=o.querySelectorAll(".recipe-sub");if(n.length===0){if(!t){o.style.display="";return}const c=((i=o.textContent)==null?void 0:i.toLowerCase())??"";o.style.display=c.includes(t)?"":"none"}else{let c=!1;if(n.forEach(d=>{var m;if(!t){d.style.display="",c=!0;return}const h=(((m=d.textContent)==null?void 0:m.toLowerCase())??"").includes(t);d.style.display=h?"":"none",h&&(c=!0)}),!t){o.style.display="";return}((((a=o.querySelector(".section-title"))==null?void 0:a.textContent)??"").toLowerCase()+(((l=o.querySelector(".section-title + .doc-text"))==null?void 0:l.textContent)??"").toLowerCase()).includes(t)&&(c=!0),o.style.display=c?"":"none"}})});const k=document.getElementById("api-search-input"),w=document.getElementById("api-search-results");if(k&&w){let s=function(i){return t.filter(a=>a.text.includes(i)).sort((a,l)=>{const c=a.label.toLowerCase().startsWith(i)?0:1,u=l.label.toLowerCase().startsWith(i)?0:1;return c-u||a.label.localeCompare(l.label)}).slice(0,8)},o=function(i){if(w.replaceChildren(),i.length===0){w.classList.remove("open"),e=-1;return}e=0,i.forEach((a,l)=>{const c=document.createElement("div");c.className="api-search-result"+(l===0?" active":""),c.dataset.idx=String(l);const u=document.createElement("code");if(u.textContent=a.label,c.appendChild(u),a.context){const d=document.createElement("span");d.className="result-context",d.textContent=a.context,c.appendChild(d)}c.addEventListener("click",()=>n(a)),w.appendChild(c)}),w.classList.add("open")},n=function(i){w.classList.remove("open"),k.value="",i.element.scrollIntoView({behavior:"smooth",block:"center"}),i.element.classList.remove("highlight-flash"),i.element.offsetWidth,i.element.classList.add("highlight-flash"),setTimeout(()=>i.element.classList.remove("highlight-flash"),1600)};var _e=s,ke=o,Te=n;const r=document.getElementById("page-api"),t=[];r&&(r.querySelectorAll(".ref-table tbody tr").forEach(i=>{var d,p,h;const a=i.querySelector("code");if(!a)return;const l=a.textContent??"";let c="",u=(d=i.closest("table"))==null?void 0:d.previousElementSibling;for(;u;){if((p=u.classList)!=null&&p.contains("subsection-title")||(h=u.classList)!=null&&h.contains("section-title")){c=u.textContent??"";break}u=u.previousElementSibling}t.push({label:l,context:c,element:i,text:(l+" "+(i.textContent??"")).toLowerCase()})}),r.querySelectorAll(".subsection-title").forEach(i=>{const a=i.textContent??"";t.push({label:a,context:"Section",element:i,text:a.toLowerCase()})}));let e=-1;k.addEventListener("input",()=>{const i=k.value.trim().toLowerCase();if(!i){o([]);return}o(s(i))}),k.addEventListener("keydown",i=>{var l,c,u,d;const a=w.querySelectorAll(".api-search-result");if(a.length)if(i.key==="ArrowDown")i.preventDefault(),(l=a[e])==null||l.classList.remove("active"),e=(e+1)%a.length,(c=a[e])==null||c.classList.add("active");else if(i.key==="ArrowUp")i.preventDefault(),(u=a[e])==null||u.classList.remove("active"),e=(e-1+a.length)%a.length,(d=a[e])==null||d.classList.add("active");else if(i.key==="Enter"){i.preventDefault();const p=k.value.trim().toLowerCase(),h=s(p);h[e]&&n(h[e])}else i.key==="Escape"&&(o([]),k.blur())}),document.addEventListener("click",i=>{i.target.closest('[data-tour-id="api-search"]')||w.classList.remove("open")})}(function(){const t=document.getElementById("pg-preview"),e=document.getElementById("pg-code-output"),s=document.getElementById("pg-code"),o=document.getElementById("pg-code-toggle"),n=document.getElementById("pg-reset");if(!t)return;const i={primary:{css:"--tour-primary",pg:"--pg-primary"},"primary-fg":{css:"--tour-primary-foreground",pg:"--pg-primary-fg"},card:{css:"--tour-card",pg:"--pg-card"},foreground:{css:"--tour-foreground",pg:"--pg-foreground"},border:{css:"--tour-border",pg:"--pg-border"},muted:{css:"--tour-muted",pg:"--pg-muted"},"muted-fg":{css:"--tour-muted-foreground",pg:"--pg-muted-fg"},background:{css:"--tour-background",pg:"--pg-background"},"tooltip-radius":{css:"--tour-tooltip-radius",pg:"--pg-tooltip-radius"},"btn-radius":{css:"--tour-btn-radius",pg:"--pg-btn-radius"}},a={primary:"#F26122","primary-fg":"#ffffff",card:"#ffffff",foreground:"#1a1a1a",border:"#e5e5e5",muted:"#e5e5e5","muted-fg":"#737373",background:"#ffffff","tooltip-radius":"0.75rem","btn-radius":"0.5rem"},l={...a};function c(){Object.keys(l).forEach(h=>{const m=i[h];m&&t.style.setProperty(m.pg,l[h])})}function u(){const h=Object.keys(l).filter(y=>l[y]!==a[y]);return h.length===0?"/* No changes — using defaults */":`torchlit-overlay {
${h.map(y=>`  ${i[y].css}: ${l[y]};`).join(`
`)}
}`}function d(){e.textContent=u(),typeof Prism<"u"&&Prism.highlightElement(e)}function p(h,m){l[h]=m;const y=document.querySelector(`[data-pg="${h}"]`),Z=document.querySelector(`[data-pg-text="${h}"]`);y&&y.value!==m&&(y.value=m),Z&&Z.value!==m&&(Z.value=m),c(),d()}document.querySelectorAll("[data-pg]").forEach(h=>{h.addEventListener("input",()=>p(h.dataset.pg,h.value))}),document.querySelectorAll("[data-pg-text]").forEach(h=>{h.addEventListener("input",()=>{const m=h.dataset.pgText;l[m]=h.value;const y=document.querySelector(`[data-pg="${m}"]`);y&&/^#[0-9a-f]{6}$/i.test(h.value)&&(y.value=h.value),c(),d()})}),o.addEventListener("click",()=>{const h=u();navigator.clipboard.writeText(h).then(()=>{const m=o.innerHTML;o.innerHTML='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Copied!',setTimeout(()=>{o.innerHTML=m},1500)}),s.classList.toggle("open")}),n.addEventListener("click",()=>{Object.keys(a).forEach(h=>p(h,a[h]))}),c(),d()})();const T=document.getElementById("styling-search-input"),$=document.getElementById("styling-search-results");if(T&&$){let s=function(i){return t.filter(a=>a.text.includes(i)).sort((a,l)=>{const c=a.label.toLowerCase().startsWith(i)?0:1,u=l.label.toLowerCase().startsWith(i)?0:1;return c-u||a.label.localeCompare(l.label)}).slice(0,8)},o=function(i){if($.replaceChildren(),i.length===0){$.classList.remove("open"),e=-1;return}e=0,i.forEach((a,l)=>{const c=document.createElement("div");c.className="api-search-result"+(l===0?" active":""),c.dataset.idx=String(l);const u=document.createElement("code");if(u.textContent=a.label,c.appendChild(u),a.context){const d=document.createElement("span");d.className="result-context",d.textContent=a.context,c.appendChild(d)}c.addEventListener("click",()=>n(a)),$.appendChild(c)}),$.classList.add("open")},n=function(i){$.classList.remove("open"),T.value="",i.element.scrollIntoView({behavior:"smooth",block:"center"}),i.element.classList.remove("highlight-flash"),i.element.offsetWidth,i.element.classList.add("highlight-flash"),setTimeout(()=>i.element.classList.remove("highlight-flash"),1600)};var Ce=s,Le=o,Ie=n;const r=document.getElementById("page-styling"),t=[];r&&(r.querySelectorAll(".ref-table tbody tr").forEach(i=>{var d,p,h;const a=i.querySelector("code");if(!a)return;const l=a.textContent??"";let c="",u=(d=i.closest("table"))==null?void 0:d.previousElementSibling;for(;u;){if((p=u.classList)!=null&&p.contains("subsection-title")||(h=u.classList)!=null&&h.contains("section-title")){c=u.textContent??"";break}u=u.previousElementSibling}t.push({label:l,context:c,element:i,text:(l+" "+(i.textContent??"")).toLowerCase()})}),r.querySelectorAll(".section-title").forEach(i=>{const a=i.textContent??"";t.push({label:a,context:"Section",element:i,text:a.toLowerCase()})}));let e=-1;T.addEventListener("input",()=>{const i=T.value.trim().toLowerCase();if(!i){o([]);return}o(s(i))}),T.addEventListener("keydown",i=>{var l,c,u,d;const a=$.querySelectorAll(".api-search-result");if(a.length)if(i.key==="ArrowDown")i.preventDefault(),(l=a[e])==null||l.classList.remove("active"),e=(e+1)%a.length,(c=a[e])==null||c.classList.add("active");else if(i.key==="ArrowUp")i.preventDefault(),(u=a[e])==null||u.classList.remove("active"),e=(e-1+a.length)%a.length,(d=a[e])==null||d.classList.add("active");else if(i.key==="Enter"){i.preventDefault();const p=T.value.trim().toLowerCase(),h=s(p);h[e]&&n(h[e])}else i.key==="Escape"&&(o([]),T.blur())}),document.addEventListener("click",i=>{i.target.closest('[data-tour-id="styling-search"]')||$.classList.remove("open")})}document.querySelectorAll(".demo-tab").forEach(r=>{r.addEventListener("click",()=>{var t;document.querySelectorAll(".demo-tab").forEach(e=>e.classList.remove("active")),document.querySelectorAll(".demo-content").forEach(e=>e.classList.remove("active")),r.classList.add("active"),(t=document.getElementById("demo-"+r.dataset.demo))==null||t.classList.add("active")})});document.querySelectorAll(".code-toggle").forEach(r=>{r.addEventListener("click",()=>{const t=document.getElementById(r.dataset.target);if(t){const e=t.classList.toggle("visible");r.querySelector("svg").style.transform=e?"rotate(90deg)":""}})});b.register([{id:"demo-basic",name:"Basic Demo",trigger:"manual",steps:[{target:"demo-nav",title:"Navigation",message:"The main navigation bar lets you move between pages.",placement:"bottom"},{target:"demo-search",title:"Search",message:"Quickly find anything with the global search.",placement:"bottom"},{target:"demo-profile",title:"Profile",message:"Manage your account settings here.",placement:"bottom"}]},{id:"demo-rich",name:"Rich Content Demo",trigger:"manual",steps:[{target:"demo-editor",title:"Editor",message:v`Write content here. Use <strong>bold</strong>, <em>italic</em>, and <code>code</code> formatting.`,placement:"bottom"},{target:"demo-toolbar",title:"Toolbar",message:v`Shortcuts: <kbd>Ctrl+B</kbd> Bold &nbsp; <kbd>Ctrl+I</kbd> Italic &nbsp; <kbd>Ctrl+K</kbd> Link`,placement:"bottom"}]},{id:"demo-auto",name:"Auto-Advance Demo",trigger:"manual",loop:!0,steps:[{target:"demo-slide-1",title:"Slide 1",message:"This tour auto-advances every 2.5 seconds.",placement:"bottom",autoAdvance:2500},{target:"demo-slide-2",title:"Slide 2",message:"No clicks needed — perfect for kiosk / demo modes.",placement:"bottom",autoAdvance:2500},{target:"demo-slide-3",title:"Slide 3",message:"With loop: true, it restarts from the beginning.",placement:"bottom",autoAdvance:2500}]},{id:"demo-shapes",name:"Shapes Demo",trigger:"manual",steps:[{target:"demo-avatar",title:"Circle",message:'spotlightBorderRadius: "50%" gives a circular cutout.',placement:"bottom",spotlightBorderRadius:"50%"},{target:"demo-pill",title:"Pill",message:'spotlightBorderRadius: "9999px" creates a pill shape.',placement:"bottom",spotlightBorderRadius:"9999px"},{target:"demo-square",title:"Square",message:'spotlightBorderRadius: "0" for sharp corners.',placement:"bottom",spotlightBorderRadius:"0"}]}]);var At;(At=document.getElementById("run-basic"))==null||At.addEventListener("click",()=>b.start("demo-basic"));var St;(St=document.getElementById("run-rich"))==null||St.addEventListener("click",()=>b.start("demo-rich"));var xt;(xt=document.getElementById("run-auto"))==null||xt.addEventListener("click",()=>b.start("demo-auto"));var Et;(Et=document.getElementById("run-shapes"))==null||Et.addEventListener("click",()=>b.start("demo-shapes"));b.shouldAutoStart("onboarding")&&setTimeout(()=>b.start("onboarding"),800);
