import test from 'node:test';
import assert from 'node:assert/strict';
import {strictDatabaseConnectionString} from '../src/lib/postgres-connection.ts';
test('SSL aliases retain full certificate verification without changing credentials or other parameters',()=>{
 for(const mode of ['prefer','require','verify-ca']){
  const before=new URL('postgresql://fixture:p%40ss%3Aword@db.example.test/app?sslmode='+mode+'&channel_binding=require&connect_timeout=5');
  const after=new URL(strictDatabaseConnectionString(before.toString()));
  assert.equal(after.searchParams.get('sslmode'),'verify-full');
  for(const key of ['username','password','hostname','pathname'])assert.equal(after[key],before[key]);
  assert.equal(after.searchParams.get('channel_binding'),'require');
  assert.equal(after.searchParams.get('connect_timeout'),'5');
  assert.equal(strictDatabaseConnectionString(after.toString()),after.toString());
 }
});
test('local and explicit SSL configurations are preserved',()=>{
 for(const url of ['postgres://test:test@127.0.0.1:55432/postgres','postgres://db.example.test/app?sslmode=verify-full','postgres://db.example.test/app?sslmode=disable','postgres://db.example.test/app?sslmode=require&uselibpqcompat=true','service=local-fixture'])assert.equal(strictDatabaseConnectionString(url),url);
});
