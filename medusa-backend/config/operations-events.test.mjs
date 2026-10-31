import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { sendOperationsEvent } from './operations-events.ts';
const event={name:'product.updated',data:{id:'prod_1',private:'omit'},metadata:{created_at:new Date('2026-10-31T00:00:00Z')}};
const env={SERICIA_OPERATIONS_EVENTS_URL:'https://ops.example.com/api/medusa-ops/events',SERICIA_MEDUSA_EVENT_SECRET:'s'.repeat(32)};
test('signs only minimal event data and preserves retry identity',async()=>{
 const bodies=[];
 const send=async(url,options)=>{assert.equal(url.pathname,'/api/medusa-ops/events');assert.equal(options.redirect,'error');assert.equal(options.headers['x-sericia-signature'],createHmac('sha256',env.SERICIA_MEDUSA_EVENT_SECRET).update(options.headers['x-sericia-timestamp']+'.'+options.body).digest('hex'));bodies.push(options.body);return Response.json({ok:true});};
 await sendOperationsEvent(event,env,send);await sendOperationsEvent(JSON.parse(JSON.stringify(event)),env,send);
 assert.equal(bodies[0],bodies[1]);assert.equal(bodies[0].includes('private'),false);
});
test('disabled settings do not send; incomplete or unsafe settings fail closed',async()=>{
 const never=async()=>{throw new Error('must not send');};
 await sendOperationsEvent(event,{},never);
 for(const patch of [{SERICIA_MEDUSA_EVENT_SECRET:''},{SERICIA_OPERATIONS_EVENTS_URL:'http://ops.example.com/api/medusa-ops/events'},{SERICIA_OPERATIONS_EVENTS_URL:'https://x:y@ops.example.com/api/medusa-ops/events'}]) await assert.rejects(sendOperationsEvent(event,{...env,...patch},never));
 await assert.rejects(sendOperationsEvent({...event,metadata:{}},env,never));
});
test('upstream failures are retriable without private response disclosure',async()=>{
 await assert.rejects(sendOperationsEvent(event,env,async()=>new Response('secret',{status:503})),/delivery failed \(503\)/);
 await assert.rejects(sendOperationsEvent(event,env,async()=>Response.json({ok:false})),/acknowledgement invalid/);
});
