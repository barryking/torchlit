(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))r(i);new MutationObserver(i=>{for(const o of i)if(o.type==="childList")for(const n of o.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&r(n)}).observe(document,{childList:!0,subtree:!0});function e(i){const o={};return i.integrity&&(o.integrity=i.integrity),i.referrerPolicy&&(o.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?o.credentials="include":i.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function r(i){if(i.ep)return;i.ep=!0;const o=e(i);fetch(i.href,o)}})();function lt(s,t=document.body){const e=t.querySelector(s);if(e)return e;const r=t.querySelectorAll("*");for(const i of r)if(i.shadowRoot){const o=lt(s,i.shadowRoot);if(o)return o}return null}const vt="torchlit-state",yt="data-tour-id",bt=10,$t={getItem:()=>null,setItem:()=>{}};function _t(){try{const s="__torchlit_test__";return localStorage.setItem(s,s),localStorage.removeItem(s),localStorage}catch{return $t}}class wt{constructor(t={}){this.tours=new Map,this.activeTourId=null,this.currentStepIndex=0,this.listeners=new Set,this.storageKey=t.storageKey??vt,this.storage=t.storage??_t(),this.targetAttribute=t.targetAttribute??yt,this.spotlightPadding=t.spotlightPadding??bt,this.persistedState=this.loadState()}loadState(){try{const t=this.storage.getItem(this.storageKey);if(t){const e=JSON.parse(t);return{completed:Array.isArray(e.completed)?e.completed:[],dismissed:Array.isArray(e.dismissed)?e.dismissed:[]}}}catch(t){console.error("[torchlit] Failed to load state:",t)}return{completed:[],dismissed:[]}}saveState(){try{this.storage.setItem(this.storageKey,JSON.stringify(this.persistedState))}catch(t){console.error("[torchlit] Failed to save state:",t)}}register(t){Array.isArray(t)?t.forEach(e=>this.tours.set(e.id,e)):this.tours.set(t.id,t)}getTour(t){return this.tours.get(t)}getAvailableTours(){return Array.from(this.tours.values())}shouldAutoStart(t){const e=this.tours.get(t);return!e||e.trigger!=="first-visit"?!1:!this.persistedState.completed.includes(t)&&!this.persistedState.dismissed.includes(t)}isActive(){return this.activeTourId!==null}start(t){const e=this.tours.get(t);!e||e.steps.length===0||(this.activeTourId=t,this.currentStepIndex=0,this.notify())}nextStep(){if(!this.activeTourId)return;const t=this.tours.get(this.activeTourId);this.currentStepIndex<t.steps.length-1?(this.currentStepIndex++,this.notify()):this.completeTour()}prevStep(){this.activeTourId&&this.currentStepIndex>0&&(this.currentStepIndex--,this.notify())}skipTour(){var r;if(!this.activeTourId)return;const t=this.activeTourId,e=this.tours.get(t);this.persistedState.dismissed.includes(t)||(this.persistedState.dismissed.push(t),this.saveState()),this.activeTourId=null,this.currentStepIndex=0,this.notify(),(r=e==null?void 0:e.onSkip)==null||r.call(e)}completeTour(){var r;if(!this.activeTourId)return;const t=this.activeTourId,e=this.tours.get(t);this.persistedState.completed.includes(t)||(this.persistedState.completed.push(t),this.saveState()),this.activeTourId=null,this.currentStepIndex=0,this.notify(),(r=e==null?void 0:e.onComplete)==null||r.call(e)}getSnapshot(){if(!this.activeTourId)return null;const t=this.tours.get(this.activeTourId);if(!t)return null;const e=t.steps[this.currentStepIndex];if(!e)return null;const r=this.findTarget(e.target),i=(r==null?void 0:r.getBoundingClientRect())??null;return{tourId:this.activeTourId,tourName:t.name,step:e,stepIndex:this.currentStepIndex,totalSteps:t.steps.length,targetRect:i,targetElement:r}}findTarget(t){return lt(`[${this.targetAttribute}="${t}"]`,document.body)}subscribe(t){return this.listeners.add(t),()=>this.listeners.delete(t)}notify(){const t=this.getSnapshot();this.listeners.forEach(e=>e(t))}resetAll(){this.persistedState={completed:[],dismissed:[]},this.activeTourId=null,this.currentStepIndex=0,this.tours.clear(),this.saveState(),this.notify()}}function At(s){return new wt(s)}/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const U=globalThis,F=U.ShadowRoot&&(U.ShadyCSS===void 0||U.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,G=Symbol(),Y=new WeakMap;let ct=class{constructor(t,e,r){if(this._$cssResult$=!0,r!==G)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(F&&t===void 0){const r=e!==void 0&&e.length===1;r&&(t=Y.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),r&&Y.set(e,t))}return t}toString(){return this.cssText}};const St=s=>new ct(typeof s=="string"?s:s+"",void 0,G),xt=(s,...t)=>{const e=s.length===1?s[0]:t.reduce((r,i,o)=>r+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+s[o+1],s[0]);return new ct(e,s,G)},Et=(s,t)=>{if(F)s.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const e of t){const r=document.createElement("style"),i=U.litNonce;i!==void 0&&r.setAttribute("nonce",i),r.textContent=e.cssText,s.appendChild(r)}},Z=F?s=>s:s=>s instanceof CSSStyleSheet?(t=>{let e="";for(const r of t.cssRules)e+=r.cssText;return St(e)})(s):s;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:kt,defineProperty:Tt,getOwnPropertyDescriptor:Pt,getOwnPropertyNames:Ct,getOwnPropertySymbols:Ot,getPrototypeOf:It}=Object,v=globalThis,Q=v.trustedTypes,Rt=Q?Q.emptyScript:"",j=v.reactiveElementPolyfillSupport,T=(s,t)=>s,H={toAttribute(s,t){switch(t){case Boolean:s=s?Rt:null;break;case Object:case Array:s=s==null?s:JSON.stringify(s)}return s},fromAttribute(s,t){let e=s;switch(t){case Boolean:e=s!==null;break;case Number:e=s===null?null:Number(s);break;case Object:case Array:try{e=JSON.parse(s)}catch{e=null}}return e}},K=(s,t)=>!kt(s,t),X={attribute:!0,type:String,converter:H,reflect:!1,useDefault:!1,hasChanged:K};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),v.litPropertyMetadata??(v.litPropertyMetadata=new WeakMap);let A=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??(this.l=[])).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=X){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const r=Symbol(),i=this.getPropertyDescriptor(t,r,e);i!==void 0&&Tt(this.prototype,t,i)}}static getPropertyDescriptor(t,e,r){const{get:i,set:o}=Pt(this.prototype,t)??{get(){return this[e]},set(n){this[e]=n}};return{get:i,set(n){const l=i==null?void 0:i.call(this);o==null||o.call(this,n),this.requestUpdate(t,l,r)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??X}static _$Ei(){if(this.hasOwnProperty(T("elementProperties")))return;const t=It(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(T("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(T("properties"))){const e=this.properties,r=[...Ct(e),...Ot(e)];for(const i of r)this.createProperty(i,e[i])}const t=this[Symbol.metadata];if(t!==null){const e=litPropertyMetadata.get(t);if(e!==void 0)for(const[r,i]of e)this.elementProperties.set(r,i)}this._$Eh=new Map;for(const[e,r]of this.elementProperties){const i=this._$Eu(e,r);i!==void 0&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const r=new Set(t.flat(1/0).reverse());for(const i of r)e.unshift(Z(i))}else t!==void 0&&e.push(Z(t));return e}static _$Eu(t,e){const r=e.attribute;return r===!1?void 0:typeof r=="string"?r:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){var t;this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),(t=this.constructor.l)==null||t.forEach(e=>e(this))}addController(t){var e;(this._$EO??(this._$EO=new Set)).add(t),this.renderRoot!==void 0&&this.isConnected&&((e=t.hostConnected)==null||e.call(t))}removeController(t){var e;(e=this._$EO)==null||e.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const r of e.keys())this.hasOwnProperty(r)&&(t.set(r,this[r]),delete this[r]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Et(t,this.constructor.elementStyles),t}connectedCallback(){var t;this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),(t=this._$EO)==null||t.forEach(e=>{var r;return(r=e.hostConnected)==null?void 0:r.call(e)})}enableUpdating(t){}disconnectedCallback(){var t;(t=this._$EO)==null||t.forEach(e=>{var r;return(r=e.hostDisconnected)==null?void 0:r.call(e)})}attributeChangedCallback(t,e,r){this._$AK(t,r)}_$ET(t,e){var o;const r=this.constructor.elementProperties.get(t),i=this.constructor._$Eu(t,r);if(i!==void 0&&r.reflect===!0){const n=(((o=r.converter)==null?void 0:o.toAttribute)!==void 0?r.converter:H).toAttribute(e,r.type);this._$Em=t,n==null?this.removeAttribute(i):this.setAttribute(i,n),this._$Em=null}}_$AK(t,e){var o,n;const r=this.constructor,i=r._$Eh.get(t);if(i!==void 0&&this._$Em!==i){const l=r.getPropertyOptions(i),a=typeof l.converter=="function"?{fromAttribute:l.converter}:((o=l.converter)==null?void 0:o.fromAttribute)!==void 0?l.converter:H;this._$Em=i;const h=a.fromAttribute(e,l.type);this[i]=h??((n=this._$Ej)==null?void 0:n.get(i))??h,this._$Em=null}}requestUpdate(t,e,r,i=!1,o){var n;if(t!==void 0){const l=this.constructor;if(i===!1&&(o=this[t]),r??(r=l.getPropertyOptions(t)),!((r.hasChanged??K)(o,e)||r.useDefault&&r.reflect&&o===((n=this._$Ej)==null?void 0:n.get(t))&&!this.hasAttribute(l._$Eu(t,r))))return;this.C(t,e,r)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:r,reflect:i,wrapped:o},n){r&&!(this._$Ej??(this._$Ej=new Map)).has(t)&&(this._$Ej.set(t,n??e??this[t]),o!==!0||n!==void 0)||(this._$AL.has(t)||(this.hasUpdated||r||(e=void 0),this._$AL.set(t,e)),i===!0&&this._$Em!==t&&(this._$Eq??(this._$Eq=new Set)).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var r;if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(const[o,n]of this._$Ep)this[o]=n;this._$Ep=void 0}const i=this.constructor.elementProperties;if(i.size>0)for(const[o,n]of i){const{wrapped:l}=n,a=this[o];l!==!0||this._$AL.has(o)||a===void 0||this.C(o,void 0,n,a)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),(r=this._$EO)==null||r.forEach(i=>{var o;return(o=i.hostUpdate)==null?void 0:o.call(i)}),this.update(e)):this._$EM()}catch(i){throw t=!1,this._$EM(),i}t&&this._$AE(e)}willUpdate(t){}_$AE(t){var e;(e=this._$EO)==null||e.forEach(r=>{var i;return(i=r.hostUpdated)==null?void 0:i.call(r)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&(this._$Eq=this._$Eq.forEach(e=>this._$ET(e,this[e]))),this._$EM()}updated(t){}firstUpdated(t){}};A.elementStyles=[],A.shadowRootOptions={mode:"open"},A[T("elementProperties")]=new Map,A[T("finalized")]=new Map,j==null||j({ReactiveElement:A}),(v.reactiveElementVersions??(v.reactiveElementVersions=[])).push("2.1.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const P=globalThis,tt=s=>s,L=P.trustedTypes,et=L?L.createPolicy("lit-html",{createHTML:s=>s}):void 0,ht="$lit$",m=`lit$${Math.random().toFixed(9).slice(2)}$`,dt="?"+m,Nt=`<${dt}>`,_=document,O=()=>_.createComment(""),I=s=>s===null||typeof s!="object"&&typeof s!="function",J=Array.isArray,Mt=s=>J(s)||typeof(s==null?void 0:s[Symbol.iterator])=="function",q=`[ 	
\f\r]`,k=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,rt=/-->/g,st=/>/g,y=RegExp(`>|${q}(?:([^\\s"'>=/]+)(${q}*=${q}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),it=/'/g,ot=/"/g,ut=/^(?:script|style|textarea|title)$/i,Ut=s=>(t,...e)=>({_$litType$:s,strings:t,values:e}),p=Ut(1),S=Symbol.for("lit-noChange"),d=Symbol.for("lit-nothing"),nt=new WeakMap,b=_.createTreeWalker(_,129);function pt(s,t){if(!J(s)||!s.hasOwnProperty("raw"))throw Error("invalid template strings array");return et!==void 0?et.createHTML(t):t}const Ht=(s,t)=>{const e=s.length-1,r=[];let i,o=t===2?"<svg>":t===3?"<math>":"",n=k;for(let l=0;l<e;l++){const a=s[l];let h,u,c=-1,f=0;for(;f<a.length&&(n.lastIndex=f,u=n.exec(a),u!==null);)f=n.lastIndex,n===k?u[1]==="!--"?n=rt:u[1]!==void 0?n=st:u[2]!==void 0?(ut.test(u[2])&&(i=RegExp("</"+u[2],"g")),n=y):u[3]!==void 0&&(n=y):n===y?u[0]===">"?(n=i??k,c=-1):u[1]===void 0?c=-2:(c=n.lastIndex-u[2].length,h=u[1],n=u[3]===void 0?y:u[3]==='"'?ot:it):n===ot||n===it?n=y:n===rt||n===st?n=k:(n=y,i=void 0);const g=n===y&&s[l+1].startsWith("/>")?" ":"";o+=n===k?a+Nt:c>=0?(r.push(h),a.slice(0,c)+ht+a.slice(c)+m+g):a+m+(c===-2?l:g)}return[pt(s,o+(s[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),r]};class R{constructor({strings:t,_$litType$:e},r){let i;this.parts=[];let o=0,n=0;const l=t.length-1,a=this.parts,[h,u]=Ht(t,e);if(this.el=R.createElement(h,r),b.currentNode=this.el.content,e===2||e===3){const c=this.el.content.firstChild;c.replaceWith(...c.childNodes)}for(;(i=b.nextNode())!==null&&a.length<l;){if(i.nodeType===1){if(i.hasAttributes())for(const c of i.getAttributeNames())if(c.endsWith(ht)){const f=u[n++],g=i.getAttribute(c).split(m),M=/([.?@])?(.*)/.exec(f);a.push({type:1,index:o,name:M[2],strings:g,ctor:M[1]==="."?zt:M[1]==="?"?Dt:M[1]==="@"?Bt:D}),i.removeAttribute(c)}else c.startsWith(m)&&(a.push({type:6,index:o}),i.removeAttribute(c));if(ut.test(i.tagName)){const c=i.textContent.split(m),f=c.length-1;if(f>0){i.textContent=L?L.emptyScript:"";for(let g=0;g<f;g++)i.append(c[g],O()),b.nextNode(),a.push({type:2,index:++o});i.append(c[f],O())}}}else if(i.nodeType===8)if(i.data===dt)a.push({type:2,index:o});else{let c=-1;for(;(c=i.data.indexOf(m,c+1))!==-1;)a.push({type:7,index:o}),c+=m.length-1}o++}}static createElement(t,e){const r=_.createElement("template");return r.innerHTML=t,r}}function x(s,t,e=s,r){var n,l;if(t===S)return t;let i=r!==void 0?(n=e._$Co)==null?void 0:n[r]:e._$Cl;const o=I(t)?void 0:t._$litDirective$;return(i==null?void 0:i.constructor)!==o&&((l=i==null?void 0:i._$AO)==null||l.call(i,!1),o===void 0?i=void 0:(i=new o(s),i._$AT(s,e,r)),r!==void 0?(e._$Co??(e._$Co=[]))[r]=i:e._$Cl=i),i!==void 0&&(t=x(s,i._$AS(s,t.values),i,r)),t}class Lt{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:r}=this._$AD,i=((t==null?void 0:t.creationScope)??_).importNode(e,!0);b.currentNode=i;let o=b.nextNode(),n=0,l=0,a=r[0];for(;a!==void 0;){if(n===a.index){let h;a.type===2?h=new N(o,o.nextSibling,this,t):a.type===1?h=new a.ctor(o,a.name,a.strings,this,t):a.type===6&&(h=new jt(o,this,t)),this._$AV.push(h),a=r[++l]}n!==(a==null?void 0:a.index)&&(o=b.nextNode(),n++)}return b.currentNode=_,i}p(t){let e=0;for(const r of this._$AV)r!==void 0&&(r.strings!==void 0?(r._$AI(t,r,e),e+=r.strings.length-2):r._$AI(t[e])),e++}}class N{get _$AU(){var t;return((t=this._$AM)==null?void 0:t._$AU)??this._$Cv}constructor(t,e,r,i){this.type=2,this._$AH=d,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=r,this.options=i,this._$Cv=(i==null?void 0:i.isConnected)??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return e!==void 0&&(t==null?void 0:t.nodeType)===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=x(this,t,e),I(t)?t===d||t==null||t===""?(this._$AH!==d&&this._$AR(),this._$AH=d):t!==this._$AH&&t!==S&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):Mt(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==d&&I(this._$AH)?this._$AA.nextSibling.data=t:this.T(_.createTextNode(t)),this._$AH=t}$(t){var o;const{values:e,_$litType$:r}=t,i=typeof r=="number"?this._$AC(t):(r.el===void 0&&(r.el=R.createElement(pt(r.h,r.h[0]),this.options)),r);if(((o=this._$AH)==null?void 0:o._$AD)===i)this._$AH.p(e);else{const n=new Lt(i,this),l=n.u(this.options);n.p(e),this.T(l),this._$AH=n}}_$AC(t){let e=nt.get(t.strings);return e===void 0&&nt.set(t.strings,e=new R(t)),e}k(t){J(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let r,i=0;for(const o of t)i===e.length?e.push(r=new N(this.O(O()),this.O(O()),this,this.options)):r=e[i],r._$AI(o),i++;i<e.length&&(this._$AR(r&&r._$AB.nextSibling,i),e.length=i)}_$AR(t=this._$AA.nextSibling,e){var r;for((r=this._$AP)==null?void 0:r.call(this,!1,!0,e);t!==this._$AB;){const i=tt(t).nextSibling;tt(t).remove(),t=i}}setConnected(t){var e;this._$AM===void 0&&(this._$Cv=t,(e=this._$AP)==null||e.call(this,t))}}class D{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,r,i,o){this.type=1,this._$AH=d,this._$AN=void 0,this.element=t,this.name=e,this._$AM=i,this.options=o,r.length>2||r[0]!==""||r[1]!==""?(this._$AH=Array(r.length-1).fill(new String),this.strings=r):this._$AH=d}_$AI(t,e=this,r,i){const o=this.strings;let n=!1;if(o===void 0)t=x(this,t,e,0),n=!I(t)||t!==this._$AH&&t!==S,n&&(this._$AH=t);else{const l=t;let a,h;for(t=o[0],a=0;a<o.length-1;a++)h=x(this,l[r+a],e,a),h===S&&(h=this._$AH[a]),n||(n=!I(h)||h!==this._$AH[a]),h===d?t=d:t!==d&&(t+=(h??"")+o[a+1]),this._$AH[a]=h}n&&!i&&this.j(t)}j(t){t===d?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class zt extends D{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===d?void 0:t}}class Dt extends D{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==d)}}class Bt extends D{constructor(t,e,r,i,o){super(t,e,r,i,o),this.type=5}_$AI(t,e=this){if((t=x(this,t,e,0)??d)===S)return;const r=this._$AH,i=t===d&&r!==d||t.capture!==r.capture||t.once!==r.once||t.passive!==r.passive,o=t!==d&&(r===d||i);i&&this.element.removeEventListener(this.name,this,r),o&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){var e;typeof this._$AH=="function"?this._$AH.call(((e=this.options)==null?void 0:e.host)??this.element,t):this._$AH.handleEvent(t)}}class jt{constructor(t,e,r){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=r}get _$AU(){return this._$AM._$AU}_$AI(t){x(this,t)}}const W=P.litHtmlPolyfillSupport;W==null||W(R,N),(P.litHtmlVersions??(P.litHtmlVersions=[])).push("3.3.2");const qt=(s,t,e)=>{const r=(e==null?void 0:e.renderBefore)??t;let i=r._$litPart$;if(i===void 0){const o=(e==null?void 0:e.renderBefore)??null;r._$litPart$=i=new N(t.insertBefore(O(),o),o,void 0,e??{})}return i._$AI(s),i};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const $=globalThis;class C extends A{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var e;const t=super.createRenderRoot();return(e=this.renderOptions).renderBefore??(e.renderBefore=t.firstChild),t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=qt(e,this.renderRoot,this.renderOptions)}connectedCallback(){var t;super.connectedCallback(),(t=this._$Do)==null||t.setConnected(!0)}disconnectedCallback(){var t;super.disconnectedCallback(),(t=this._$Do)==null||t.setConnected(!1)}render(){return S}}var at;C._$litElement$=!0,C.finalized=!0,(at=$.litElementHydrateSupport)==null||at.call($,{LitElement:C});const V=$.litElementPolyfillSupport;V==null||V({LitElement:C});($.litElementVersions??($.litElementVersions=[])).push("4.2.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Wt=s=>(t,e)=>{e!==void 0?e.addInitializer(()=>{customElements.define(s,t)}):customElements.define(s,t)};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Vt={attribute:!0,type:String,converter:H,reflect:!1,hasChanged:K},Ft=(s=Vt,t,e)=>{const{kind:r,metadata:i}=e;let o=globalThis.litPropertyMetadata.get(i);if(o===void 0&&globalThis.litPropertyMetadata.set(i,o=new Map),r==="setter"&&((s=Object.create(s)).wrapped=!0),o.set(e.name,s),r==="accessor"){const{name:n}=e;return{set(l){const a=t.get.call(this);t.set.call(this,l),this.requestUpdate(n,a,s,!0,l)},init(l){return l!==void 0&&this.C(n,void 0,s,l),l}}}if(r==="setter"){const{name:n}=e;return function(l){const a=this[n];t.call(this,l),this.requestUpdate(n,a,s,!0,l)}}throw Error("Unsupported decorator location: "+r)};function ft(s){return(t,e)=>typeof e=="object"?Ft(s,t,e):((r,i,o)=>{const n=i.hasOwnProperty(o);return i.constructor.createProperty(o,r),n?Object.getOwnPropertyDescriptor(i,o):void 0})(s,t,e)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function gt(s){return ft({...s,state:!0,attribute:!1})}var Gt=Object.defineProperty,Kt=Object.getOwnPropertyDescriptor,B=(s,t,e,r)=>{for(var i=r>1?void 0:r?Kt(t,e):t,o=s.length-1,n;o>=0;o--)(n=s[o])&&(i=(r?n(t,e,i):n(i))||i);return r&&i&&Gt(t,e,i),i};let w=class extends C{constructor(){super(...arguments),this.snapshot=null,this.visible=!1,this.handleResize=()=>{this.snapshot&&this.service&&(this.snapshot=this.service.getSnapshot())},this.handleKeydown=s=>{!this.snapshot||!this.service||(s.key==="Escape"?(s.preventDefault(),this.service.skipTour()):s.key==="ArrowRight"||s.key==="Enter"?(s.preventDefault(),this.service.nextStep()):s.key==="ArrowLeft"&&(s.preventDefault(),this.service.prevStep()))},this.handleBackdropClick=()=>{var s;(s=this.service)==null||s.skipTour()}}connectedCallback(){super.connectedCallback(),this.service&&this.attachService(),window.addEventListener("resize",this.handleResize),window.addEventListener("keydown",this.handleKeydown)}disconnectedCallback(){var s;super.disconnectedCallback(),(s=this.unsubscribe)==null||s.call(this),window.removeEventListener("resize",this.handleResize),window.removeEventListener("keydown",this.handleKeydown)}updated(s){var t;s.has("service")&&this.service&&((t=this.unsubscribe)==null||t.call(this),this.attachService())}attachService(){this.unsubscribe=this.service.subscribe(s=>this.handleTourChange(s))}async handleTourChange(s){if(!s){this.visible=!1,setTimeout(()=>{this.snapshot=null},300);return}if(s.step.beforeShow)try{await s.step.beforeShow()}catch(t){console.error("[torchlit] beforeShow hook failed:",t)}s.step.route?(this.dispatchEvent(new CustomEvent("tour-route-change",{detail:{route:s.step.route},bubbles:!0,composed:!0})),await new Promise(t=>setTimeout(t,350)),this.snapshot=this.service.getSnapshot()):this.snapshot=s,this.scrollTargetIntoView(),requestAnimationFrame(()=>{this.visible=!0})}scrollTargetIntoView(){var s;(s=this.snapshot)!=null&&s.targetElement&&(this.snapshot.targetElement.scrollIntoView({behavior:"smooth",block:"center",inline:"nearest"}),setTimeout(()=>{this.service&&(this.snapshot=this.service.getSnapshot())},400))}getTooltipPosition(s,t){var o;const e=((o=this.service)==null?void 0:o.spotlightPadding)??10,r=16,i=320;switch(t){case"right":return{top:s.top+s.height/2-80,left:s.right+e+r};case"left":return{top:s.top+s.height/2-80,left:s.left-e-r-i};case"bottom":return{top:s.bottom+e+r,left:s.left+s.width/2-i/2};case"top":return{top:s.top-e-r-180,left:s.left+s.width/2-i/2};default:return{top:s.bottom+r,left:s.left}}}clampToViewport(s){return{top:Math.max(16,Math.min(s.top,window.innerHeight-250)),left:Math.max(16,Math.min(s.left,window.innerWidth-320-16))}}getArrowClass(s){switch(s){case"right":return"arrow-right";case"left":return"arrow-left";case"bottom":return"arrow-bottom";case"top":return"arrow-top";default:return"arrow-bottom"}}render(){var a;if(!this.snapshot)return p``;const{step:s,stepIndex:t,totalSteps:e,targetRect:r}=this.snapshot;if(!r)return this.renderCenteredStep(s,t,e);const i=((a=this.service)==null?void 0:a.spotlightPadding)??10,o=`
      top: ${r.top-i}px;
      left: ${r.left-i}px;
      width: ${r.width+i*2}px;
      height: ${r.height+i*2}px;
    `,n=this.clampToViewport(this.getTooltipPosition(r,s.placement)),l=`top: ${n.top}px; left: ${n.left}px;`;return p`
      <div
        class="tour-backdrop ${this.visible?"visible":""}"
        part="backdrop"
        @click=${this.handleBackdropClick}
      ></div>

      <div class="tour-spotlight" part="spotlight" style=${o}></div>

      <div class="tour-tooltip ${this.visible?"visible":""}" part="tooltip" style=${l}>
        <div class="tour-arrow ${this.getArrowClass(s.placement)}"></div>

        <div class="tour-step-badge">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          Step ${t+1} of ${e}
        </div>

        <h3 class="tour-title">${s.title}</h3>
        <p class="tour-message">${s.message}</p>

        ${this.renderProgressDots(t,e)}

        <div class="tour-footer">
          <button class="tour-skip" @click=${()=>this.service.skipTour()}>
            Skip tour
          </button>
          <div class="tour-nav">
            ${t>0?p`
              <button class="tour-btn" @click=${()=>this.service.prevStep()}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
                Back
              </button>
            `:""}
            <button class="tour-btn primary" @click=${()=>this.service.nextStep()}>
              ${t===e-1?"Finish":"Next"}
              ${t<e-1?p`
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              `:p`
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              `}
            </button>
          </div>
        </div>
      </div>
    `}renderProgressDots(s,t){return t<=1?p``:p`
      <div class="tour-progress">
        ${Array.from({length:t},(e,r)=>p`
          <div class="tour-dot ${r===s?"active":r<s?"completed":""}"></div>
        `)}
      </div>
    `}renderCenteredStep(s,t,e){return p`
      <div
        class="tour-backdrop ${this.visible?"visible":""}"
        part="backdrop"
        @click=${this.handleBackdropClick}
      ></div>

      <div class="tour-center-card ${this.visible?"visible":""}" part="center-card">
        <div class="tour-center-icon">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>

        <h3 class="tour-title">${s.title}</h3>
        <p class="tour-message">${s.message}</p>

        ${this.renderProgressDots(t,e)}

        <div class="tour-footer">
          <button class="tour-skip" @click=${()=>this.service.skipTour()}>
            Skip tour
          </button>
          <div class="tour-nav">
            ${t>0?p`
              <button class="tour-btn" @click=${()=>this.service.prevStep()}>Back</button>
            `:""}
            <button class="tour-btn primary" @click=${()=>this.service.nextStep()}>
              ${t===e-1?"Let's go!":"Next"}
              ${t<e-1?p`
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              `:""}
            </button>
          </div>
        </div>
      </div>
    `}};w.styles=xt`
    :host {
      display: block;
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
      border: 2px solid var(--tour-primary, var(--primary, oklch(0.65 0.17 220)));
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

    .tour-tooltip.visible {
      opacity: 1;
      transform: translateY(0) scale(1);
    }

    /* Arrow */
    .tour-arrow {
      position: absolute;
      width: 12px;
      height: 12px;
      background: var(--tour-card, var(--card, #fff));
      border: 1px solid var(--tour-border, var(--border, #e5e5e5));
      transform: rotate(45deg);
    }

    .tour-arrow.arrow-top {
      bottom: -7px;
      left: 50%;
      margin-left: -6px;
      border-top: none;
      border-left: none;
    }

    .tour-arrow.arrow-bottom {
      top: -7px;
      left: 50%;
      margin-left: -6px;
      border-bottom: none;
      border-right: none;
    }

    .tour-arrow.arrow-left {
      right: -7px;
      top: 50%;
      margin-top: -6px;
      border-bottom: none;
      border-left: none;
    }

    .tour-arrow.arrow-right {
      left: -7px;
      top: 50%;
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
      color: var(--tour-primary, var(--primary, oklch(0.65 0.17 220)));
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
      background: var(--tour-primary, var(--primary, oklch(0.65 0.17 220)));
      transform: scale(1.3);
    }

    .tour-dot.completed {
      background: var(--tour-primary, var(--primary, oklch(0.65 0.17 220)));
      opacity: 0.5;
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

    .tour-btn.primary {
      background: var(--tour-primary, var(--primary, oklch(0.65 0.17 220)));
      color: var(--tour-primary-foreground, var(--primary-foreground, #fff));
      border-color: var(--tour-primary, var(--primary, oklch(0.65 0.17 220)));
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

    .tour-center-card.visible {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }

    .tour-center-icon {
      width: 48px;
      height: 48px;
      margin: 0 auto 1rem;
      background: var(--tour-primary, var(--primary, oklch(0.65 0.17 220)));
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--tour-primary-foreground, var(--primary-foreground, #fff));
    }
  `;B([ft({attribute:!1})],w.prototype,"service",2);B([gt()],w.prototype,"snapshot",2);B([gt()],w.prototype,"visible",2);w=B([Wt("torchlit-overlay")],w);customElements.get("torchlit-overlay")||customElements.define("torchlit-overlay",w);const E=At({storageKey:"torchlit-demo"}),mt=document.querySelector("torchlit-overlay");mt.service=E;function z(s){document.querySelectorAll(".page").forEach(r=>r.classList.remove("active")),document.querySelectorAll(".nav-item").forEach(r=>r.classList.remove("active"));const t=document.getElementById(`page-${s}`),e=document.querySelector(`.nav-item[data-page="${s}"]`);t&&t.classList.add("active"),e&&e.classList.add("active")}document.querySelectorAll(".nav-item").forEach(s=>{s.addEventListener("click",()=>{z(s.dataset.page)})});mt.addEventListener("tour-route-change",s=>{z(s.detail.route)});E.register([{id:"onboarding",name:"Welcome Tour",trigger:"first-visit",steps:[{target:"_none_",title:"Welcome to Torchlit!",message:"This is a quick tour of the demo app. We'll show you the key areas so you can see how guided tours work. Use arrow keys or click Next.",placement:"bottom"},{target:"nav-home",title:"Navigation",message:"The sidebar lets you move between pages. Each page can have its own contextual help tour.",placement:"right"},{target:"home-stats",title:"At-a-Glance Stats",message:"Key metrics are displayed prominently. The spotlight highlights exactly the element you want users to notice.",placement:"bottom"},{target:"home-features",title:"Feature Cards",message:"These cards showcase what makes Torchlit unique. Shadow DOM traversal, framework-agnostic design, tiny bundle size.",placement:"top"},{target:"nav-reports",title:"Reports Page",message:"Tours can switch pages automatically using the route property and beforeShow hooks. Watch — we'll jump to Reports next.",placement:"right"},{target:"reports-chart",title:"Data Visualization",message:"The spotlight followed you to a different page! The tour continued seamlessly across route changes.",placement:"top",beforeShow:()=>z("reports")},{target:"header-help",title:"Need Help?",message:"Click the ? button anytime for contextual help about the current page. You're all set!",placement:"bottom",beforeShow:()=>z("home")}],onComplete:()=>console.log("[demo] Onboarding complete!"),onSkip:()=>console.log("[demo] Onboarding skipped")},{id:"home-help",name:"Home Page Help",trigger:"manual",steps:[{target:"home-stats",title:"Stats Overview",message:"These cards show key metrics about the library: bundle size, dependency count, and framework compatibility.",placement:"bottom"},{target:"home-features",title:"Feature Highlights",message:"Each card describes a key differentiator. Hover them for a subtle lift effect — all CSS, no JS.",placement:"top"},{target:"header-theme",title:"Theme Toggle",message:"Switch between light and dark mode. The tour overlay adapts automatically via CSS custom properties — zero config.",placement:"bottom"}]},{id:"reports-help",name:"Reports Help",trigger:"manual",steps:[{target:"reports-search",title:"Search Reports",message:"Filter reports by keyword. Results update in real-time.",placement:"bottom"},{target:"reports-chart",title:"Chart Area",message:"Interactive charts render here. Click data points for details.",placement:"top"}]},{id:"settings-help",name:"Settings Help",trigger:"manual",steps:[{target:"settings-general",title:"General Settings",message:"Configure language, timezone, and display preferences here.",placement:"bottom"},{target:"settings-notifications",title:"Notification Preferences",message:"Control email alerts, push notifications, and digest frequency.",placement:"bottom"}]},{id:"profile-help",name:"Profile Help",trigger:"manual",steps:[{target:"profile-card",title:"Your Profile",message:"View and edit your account details, avatar, and contact info.",placement:"right"}]}]);const Jt={home:"home-help",reports:"reports-help",settings:"settings-help",profile:"profile-help"};document.getElementById("btn-help").addEventListener("click",()=>{var e;const s=((e=document.querySelector(".nav-item.active"))==null?void 0:e.dataset.page)||"home",t=Jt[s];t&&E.start(t)});document.getElementById("btn-theme").addEventListener("click",()=>{document.documentElement.classList.toggle("dark")});document.getElementById("btn-reset").addEventListener("click",()=>{E.resetAll(),location.reload()});E.shouldAutoStart("onboarding")&&setTimeout(()=>E.start("onboarding"),800);
