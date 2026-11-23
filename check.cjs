const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const nodes=new Map();
const node=key=>{if(!nodes.has(key))nodes.set(key,{innerHTML:'',textContent:'',value:'',className:'',dataset:{},style:{},classList:{add(){},remove(){},toggle(){}},files:[],children:[]});return nodes.get(key)};
const ctx={console,structuredClone,setTimeout(){},clearTimeout(){},setInterval(){},clearInterval(){},Blob,URL,sessionStorage:{getItem(){return null},setItem(){}},localStorage:{getItem(){return null},setItem(){}},location:{hash:''},window:{scrollTo(){},addEventListener(){},print(){}},document:{title:'',querySelector:node,querySelectorAll(){return[]},addEventListener(){}}};
vm.createContext(ctx);vm.runInContext(fs.readFileSync('dist/app.js','utf8'),ctx);
vm.runInContext(`
if(Object.keys(pages).length!==30)throw Error('Expected 30 pages');
for(const id of Object.keys(pages)){current=id;render();if(!document.querySelector('#main').innerHTML)throw Error('Empty '+id)}
`,ctx);
(async()=>{
await vm.runInContext(`(async()=>{current='U3.3';selected='BX20261122000002';role='A';document.querySelector('[name="approval-note"]').value='同意';await action('sign');if(doc().status!==2)throw Error('Sign transition');current='U3.4';await action('approve');if(doc().status!==3)throw Error('Approve transition');current='U3.5';role='C';await action('generate-payment');role='P';await action('send-bank');if(doc().status!==4)throw Error('Bank transition');current='U3.6';await action('load-receipt');const before=state.accounts[0].used;await action('writeback');if(doc().status!==5||state.accounts[0].used!==before+8600)throw Error('Writeback balance');const after=state.accounts[0].used;await action('writeback');if(state.accounts[0].used!==after)throw Error('Duplicate payment');current='U3.8';role='A';await action('match');if(state.payments.map(p=>p.state).join(',')!=='已核销,多缴挂账,部分核销,未到账')throw Error('Matching categories');})()`,ctx);
console.log('PASS: 30 page renders; approval and payment lifecycle; balance deduction; duplicate-payment guard; four reconciliation categories.');
})().catch(e=>{console.error(e);process.exitCode=1});
