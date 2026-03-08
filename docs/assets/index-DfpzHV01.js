(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))s(o);new MutationObserver(o=>{for(const n of o)if(n.type==="childList")for(const i of n.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&s(i)}).observe(document,{childList:!0,subtree:!0});function t(o){const n={};return o.integrity&&(n.integrity=o.integrity),o.referrerPolicy&&(n.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?n.credentials="include":o.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function s(o){if(o.ep)return;o.ep=!0;const n=t(o);fetch(o.href,n)}})();const Ue="torchlit-state",qe="data-tour-id",Ne=10,Fe={getItem:()=>null,setItem:()=>{}};function ze(){try{const r="__torchlit_test__";return localStorage.setItem(r,r),localStorage.removeItem(r),localStorage}catch{return Fe}}class je{constructor(e={}){this.tours=new Map,this.activeTourId=null,this.currentStepIndex=0,this.listeners=new Set,this.storageKey=e.storageKey??Ue,this.storage=e.storage??ze(),this.targetAttribute=e.targetAttribute??qe,this.spotlightPadding=e.spotlightPadding??Ne,this.persistedState=this.loadState()}loadState(){try{const e=this.storage.getItem(this.storageKey);if(e){const t=JSON.parse(e);return{completed:Array.isArray(t.completed)?t.completed:[],dismissed:Array.isArray(t.dismissed)?t.dismissed:[]}}}catch(e){console.error("[torchlit] Failed to load state:",e)}return{completed:[],dismissed:[]}}saveState(){try{this.storage.setItem(this.storageKey,JSON.stringify(this.persistedState))}catch(e){console.error("[torchlit] Failed to save state:",e)}}register(e){if(Array.isArray(e)){e.forEach(t=>this.tours.set(t.id,t));return}this.tours.set(e.id,e)}getTour(e){return this.tours.get(e)}getAvailableTours(){return Array.from(this.tours.values())}shouldAutoStart(e){const t=this.tours.get(e);return!t||t.trigger!=="first-visit"?!1:!this.persistedState.completed.includes(e)&&!this.persistedState.dismissed.includes(e)}isActive(){return this.activeTourId!==null}start(e){const t=this.tours.get(e);!t||t.steps.length===0||(this.activeTourId=e,this.currentStepIndex=0,this.notify())}nextStep(){if(!this.activeTourId)return;const e=this.tours.get(this.activeTourId);if(e){if(this.currentStepIndex<e.steps.length-1){this.currentStepIndex+=1,this.notify();return}if(e.loop){this.currentStepIndex=0,this.notify();return}this.completeTour()}}prevStep(){!this.activeTourId||this.currentStepIndex===0||(this.currentStepIndex-=1,this.notify())}skipTour(){var s;if(!this.activeTourId)return;const e=this.activeTourId,t=this.tours.get(e);this.persistedState.dismissed.includes(e)||(this.persistedState.dismissed.push(e),this.saveState()),this.activeTourId=null,this.currentStepIndex=0,this.notify(),(s=t==null?void 0:t.onSkip)==null||s.call(t)}completeTour(){var s;if(!this.activeTourId)return;const e=this.activeTourId,t=this.tours.get(e);this.persistedState.completed.includes(e)||(this.persistedState.completed.push(e),this.saveState()),this.activeTourId=null,this.currentStepIndex=0,this.notify(),(s=t==null?void 0:t.onComplete)==null||s.call(t)}getSnapshot(){if(!this.activeTourId)return null;const e=this.tours.get(this.activeTourId);if(!e)return null;const t=e.steps[this.currentStepIndex];return t===void 0?null:{tourId:this.activeTourId,tourName:e.name,step:t,stepIndex:this.currentStepIndex,totalSteps:e.steps.length}}subscribe(e){return this.listeners.add(e),()=>this.listeners.delete(e)}resetAll(){this.persistedState={completed:[],dismissed:[]},this.activeTourId=null,this.currentStepIndex=0,this.tours.clear(),this.saveState(),this.notify()}notify(){const e=this.getSnapshot();this.listeners.forEach(t=>t(e))}}function Ve(r){return new je(r)}/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const W=globalThis,oe=W.ShadowRoot&&(W.ShadyCSS===void 0||W.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,ie=Symbol(),ce=new WeakMap;let ke=class{constructor(e,t,s){if(this._$cssResult$=!0,s!==ie)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(oe&&e===void 0){const s=t!==void 0&&t.length===1;s&&(e=ce.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),s&&ce.set(t,e))}return e}toString(){return this.cssText}};const We=r=>new ke(typeof r=="string"?r:r+"",void 0,ie),Ke=(r,...e)=>{const t=r.length===1?r[0]:e.reduce((s,o,n)=>s+(i=>{if(i._$cssResult$===!0)return i.cssText;if(typeof i=="number")return i;throw Error("Value passed to 'css' function must be a 'css' function result: "+i+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(o)+r[n+1],r[0]);return new ke(t,r,ie)},Ge=(r,e)=>{if(oe)r.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const t of e){const s=document.createElement("style"),o=W.litNonce;o!==void 0&&s.setAttribute("nonce",o),s.textContent=t.cssText,r.appendChild(s)}},de=oe?r=>r:r=>r instanceof CSSStyleSheet?(e=>{let t="";for(const s of e.cssRules)t+=s.cssText;return We(t)})(r):r;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:Ye,defineProperty:Je,getOwnPropertyDescriptor:Qe,getOwnPropertyNames:Xe,getOwnPropertySymbols:Ze,getPrototypeOf:et}=Object,A=globalThis,ue=A.trustedTypes,tt=ue?ue.emptyScript:"",ee=A.reactiveElementPolyfillSupport,U=(r,e)=>r,G={toAttribute(r,e){switch(e){case Boolean:r=r?tt:null;break;case Object:case Array:r=r==null?r:JSON.stringify(r)}return r},fromAttribute(r,e){let t=r;switch(e){case Boolean:t=r!==null;break;case Number:t=r===null?null:Number(r);break;case Object:case Array:try{t=JSON.parse(r)}catch{t=null}}return t}},ne=(r,e)=>!Ye(r,e),he={attribute:!0,type:String,converter:G,reflect:!1,useDefault:!1,hasChanged:ne};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),A.litPropertyMetadata??(A.litPropertyMetadata=new WeakMap);let O=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??(this.l=[])).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=he){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const s=Symbol(),o=this.getPropertyDescriptor(e,s,t);o!==void 0&&Je(this.prototype,e,o)}}static getPropertyDescriptor(e,t,s){const{get:o,set:n}=Qe(this.prototype,e)??{get(){return this[t]},set(i){this[t]=i}};return{get:o,set(i){const a=o==null?void 0:o.call(this);n==null||n.call(this,i),this.requestUpdate(e,a,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??he}static _$Ei(){if(this.hasOwnProperty(U("elementProperties")))return;const e=et(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(U("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(U("properties"))){const t=this.properties,s=[...Xe(t),...Ze(t)];for(const o of s)this.createProperty(o,t[o])}const e=this[Symbol.metadata];if(e!==null){const t=litPropertyMetadata.get(e);if(t!==void 0)for(const[s,o]of t)this.elementProperties.set(s,o)}this._$Eh=new Map;for(const[t,s]of this.elementProperties){const o=this._$Eu(t,s);o!==void 0&&this._$Eh.set(o,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const s=new Set(e.flat(1/0).reverse());for(const o of s)t.unshift(de(o))}else e!==void 0&&t.push(de(e));return t}static _$Eu(e,t){const s=t.attribute;return s===!1?void 0:typeof s=="string"?s:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){var e;this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),(e=this.constructor.l)==null||e.forEach(t=>t(this))}addController(e){var t;(this._$EO??(this._$EO=new Set)).add(e),this.renderRoot!==void 0&&this.isConnected&&((t=e.hostConnected)==null||t.call(e))}removeController(e){var t;(t=this._$EO)==null||t.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const s of t.keys())this.hasOwnProperty(s)&&(e.set(s,this[s]),delete this[s]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Ge(e,this.constructor.elementStyles),e}connectedCallback(){var e;this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),(e=this._$EO)==null||e.forEach(t=>{var s;return(s=t.hostConnected)==null?void 0:s.call(t)})}enableUpdating(e){}disconnectedCallback(){var e;(e=this._$EO)==null||e.forEach(t=>{var s;return(s=t.hostDisconnected)==null?void 0:s.call(t)})}attributeChangedCallback(e,t,s){this._$AK(e,s)}_$ET(e,t){var n;const s=this.constructor.elementProperties.get(e),o=this.constructor._$Eu(e,s);if(o!==void 0&&s.reflect===!0){const i=(((n=s.converter)==null?void 0:n.toAttribute)!==void 0?s.converter:G).toAttribute(t,s.type);this._$Em=e,i==null?this.removeAttribute(o):this.setAttribute(o,i),this._$Em=null}}_$AK(e,t){var n,i;const s=this.constructor,o=s._$Eh.get(e);if(o!==void 0&&this._$Em!==o){const a=s.getPropertyOptions(o),l=typeof a.converter=="function"?{fromAttribute:a.converter}:((n=a.converter)==null?void 0:n.fromAttribute)!==void 0?a.converter:G;this._$Em=o;const c=l.fromAttribute(t,a.type);this[o]=c??((i=this._$Ej)==null?void 0:i.get(o))??c,this._$Em=null}}requestUpdate(e,t,s,o=!1,n){var i;if(e!==void 0){const a=this.constructor;if(o===!1&&(n=this[e]),s??(s=a.getPropertyOptions(e)),!((s.hasChanged??ne)(n,t)||s.useDefault&&s.reflect&&n===((i=this._$Ej)==null?void 0:i.get(e))&&!this.hasAttribute(a._$Eu(e,s))))return;this.C(e,t,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:s,reflect:o,wrapped:n},i){s&&!(this._$Ej??(this._$Ej=new Map)).has(e)&&(this._$Ej.set(e,i??t??this[e]),n!==!0||i!==void 0)||(this._$AL.has(e)||(this.hasUpdated||s||(t=void 0),this._$AL.set(e,t)),o===!0&&this._$Em!==e&&(this._$Eq??(this._$Eq=new Set)).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var s;if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(const[n,i]of this._$Ep)this[n]=i;this._$Ep=void 0}const o=this.constructor.elementProperties;if(o.size>0)for(const[n,i]of o){const{wrapped:a}=i,l=this[n];a!==!0||this._$AL.has(n)||l===void 0||this.C(n,void 0,i,l)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),(s=this._$EO)==null||s.forEach(o=>{var n;return(n=o.hostUpdate)==null?void 0:n.call(o)}),this.update(t)):this._$EM()}catch(o){throw e=!1,this._$EM(),o}e&&this._$AE(t)}willUpdate(e){}_$AE(e){var t;(t=this._$EO)==null||t.forEach(s=>{var o;return(o=s.hostUpdated)==null?void 0:o.call(s)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&(this._$Eq=this._$Eq.forEach(t=>this._$ET(t,this[t]))),this._$EM()}updated(e){}firstUpdated(e){}};O.elementStyles=[],O.shadowRootOptions={mode:"open"},O[U("elementProperties")]=new Map,O[U("finalized")]=new Map,ee==null||ee({ReactiveElement:O}),(A.reactiveElementVersions??(A.reactiveElementVersions=[])).push("2.1.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const q=globalThis,pe=r=>r,Y=q.trustedTypes,ge=Y?Y.createPolicy("lit-html",{createHTML:r=>r}):void 0,Ce="$lit$",S=`lit$${Math.random().toFixed(9).slice(2)}$`,Le="?"+S,rt=`<${Le}>`,I=document,F=()=>I.createComment(""),z=r=>r===null||typeof r!="object"&&typeof r!="function",ae=Array.isArray,st=r=>ae(r)||typeof(r==null?void 0:r[Symbol.iterator])=="function",te=`[ 	
\f\r]`,H=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,me=/-->/g,fe=/>/g,E=RegExp(`>|${te}(?:([^\\s"'>=/]+)(${te}*=${te}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),ve=/'/g,ye=/"/g,Pe=/^(?:script|style|textarea|title)$/i,ot=r=>(e,...t)=>({_$litType$:r,strings:e,values:t}),f=ot(1),M=Symbol.for("lit-noChange"),g=Symbol.for("lit-nothing"),be=new WeakMap,k=I.createTreeWalker(I,129);function Ie(r,e){if(!ae(r)||!r.hasOwnProperty("raw"))throw Error("invalid template strings array");return ge!==void 0?ge.createHTML(e):e}const it=(r,e)=>{const t=r.length-1,s=[];let o,n=e===2?"<svg>":e===3?"<math>":"",i=H;for(let a=0;a<t;a++){const l=r[a];let c,u,d=-1,p=0;for(;p<l.length&&(i.lastIndex=p,u=i.exec(l),u!==null);)p=i.lastIndex,i===H?u[1]==="!--"?i=me:u[1]!==void 0?i=fe:u[2]!==void 0?(Pe.test(u[2])&&(o=RegExp("</"+u[2],"g")),i=E):u[3]!==void 0&&(i=E):i===E?u[0]===">"?(i=o??H,d=-1):u[1]===void 0?d=-2:(d=i.lastIndex-u[2].length,c=u[1],i=u[3]===void 0?E:u[3]==='"'?ye:ve):i===ye||i===ve?i=E:i===me||i===fe?i=H:(i=E,o=void 0);const h=i===E&&r[a+1].startsWith("/>")?" ":"";n+=i===H?l+rt:d>=0?(s.push(c),l.slice(0,d)+Ce+l.slice(d)+S+h):l+S+(d===-2?a:h)}return[Ie(r,n+(r[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),s]};class j{constructor({strings:e,_$litType$:t},s){let o;this.parts=[];let n=0,i=0;const a=e.length-1,l=this.parts,[c,u]=it(e,t);if(this.el=j.createElement(c,s),k.currentNode=this.el.content,t===2||t===3){const d=this.el.content.firstChild;d.replaceWith(...d.childNodes)}for(;(o=k.nextNode())!==null&&l.length<a;){if(o.nodeType===1){if(o.hasAttributes())for(const d of o.getAttributeNames())if(d.endsWith(Ce)){const p=u[i++],h=o.getAttribute(d).split(S),m=/([.?@])?(.*)/.exec(p);l.push({type:1,index:n,name:m[2],strings:h,ctor:m[1]==="."?at:m[1]==="?"?lt:m[1]==="@"?ct:J}),o.removeAttribute(d)}else d.startsWith(S)&&(l.push({type:6,index:n}),o.removeAttribute(d));if(Pe.test(o.tagName)){const d=o.textContent.split(S),p=d.length-1;if(p>0){o.textContent=Y?Y.emptyScript:"";for(let h=0;h<p;h++)o.append(d[h],F()),k.nextNode(),l.push({type:2,index:++n});o.append(d[p],F())}}}else if(o.nodeType===8)if(o.data===Le)l.push({type:2,index:n});else{let d=-1;for(;(d=o.data.indexOf(S,d+1))!==-1;)l.push({type:7,index:n}),d+=S.length-1}n++}}static createElement(e,t){const s=I.createElement("template");return s.innerHTML=e,s}}function B(r,e,t=r,s){var i,a;if(e===M)return e;let o=s!==void 0?(i=t._$Co)==null?void 0:i[s]:t._$Cl;const n=z(e)?void 0:e._$litDirective$;return(o==null?void 0:o.constructor)!==n&&((a=o==null?void 0:o._$AO)==null||a.call(o,!1),n===void 0?o=void 0:(o=new n(r),o._$AT(r,t,s)),s!==void 0?(t._$Co??(t._$Co=[]))[s]=o:t._$Cl=o),o!==void 0&&(e=B(r,o._$AS(r,e.values),o,s)),e}class nt{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:s}=this._$AD,o=((e==null?void 0:e.creationScope)??I).importNode(t,!0);k.currentNode=o;let n=k.nextNode(),i=0,a=0,l=s[0];for(;l!==void 0;){if(i===l.index){let c;l.type===2?c=new V(n,n.nextSibling,this,e):l.type===1?c=new l.ctor(n,l.name,l.strings,this,e):l.type===6&&(c=new dt(n,this,e)),this._$AV.push(c),l=s[++a]}i!==(l==null?void 0:l.index)&&(n=k.nextNode(),i++)}return k.currentNode=I,o}p(e){let t=0;for(const s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(e,s,t),t+=s.strings.length-2):s._$AI(e[t])),t++}}class V{get _$AU(){var e;return((e=this._$AM)==null?void 0:e._$AU)??this._$Cv}constructor(e,t,s,o){this.type=2,this._$AH=g,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=s,this.options=o,this._$Cv=(o==null?void 0:o.isConnected)??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return t!==void 0&&(e==null?void 0:e.nodeType)===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=B(this,e,t),z(e)?e===g||e==null||e===""?(this._$AH!==g&&this._$AR(),this._$AH=g):e!==this._$AH&&e!==M&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):st(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==g&&z(this._$AH)?this._$AA.nextSibling.data=e:this.T(I.createTextNode(e)),this._$AH=e}$(e){var n;const{values:t,_$litType$:s}=e,o=typeof s=="number"?this._$AC(e):(s.el===void 0&&(s.el=j.createElement(Ie(s.h,s.h[0]),this.options)),s);if(((n=this._$AH)==null?void 0:n._$AD)===o)this._$AH.p(t);else{const i=new nt(o,this),a=i.u(this.options);i.p(t),this.T(a),this._$AH=i}}_$AC(e){let t=be.get(e.strings);return t===void 0&&be.set(e.strings,t=new j(e)),t}k(e){ae(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let s,o=0;for(const n of e)o===t.length?t.push(s=new V(this.O(F()),this.O(F()),this,this.options)):s=t[o],s._$AI(n),o++;o<t.length&&(this._$AR(s&&s._$AB.nextSibling,o),t.length=o)}_$AR(e=this._$AA.nextSibling,t){var s;for((s=this._$AP)==null?void 0:s.call(this,!1,!0,t);e!==this._$AB;){const o=pe(e).nextSibling;pe(e).remove(),e=o}}setConnected(e){var t;this._$AM===void 0&&(this._$Cv=e,(t=this._$AP)==null||t.call(this,e))}}class J{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,s,o,n){this.type=1,this._$AH=g,this._$AN=void 0,this.element=e,this.name=t,this._$AM=o,this.options=n,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=g}_$AI(e,t=this,s,o){const n=this.strings;let i=!1;if(n===void 0)e=B(this,e,t,0),i=!z(e)||e!==this._$AH&&e!==M,i&&(this._$AH=e);else{const a=e;let l,c;for(e=n[0],l=0;l<n.length-1;l++)c=B(this,a[s+l],t,l),c===M&&(c=this._$AH[l]),i||(i=!z(c)||c!==this._$AH[l]),c===g?e=g:e!==g&&(e+=(c??"")+n[l+1]),this._$AH[l]=c}i&&!o&&this.j(e)}j(e){e===g?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class at extends J{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===g?void 0:e}}class lt extends J{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==g)}}class ct extends J{constructor(e,t,s,o,n){super(e,t,s,o,n),this.type=5}_$AI(e,t=this){if((e=B(this,e,t,0)??g)===M)return;const s=this._$AH,o=e===g&&s!==g||e.capture!==s.capture||e.once!==s.once||e.passive!==s.passive,n=e!==g&&(s===g||o);o&&this.element.removeEventListener(this.name,this,s),n&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){var t;typeof this._$AH=="function"?this._$AH.call(((t=this.options)==null?void 0:t.host)??this.element,e):this._$AH.handleEvent(e)}}class dt{constructor(e,t,s){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(e){B(this,e)}}const re=q.litHtmlPolyfillSupport;re==null||re(j,V),(q.litHtmlVersions??(q.litHtmlVersions=[])).push("3.3.2");const ut=(r,e,t)=>{const s=(t==null?void 0:t.renderBefore)??e;let o=s._$litPart$;if(o===void 0){const n=(t==null?void 0:t.renderBefore)??null;s._$litPart$=o=new V(e.insertBefore(F(),n),n,void 0,t??{})}return o._$AI(r),o};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const L=globalThis;let N=class extends O{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var t;const e=super.createRenderRoot();return(t=this.renderOptions).renderBefore??(t.renderBefore=e.firstChild),e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=ut(t,this.renderRoot,this.renderOptions)}connectedCallback(){var e;super.connectedCallback(),(e=this._$Do)==null||e.setConnected(!0)}disconnectedCallback(){var e;super.disconnectedCallback(),(e=this._$Do)==null||e.setConnected(!1)}render(){return M}};var Ae;N._$litElement$=!0,N.finalized=!0,(Ae=L.litElementHydrateSupport)==null||Ae.call(L,{LitElement:N});const se=L.litElementPolyfillSupport;se==null||se({LitElement:N});(L.litElementVersions??(L.litElementVersions=[])).push("4.2.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const ht=r=>(e,t)=>{t!==void 0?t.addInitializer(()=>{customElements.define(r,e)}):customElements.define(r,e)};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const pt={attribute:!0,type:String,converter:G,reflect:!1,hasChanged:ne},gt=(r=pt,e,t)=>{const{kind:s,metadata:o}=t;let n=globalThis.litPropertyMetadata.get(o);if(n===void 0&&globalThis.litPropertyMetadata.set(o,n=new Map),s==="setter"&&((r=Object.create(r)).wrapped=!0),n.set(t.name,r),s==="accessor"){const{name:i}=t;return{set(a){const l=e.get.call(this);e.set.call(this,a),this.requestUpdate(i,l,r,!0,a)},init(a){return a!==void 0&&this.C(i,void 0,r,a),a}}}if(s==="setter"){const{name:i}=t;return function(a){const l=this[i];e.call(this,a),this.requestUpdate(i,l,r,!0,a)}}throw Error("Unsupported decorator location: "+s)};function Re(r){return(e,t)=>typeof t=="object"?gt(r,e,t):((s,o,n)=>{const i=o.hasOwnProperty(n);return o.constructor.createProperty(n,s),i?Object.getOwnPropertyDescriptor(o,n):void 0})(r,e,t)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function Oe(r){return Re({...r,state:!0,attribute:!1})}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const mt=r=>(...e)=>({_$litDirective$:r,values:e});let ft=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,s){this._$Ct=e,this._$AM=t,this._$Ci=s}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}};/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const vt={},yt=(r,e=vt)=>r._$AH=e;/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const bt=mt(class extends ft{constructor(){super(...arguments),this.key=g}render(r,e){return this.key=r,e}update(r,[e,t]){return e!==this.key&&(yt(r),this.key=e),t}}),P=320,x=270,y=16,D=24,we=80;function wt(r,e=window.innerHeight){return r.height+x+y*2<e}function $t(r,e,t,s={width:window.innerWidth,height:window.innerHeight}){const o=a=>{switch(a){case"bottom":return r.bottom+t+y+x<s.height;case"top":return r.top-t-y-x>0;case"right":return r.right+t+y+P<s.width;case"left":return r.left-t-y-P>0}},n={top:"bottom",bottom:"top",left:"right",right:"left"},i={top:["left","right"],bottom:["left","right"],left:["top","bottom"],right:["top","bottom"]};if(o(e))return e;if(o(n[e]))return n[e];for(const a of i[e])if(o(a))return a;return e}function St(r,e,t,s=window.innerHeight){const o=Math.max(0,r.top),n=Math.min(s,r.bottom),i=(o+n)/2;switch(e){case"right":return{top:i-we,left:r.right+t+y};case"left":return{top:i-we,left:r.left-t-y-P};case"bottom":return{top:r.bottom+t+y,left:r.left+r.width/2-P/2};case"top":return{top:r.top-t-y,left:r.left+r.width/2-P/2}}}function At(r,e={width:window.innerWidth,height:window.innerHeight}){return{top:Math.max(D,Math.min(r.top,e.height-x-D)),left:Math.max(D,Math.min(r.left,e.width-P-D))}}function xt(r){switch(r){case"right":return"arrow-right";case"left":return"arrow-left";case"bottom":return"arrow-bottom";case"top":return"arrow-top";default:return"arrow-bottom"}}function Et(r,e,t,s=window.innerHeight){if(t==="top"||t==="bottom"){const p=r.left+r.width/2-e.left;return`${Math.max(20,Math.min(p,P-20))}px`}const i=Math.max(0,r.top),a=Math.min(s,r.bottom),c=(i+a)/2-e.top;return`${Math.max(20,Math.min(c,x-20))}px`}function _t(r,e){r==="restore"?window.scrollTo({top:e,behavior:"smooth"}):r==="top"&&window.scrollTo({top:0,behavior:"smooth"})}function Tt(r,e,t){const s=r.getBoundingClientRect(),o=window.innerHeight;if(wt(s,o))r.scrollIntoView({behavior:"smooth",block:"center",inline:"nearest"});else{const n=e==="top"?x+y+t:o*.15,i=window.scrollY+s.top-n;window.scrollTo({top:Math.max(0,i),behavior:"smooth"})}return new Promise(n=>{let i=r.getBoundingClientRect().top,a=0,l=0;const c=setTimeout(()=>{cancelAnimationFrame(l),n()},1500),u=()=>{const d=r.getBoundingClientRect().top;if(Math.abs(d-i)<1?a+=1:a=0,i=d,a>=3){clearTimeout(c),n();return}l=requestAnimationFrame(u)};l=requestAnimationFrame(u)})}class kt{constructor(){this.previouslyFocused=null}capture(){document.activeElement instanceof HTMLElement&&(this.previouslyFocused=document.activeElement)}restore(){var e;(e=this.previouslyFocused)==null||e.focus(),this.previouslyFocused=null}focusDialog(e){var t;(t=e==null?void 0:e.querySelector(".tour-tooltip, .tour-center-card"))==null||t.focus()}trapFocus(e,t){const s=t==null?void 0:t.querySelector(".tour-tooltip, .tour-center-card");if(!s)return;const o=s.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');if(o.length===0)return;const n=o[0],i=o[o.length-1],a=t==null?void 0:t.activeElement;if(e.shiftKey){a===n&&(e.preventDefault(),i.focus());return}a===i&&(e.preventDefault(),n.focus())}}function Me(r,e=document.body){const t=e.querySelector(r);if(t)return t;const s=e.querySelectorAll("*");for(const o of s)if(o.shadowRoot){const n=Me(r,o.shadowRoot);if(n)return n}return null}const Q="data-tour-id",Ct=3e3;function Lt(r,e=Q){return`[${e}="${r}"]`}function K(r,e=Q,t=document.body){return!r||r==="_none_"?null:Me(Lt(r,e),t)}async function Pt(r,e=Q,t=Ct){const s=K(r,e);return s||new Promise(o=>{let n=!1;const i=new MutationObserver(()=>{const a=K(r,e);a&&(n=!0,i.disconnect(),o(a))});i.observe(document.body,{childList:!0,subtree:!0}),setTimeout(()=>{n||(i.disconnect(),o(K(r,e)))},t)})}function It(r,e=Q){const t=K(r.target,e);return{targetElement:t,targetRect:(t==null?void 0:t.getBoundingClientRect())??null}}const Rt=32;class Ot{constructor(e){this.options=e,this.autoAdvanceTimer=null}clearAutoAdvance(){this.autoAdvanceTimer!==null&&(clearTimeout(this.autoAdvanceTimer),this.autoAdvanceTimer=null)}startAutoAdvance(e){this.clearAutoAdvance(),this.autoAdvanceTimer=setTimeout(()=>{this.autoAdvanceTimer=null,this.options.nextStep()},e)}async prepareStep(e){if(e.step.beforeShow)try{await e.step.beforeShow()}catch(n){console.error("[torchlit] beforeShow hook failed:",n)}e.step.route&&this.options.dispatchRouteChange(e.step.route),e.step.target&&e.step.target!=="_none_"&&await Pt(e.step.target,this.options.targetAttribute);const t=this.options.getCurrentSnapshot()??e,s=this.options.getTour(t.tourId);if(!s)return null;let o=this.resolveSnapshot(t,s);return o.targetElement&&this.shouldScrollIntoView(o)&&(await Tt(o.targetElement,o.step.placement,this.options.spotlightPadding),o=this.resolveSnapshot(this.options.getCurrentSnapshot()??t,s)),o}resolveSnapshot(e,t){const{targetElement:s,targetRect:o}=It(e.step,this.options.targetAttribute);return{...e,tour:t,targetElement:s,targetRect:o}}shouldScrollIntoView(e){const t=e.targetRect;if(!t)return!1;const s=window.innerHeight;return!(t.height+x+Rt<s?t.top>=0&&t.bottom<=s&&t.left>=0&&t.right<=window.innerWidth:e.step.placement==="top"?t.top>=x+y+this.options.spotlightPadding&&t.top<s:t.top>=0&&t.top<s)}}var Mt=Object.defineProperty,Bt=Object.getOwnPropertyDescriptor,X=(r,e,t,s)=>{for(var o=s>1?void 0:s?Bt(e,t):e,n=r.length-1,i;n>=0;n--)(i=r[n])&&(o=(s?i(e,t,o):i(o))||o);return s&&o&&Mt(e,t,o),o};let R=class extends N{constructor(){super(...arguments),this.snapshot=null,this.visible=!1,this.teardownTimer=null,this.focusManager=new kt,this.stepRunner=null,this.lastResolvedPlacement="bottom",this.scrollRafId=0,this.savedScrollY=0,this.activeTour=null,this.resolvedTargetElement=null,this.changeToken=0,this.handleResize=()=>{this.refreshSnapshotFromTarget()},this.handleScroll=()=>{!this.snapshot||this.scrollRafId||(this.scrollRafId=requestAnimationFrame(()=>{this.scrollRafId=0,this.refreshSnapshotFromTarget()}))},this.handleKeydown=r=>{!this.snapshot||!this.service||(r.key==="Escape"?(r.preventDefault(),this.clearAutoAdvance(),this.service.skipTour()):r.key==="ArrowRight"||r.key==="Enter"?(r.preventDefault(),this.clearAutoAdvance(),this.service.nextStep()):r.key==="ArrowLeft"?(r.preventDefault(),this.clearAutoAdvance(),this.service.prevStep()):r.key==="Tab"&&this.focusManager.trapFocus(r,this.shadowRoot))},this.handleBackdropClick=()=>{var r;this.clearAutoAdvance(),(r=this.service)==null||r.skipTour()}}connectedCallback(){super.connectedCallback(),this.service&&this.attachService(),window.addEventListener("resize",this.handleResize),window.addEventListener("scroll",this.handleScroll,!0),window.addEventListener("keydown",this.handleKeydown)}disconnectedCallback(){var r;super.disconnectedCallback(),(r=this.unsubscribe)==null||r.call(this),this.clearAutoAdvance(),this.scrollRafId&&cancelAnimationFrame(this.scrollRafId),this.teardownTimer&&clearTimeout(this.teardownTimer),window.removeEventListener("resize",this.handleResize),window.removeEventListener("scroll",this.handleScroll,!0),window.removeEventListener("keydown",this.handleKeydown)}updated(r){var e;r.has("service")&&this.service&&((e=this.unsubscribe)==null||e.call(this),this.attachService()),this.visible&&this.snapshot&&(this.adjustTooltipPosition(),this.updateComplete.then(()=>{this.focusManager.focusDialog(this.shadowRoot)}))}adjustTooltipPosition(){var i,a,l;if(this.lastResolvedPlacement!=="top")return;const r=(i=this.shadowRoot)==null?void 0:i.querySelector(".tour-tooltip"),e=(a=this.snapshot)==null?void 0:a.targetRect;if(!r||!e)return;const t=((l=this.service)==null?void 0:l.spotlightPadding)??10,s=r.getBoundingClientRect().height,o=e.top-t-y-s,n=Math.max(D,o);r.style.top=`${n}px`}attachService(){this.stepRunner=new Ot({getCurrentSnapshot:()=>this.service.getSnapshot(),getTour:r=>this.getTourDefinition(r),nextStep:()=>this.service.nextStep(),spotlightPadding:this.service.spotlightPadding,targetAttribute:this.service.targetAttribute,dispatchRouteChange:r=>this.dispatchRouteChange(r)}),this.unsubscribe=this.service.subscribe(r=>{this.handleTourChange(r)})}clearAutoAdvance(){var r;(r=this.stepRunner)==null||r.clearAutoAdvance()}startAutoAdvance(r){var e;(e=this.stepRunner)==null||e.startAutoAdvance(r)}async handleTourChange(r){var o,n;const e=++this.changeToken;if(this.clearAutoAdvance(),this.teardownTimer&&(clearTimeout(this.teardownTimer),this.teardownTimer=null),!r){const i=this.activeTour;this.visible=!1,this.activeTour=null,this.resolvedTargetElement=null,this.teardownTimer=setTimeout(()=>{e===this.changeToken&&(this.snapshot=null,this.focusManager.restore(),_t((i==null?void 0:i.onEndScroll)??"restore",this.savedScrollY))},300);return}const t=r.tourId!==((o=this.activeTour)==null?void 0:o.id);this.activeTour||this.focusManager.capture(),t&&(this.savedScrollY=window.scrollY);const s=await((n=this.stepRunner)==null?void 0:n.prepareStep(r));!s||e!==this.changeToken||(this.activeTour=s.tour,this.snapshot=s,this.resolvedTargetElement=s.targetElement,requestAnimationFrame(()=>{e===this.changeToken&&(this.visible=!0,s.step.autoAdvance&&this.startAutoAdvance(s.step.autoAdvance))}))}dispatchRouteChange(r){this.dispatchEvent(new CustomEvent("tour-route-change",{detail:{route:r},bubbles:!0,composed:!0}))}getTourDefinition(r){var e;return(e=this.service)==null?void 0:e.getTour(r)}refreshSnapshotFromTarget(){var e;if(!this.snapshot)return;const r=(e=this.resolvedTargetElement)!=null&&e.isConnected?this.resolvedTargetElement:null;this.snapshot={...this.snapshot,targetElement:r,targetRect:(r==null?void 0:r.getBoundingClientRect())??null}}bestPlacement(r,e){var t;return $t(r,e,((t=this.service)==null?void 0:t.spotlightPadding)??10)}getTooltipPosition(r,e){var t;return St(r,e,((t=this.service)==null?void 0:t.spotlightPadding)??10)}clampToViewport(r){return At(r)}getArrowClass(r){return xt(r)}getArrowOffset(r,e,t){return Et(r,e,t)}render(){var p;if(!this.snapshot)return f``;const{step:r,stepIndex:e,totalSteps:t,targetRect:s}=this.snapshot;if(!s)return this.renderCenteredStep(r,e,t);const o=((p=this.service)==null?void 0:p.spotlightPadding)??10,n=r.spotlightBorderRadius?`border-radius: ${r.spotlightBorderRadius};`:"",i=`
      top: ${s.top-o}px;
      left: ${s.left-o}px;
      width: ${s.width+o*2}px;
      height: ${s.height+o*2}px;
      ${n}
    `,a=this.bestPlacement(s,r.placement);this.lastResolvedPlacement=a;const l=this.clampToViewport(this.getTooltipPosition(s,a)),c=this.getArrowOffset(s,l,a),u=`top: ${l.top}px; left: ${l.left}px;`,d=`Step ${e+1} of ${t}: ${r.title}`;return f`
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
          Step ${e+1} of ${t}
        </div>

        <h3 class="tour-title">${r.title}</h3>
        <div class="tour-message" id="tour-desc">${r.message}</div>

        ${this.renderProgressDots(e,t)}
        ${this.renderFooter(e,t)}
        ${this.renderAutoProgress(r,e)}
      </div>
    `}renderProgressDots(r,e){return e<=1?g:f`
      <div class="tour-progress" role="group" aria-label="Tour progress">
        ${Array.from({length:e},(t,s)=>f`
          <div
            class="tour-dot ${s===r?"active":s<r?"completed":""}"
            role="presentation"
          ></div>
        `)}
      </div>
    `}renderFooter(r,e,t="Finish",s="Finish tour",o=!0){return f`
      <div class="tour-footer">
        <button
          class="tour-skip"
          aria-label="Skip tour"
          @click=${()=>{this.clearAutoAdvance(),this.service.skipTour()}}
        >
          Skip tour
        </button>
        <div class="tour-nav">
          ${r>0?f`
            <button
              class="tour-btn"
              aria-label="Go to previous step"
              @click=${()=>{this.clearAutoAdvance(),this.service.prevStep()}}
            >
              ${o?f`
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              `:g}
              Back
            </button>
          `:g}
          <button
            class="tour-btn primary"
            aria-label="${r===e-1?s:"Go to next step"}"
            @click=${()=>{this.clearAutoAdvance(),this.service.nextStep()}}
          >
            ${r===e-1?t:"Next"}
            ${r<e-1?f`
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            `:o?f`
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            `:g}
          </button>
        </div>
      </div>
    `}renderAutoProgress(r,e){return r.autoAdvance?bt(e,f`
      <div
        class="tour-auto-progress"
        style="animation: autoAdvanceFill ${r.autoAdvance}ms linear forwards;"
        aria-hidden="true"
      ></div>
    `):g}renderCenteredStep(r,e,t){const s=`Step ${e+1} of ${t}: ${r.title}`;return f`
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

        ${this.renderProgressDots(e,t)}
        ${this.renderFooter(e,t,"Let's go!","Start the tour",!1)}
        ${this.renderAutoProgress(r,e)}
      </div>
    `}};R.styles=Ke`
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
  `;X([Re({attribute:!1})],R.prototype,"service",2);X([Oe()],R.prototype,"snapshot",2);X([Oe()],R.prototype,"visible",2);R=X([ht("torchlit-overlay")],R);customElements.get("torchlit-overlay")||customElements.define("torchlit-overlay",R);const b=Ve({storageKey:"torchlit-docs"}),Be=document.querySelector("torchlit-overlay");Be.service=b;function C(r){document.querySelectorAll(".page").forEach(s=>s.classList.remove("active")),document.querySelectorAll(".nav-item").forEach(s=>s.classList.remove("active"));const e=document.getElementById(`page-${r}`),t=document.querySelector(`.nav-item[data-page="${r}"]`);e&&e.classList.add("active"),t&&t.classList.add("active")}window.switchPage=C;document.querySelectorAll(".nav-item").forEach(r=>{r.addEventListener("click",()=>{C(r.dataset.page),De()})});const He=document.querySelector(".sidebar"),le=document.getElementById("sidebar-backdrop"),Ht=document.getElementById("btn-menu");function De(){He.classList.remove("open"),le.classList.remove("visible")}Ht.addEventListener("click",()=>{const r=He.classList.toggle("open");le.classList.toggle("visible",r)});le.addEventListener("click",De);Be.addEventListener("tour-route-change",r=>{C(r.detail.route)});b.register([{id:"onboarding",name:"Welcome Tour",trigger:"first-visit",steps:[{target:"_none_",title:"Welcome to the Torchlit Docs!",message:"This site is both the documentation and a live demo of Torchlit. Let's take a quick tour. Use arrow keys or click Next.",placement:"bottom"},{target:"nav-overview",title:"Overview",message:"The docs home page with install instructions, key stats, and a quick-start snippet.",placement:"right"},{target:"overview-stats",title:"At a Glance",message:"Key metrics about Torchlit — bundle size, dependencies, and framework support. The spotlight highlights exactly what you need.",placement:"bottom",beforeShow:()=>C("overview")},{target:"overview-features",title:"Key Features",message:"Shadow DOM traversal, framework-agnostic design, CSS theming, and a tiny bundle. These cards detail what makes Torchlit different.",placement:"top",beforeShow:()=>C("overview")},{target:"nav-guide",title:"Getting Started",message:"The step-by-step setup guide — install, configure, and launch your first tour.",placement:"right"},{target:"nav-recipes",title:"Recipes",message:"Ready-to-copy patterns for React, Vue, Svelte, kiosk mode, multi-page apps, shadow DOM targets, and more.",placement:"right"},{target:"guide-demo",title:"Interactive Examples",message:"The spotlight followed you to a new page! Try these live demos — each one shows a different Torchlit feature with its code.",placement:"top",beforeShow:()=>C("styling")},{target:"header-help",title:"Contextual Help",message:"Click the ? button anytime for page-specific help. Each section has its own help tour. You're all set!",placement:"bottom",beforeShow:()=>C("overview")}],onComplete:()=>console.log("[docs] Onboarding complete!"),onSkip:()=>console.log("[docs] Onboarding skipped")},{id:"overview-help",name:"Overview Help",trigger:"manual",steps:[{target:"overview-stats",title:"Quick Stats",message:"Key metrics about Torchlit at a glance — bundle size, peer dependency, and framework support.",placement:"bottom"},{target:"overview-features",title:"Feature Highlights",message:"Each card describes a core feature. Hover them for a subtle lift effect — all CSS, no JavaScript.",placement:"top"},{target:"header-theme",title:"Theme Toggle",message:"Switch between light and dark mode. The tour overlay adapts automatically via CSS custom properties — zero config.",placement:"bottom"}]},{id:"guide-help",name:"Getting Started Help",trigger:"manual",steps:[{target:"guide-search",title:"Search Docs",message:"Filter the guide steps by keyword — type to narrow down what you need.",placement:"bottom"},{target:"nav-styling",title:"See It In Action",message:"Head to the Styling page for interactive examples you can run live, plus a theme playground and CSS custom property reference.",placement:"right"}]},{id:"api-help",name:"API Reference Help",trigger:"manual",steps:[{target:"api-search",title:"Jump to Symbol",message:'Type a method name, property, or type to jump straight to it — works like Cmd+K. Try "nextStep" or "autoAdvance".',placement:"bottom"},{target:"api-service",title:"Quick Navigation",message:"Use these pills to jump to any section: TourService, Overlay, Types, or deepQuery.",placement:"bottom"}]},{id:"styling-help",name:"Styling Help",trigger:"manual",steps:[{target:"guide-demo",title:"Interactive Examples",message:"Run live demos right here and click View Code to see the configuration behind each one.",placement:"top"},{target:"styling-search",title:"Search",message:"Jump to any CSS property or section — start typing to filter.",placement:"bottom"},{target:"styling-props",title:"CSS Custom Properties",message:"All the CSS variables you can set — each has a --tour-* prefix, a generic fallback, and a sensible default.",placement:"top"},{target:"styling-dark",title:"Dark Mode",message:"Override the fallback tokens in a .dark class or prefers-color-scheme media query — zero JS needed.",placement:"top"},{target:"styling-parts",title:"::part() Selectors",message:"For deeper customization beyond colors — change shadows, borders, or add glow effects to the spotlight.",placement:"top"}]},{id:"recipes-help",name:"Recipes Help",trigger:"manual",steps:[{target:"recipes-search",title:"Search Recipes",message:'Type a keyword like "React", "kiosk", or "shadow" to filter recipes instantly.',placement:"bottom"},{target:"recipes-frameworks",title:"Framework Integration",message:"Ready-to-copy setup code for React, Vue, Svelte, and plain JS/TS.",placement:"top"},{target:"recipes-spa",title:"SPA & Routing",message:"Patterns for tours that span multiple views in single-page apps.",placement:"top"},{target:"recipes-kiosk",title:"Kiosk Mode",message:"Auto-advancing, looping tours for demos and digital signage.",placement:"top"},{target:"recipes-storage",title:"Custom Storage",message:"Swap localStorage for sessionStorage or an API-backed adapter.",placement:"top"}]}]);const Dt={overview:"overview-help",guide:"guide-help",recipes:"recipes-help",api:"api-help",styling:"styling-help"};document.getElementById("btn-help").addEventListener("click",()=>{var t;const r=((t=document.querySelector(".nav-item.active"))==null?void 0:t.dataset.page)||"overview",e=Dt[r];e&&b.start(e)});document.getElementById("btn-theme").addEventListener("click",()=>{document.documentElement.classList.toggle("dark")});document.getElementById("btn-reset").addEventListener("click",()=>{b.resetAll(),location.reload()});const $e=document.querySelector('[data-tour-id="guide-search"] input');$e&&$e.addEventListener("input",r=>{const e=r.target.value.trim().toLowerCase(),t=document.getElementById("page-guide");if(!t)return;t.querySelectorAll(".step, .doc-section").forEach(o=>{var i;if(!e){o.style.display="";return}const n=((i=o.textContent)==null?void 0:i.toLowerCase())??"";o.style.display=n.includes(e)?"":"none"})});const Se=document.getElementById("recipes-search-input");Se&&Se.addEventListener("input",r=>{const e=r.target.value.trim().toLowerCase(),t=document.getElementById("page-recipes");if(!t)return;t.querySelectorAll(".doc-section").forEach(o=>{var i,a,l;const n=o.querySelectorAll(".recipe-sub");if(n.length===0){if(!e){o.style.display="";return}const c=((i=o.textContent)==null?void 0:i.toLowerCase())??"";o.style.display=c.includes(e)?"":"none"}else{let c=!1;if(n.forEach(d=>{var m;if(!e){d.style.display="",c=!0;return}const h=(((m=d.textContent)==null?void 0:m.toLowerCase())??"").includes(e);d.style.display=h?"":"none",h&&(c=!0)}),!e){o.style.display="";return}((((a=o.querySelector(".section-title"))==null?void 0:a.textContent)??"").toLowerCase()+(((l=o.querySelector(".section-title + .doc-text"))==null?void 0:l.textContent)??"").toLowerCase()).includes(e)&&(c=!0),o.style.display=c?"":"none"}})});const _=document.getElementById("api-search-input"),w=document.getElementById("api-search-results");if(_&&w){let s=function(i){return e.filter(a=>a.text.includes(i)).sort((a,l)=>{const c=a.label.toLowerCase().startsWith(i)?0:1,u=l.label.toLowerCase().startsWith(i)?0:1;return c-u||a.label.localeCompare(l.label)}).slice(0,8)},o=function(i){if(w.replaceChildren(),i.length===0){w.classList.remove("open"),t=-1;return}t=0,i.forEach((a,l)=>{const c=document.createElement("div");c.className="api-search-result"+(l===0?" active":""),c.dataset.idx=String(l);const u=document.createElement("code");if(u.textContent=a.label,c.appendChild(u),a.context){const d=document.createElement("span");d.className="result-context",d.textContent=a.context,c.appendChild(d)}c.addEventListener("click",()=>n(a)),w.appendChild(c)}),w.classList.add("open")},n=function(i){w.classList.remove("open"),_.value="",i.element.scrollIntoView({behavior:"smooth",block:"center"}),i.element.classList.remove("highlight-flash"),i.element.offsetWidth,i.element.classList.add("highlight-flash"),setTimeout(()=>i.element.classList.remove("highlight-flash"),1600)};var zt=s,jt=o,Vt=n;const r=document.getElementById("page-api"),e=[];r&&(r.querySelectorAll(".ref-table tbody tr").forEach(i=>{var d,p,h;const a=i.querySelector("code");if(!a)return;const l=a.textContent??"";let c="",u=(d=i.closest("table"))==null?void 0:d.previousElementSibling;for(;u;){if((p=u.classList)!=null&&p.contains("subsection-title")||(h=u.classList)!=null&&h.contains("section-title")){c=u.textContent??"";break}u=u.previousElementSibling}e.push({label:l,context:c,element:i,text:(l+" "+(i.textContent??"")).toLowerCase()})}),r.querySelectorAll(".subsection-title").forEach(i=>{const a=i.textContent??"";e.push({label:a,context:"Section",element:i,text:a.toLowerCase()})}));let t=-1;_.addEventListener("input",()=>{const i=_.value.trim().toLowerCase();if(!i){o([]);return}o(s(i))}),_.addEventListener("keydown",i=>{var l,c,u,d;const a=w.querySelectorAll(".api-search-result");if(a.length)if(i.key==="ArrowDown")i.preventDefault(),(l=a[t])==null||l.classList.remove("active"),t=(t+1)%a.length,(c=a[t])==null||c.classList.add("active");else if(i.key==="ArrowUp")i.preventDefault(),(u=a[t])==null||u.classList.remove("active"),t=(t-1+a.length)%a.length,(d=a[t])==null||d.classList.add("active");else if(i.key==="Enter"){i.preventDefault();const p=_.value.trim().toLowerCase(),h=s(p);h[t]&&n(h[t])}else i.key==="Escape"&&(o([]),_.blur())}),document.addEventListener("click",i=>{i.target.closest('[data-tour-id="api-search"]')||w.classList.remove("open")})}(function(){const e=document.getElementById("pg-preview"),t=document.getElementById("pg-code-output"),s=document.getElementById("pg-code"),o=document.getElementById("pg-code-toggle"),n=document.getElementById("pg-reset");if(!e)return;const i={primary:{css:"--tour-primary",pg:"--pg-primary"},"primary-fg":{css:"--tour-primary-foreground",pg:"--pg-primary-fg"},card:{css:"--tour-card",pg:"--pg-card"},foreground:{css:"--tour-foreground",pg:"--pg-foreground"},border:{css:"--tour-border",pg:"--pg-border"},muted:{css:"--tour-muted",pg:"--pg-muted"},"muted-fg":{css:"--tour-muted-foreground",pg:"--pg-muted-fg"},background:{css:"--tour-background",pg:"--pg-background"},"tooltip-radius":{css:"--tour-tooltip-radius",pg:"--pg-tooltip-radius"},"btn-radius":{css:"--tour-btn-radius",pg:"--pg-btn-radius"}},a={primary:"#F26122","primary-fg":"#ffffff",card:"#ffffff",foreground:"#1a1a1a",border:"#e5e5e5",muted:"#e5e5e5","muted-fg":"#737373",background:"#ffffff","tooltip-radius":"0.75rem","btn-radius":"0.5rem"},l={...a};function c(){Object.keys(l).forEach(h=>{const m=i[h];m&&e.style.setProperty(m.pg,l[h])})}function u(){const h=Object.keys(l).filter(v=>l[v]!==a[v]);return h.length===0?"/* No changes — using defaults */":`torchlit-overlay {
${h.map(v=>`  ${i[v].css}: ${l[v]};`).join(`
`)}
}`}function d(){t.textContent=u(),typeof Prism<"u"&&Prism.highlightElement(t)}function p(h,m){l[h]=m;const v=document.querySelector(`[data-pg="${h}"]`),Z=document.querySelector(`[data-pg-text="${h}"]`);v&&v.value!==m&&(v.value=m),Z&&Z.value!==m&&(Z.value=m),c(),d()}document.querySelectorAll("[data-pg]").forEach(h=>{h.addEventListener("input",()=>p(h.dataset.pg,h.value))}),document.querySelectorAll("[data-pg-text]").forEach(h=>{h.addEventListener("input",()=>{const m=h.dataset.pgText;l[m]=h.value;const v=document.querySelector(`[data-pg="${m}"]`);v&&/^#[0-9a-f]{6}$/i.test(h.value)&&(v.value=h.value),c(),d()})}),o.addEventListener("click",()=>{const h=u();navigator.clipboard.writeText(h).then(()=>{const m=o.innerHTML;o.innerHTML='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Copied!',setTimeout(()=>{o.innerHTML=m},1500)}),s.classList.toggle("open")}),n.addEventListener("click",()=>{Object.keys(a).forEach(h=>p(h,a[h]))}),c(),d()})();const T=document.getElementById("styling-search-input"),$=document.getElementById("styling-search-results");if(T&&$){let s=function(i){return e.filter(a=>a.text.includes(i)).sort((a,l)=>{const c=a.label.toLowerCase().startsWith(i)?0:1,u=l.label.toLowerCase().startsWith(i)?0:1;return c-u||a.label.localeCompare(l.label)}).slice(0,8)},o=function(i){if($.replaceChildren(),i.length===0){$.classList.remove("open"),t=-1;return}t=0,i.forEach((a,l)=>{const c=document.createElement("div");c.className="api-search-result"+(l===0?" active":""),c.dataset.idx=String(l);const u=document.createElement("code");if(u.textContent=a.label,c.appendChild(u),a.context){const d=document.createElement("span");d.className="result-context",d.textContent=a.context,c.appendChild(d)}c.addEventListener("click",()=>n(a)),$.appendChild(c)}),$.classList.add("open")},n=function(i){$.classList.remove("open"),T.value="",i.element.scrollIntoView({behavior:"smooth",block:"center"}),i.element.classList.remove("highlight-flash"),i.element.offsetWidth,i.element.classList.add("highlight-flash"),setTimeout(()=>i.element.classList.remove("highlight-flash"),1600)};var Wt=s,Kt=o,Gt=n;const r=document.getElementById("page-styling"),e=[];r&&(r.querySelectorAll(".ref-table tbody tr").forEach(i=>{var d,p,h;const a=i.querySelector("code");if(!a)return;const l=a.textContent??"";let c="",u=(d=i.closest("table"))==null?void 0:d.previousElementSibling;for(;u;){if((p=u.classList)!=null&&p.contains("subsection-title")||(h=u.classList)!=null&&h.contains("section-title")){c=u.textContent??"";break}u=u.previousElementSibling}e.push({label:l,context:c,element:i,text:(l+" "+(i.textContent??"")).toLowerCase()})}),r.querySelectorAll(".section-title").forEach(i=>{const a=i.textContent??"";e.push({label:a,context:"Section",element:i,text:a.toLowerCase()})}));let t=-1;T.addEventListener("input",()=>{const i=T.value.trim().toLowerCase();if(!i){o([]);return}o(s(i))}),T.addEventListener("keydown",i=>{var l,c,u,d;const a=$.querySelectorAll(".api-search-result");if(a.length)if(i.key==="ArrowDown")i.preventDefault(),(l=a[t])==null||l.classList.remove("active"),t=(t+1)%a.length,(c=a[t])==null||c.classList.add("active");else if(i.key==="ArrowUp")i.preventDefault(),(u=a[t])==null||u.classList.remove("active"),t=(t-1+a.length)%a.length,(d=a[t])==null||d.classList.add("active");else if(i.key==="Enter"){i.preventDefault();const p=T.value.trim().toLowerCase(),h=s(p);h[t]&&n(h[t])}else i.key==="Escape"&&(o([]),T.blur())}),document.addEventListener("click",i=>{i.target.closest('[data-tour-id="styling-search"]')||$.classList.remove("open")})}document.querySelectorAll(".demo-tab").forEach(r=>{r.addEventListener("click",()=>{var e;document.querySelectorAll(".demo-tab").forEach(t=>t.classList.remove("active")),document.querySelectorAll(".demo-content").forEach(t=>t.classList.remove("active")),r.classList.add("active"),(e=document.getElementById("demo-"+r.dataset.demo))==null||e.classList.add("active")})});document.querySelectorAll(".code-toggle").forEach(r=>{r.addEventListener("click",()=>{const e=document.getElementById(r.dataset.target);if(e){const t=e.classList.toggle("visible");r.querySelector("svg").style.transform=t?"rotate(90deg)":""}})});b.register([{id:"demo-basic",name:"Basic Demo",trigger:"manual",steps:[{target:"demo-nav",title:"Navigation",message:"The main navigation bar lets you move between pages.",placement:"bottom"},{target:"demo-search",title:"Search",message:"Quickly find anything with the global search.",placement:"bottom"},{target:"demo-profile",title:"Profile",message:"Manage your account settings here.",placement:"bottom"}]},{id:"demo-rich",name:"Rich Content Demo",trigger:"manual",steps:[{target:"demo-editor",title:"Editor",message:f`Write content here. Use <strong>bold</strong>, <em>italic</em>, and <code>code</code> formatting.`,placement:"bottom"},{target:"demo-toolbar",title:"Toolbar",message:f`Shortcuts: <kbd>Ctrl+B</kbd> Bold &nbsp; <kbd>Ctrl+I</kbd> Italic &nbsp; <kbd>Ctrl+K</kbd> Link`,placement:"bottom"}]},{id:"demo-auto",name:"Auto-Advance Demo",trigger:"manual",loop:!0,steps:[{target:"demo-slide-1",title:"Slide 1",message:"This tour auto-advances every 2.5 seconds.",placement:"bottom",autoAdvance:2500},{target:"demo-slide-2",title:"Slide 2",message:"No clicks needed — perfect for kiosk / demo modes.",placement:"bottom",autoAdvance:2500},{target:"demo-slide-3",title:"Slide 3",message:"With loop: true, it restarts from the beginning.",placement:"bottom",autoAdvance:2500}]},{id:"demo-shapes",name:"Shapes Demo",trigger:"manual",steps:[{target:"demo-avatar",title:"Circle",message:'spotlightBorderRadius: "50%" gives a circular cutout.',placement:"bottom",spotlightBorderRadius:"50%"},{target:"demo-pill",title:"Pill",message:'spotlightBorderRadius: "9999px" creates a pill shape.',placement:"bottom",spotlightBorderRadius:"9999px"},{target:"demo-square",title:"Square",message:'spotlightBorderRadius: "0" for sharp corners.',placement:"bottom",spotlightBorderRadius:"0"}]}]);var xe;(xe=document.getElementById("run-basic"))==null||xe.addEventListener("click",()=>b.start("demo-basic"));var Ee;(Ee=document.getElementById("run-rich"))==null||Ee.addEventListener("click",()=>b.start("demo-rich"));var _e;(_e=document.getElementById("run-auto"))==null||_e.addEventListener("click",()=>b.start("demo-auto"));var Te;(Te=document.getElementById("run-shapes"))==null||Te.addEventListener("click",()=>b.start("demo-shapes"));b.shouldAutoStart("onboarding")&&setTimeout(()=>b.start("onboarding"),800);
