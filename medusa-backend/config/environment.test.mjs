import test from 'node:test';
import assert from 'node:assert/strict';
import { readEnvironment } from './environment.ts';

const base = {
  NODE_ENV: 'production', DATABASE_URL: 'postgres://localhost/test',
  REDIS_URL: 'redis://localhost:6379',
  STORE_CORS: 'https://shop.example.com', ADMIN_CORS: 'https://api.example.com',
  AUTH_CORS: 'https://shop.example.com,https://api.example.com',
  JWT_SECRET: 'a'.repeat(64), COOKIE_SECRET: 'b'.repeat(64),
};
test('preview has no Stripe provider unless explicitly enabled', () => {
  const config = readEnvironment(base);
  assert.equal(config.stripe, undefined);
  assert.equal(config.mode, 'shared');
});
test('required infrastructure fails closed without leaking connection values', () => {
  for (const name of ['DATABASE_URL', 'REDIS_URL', 'JWT_SECRET', 'COOKIE_SECRET', 'STORE_CORS', 'ADMIN_CORS', 'AUTH_CORS']) {
    assert.throws(() => readEnvironment({...base, [name]: ''}), new RegExp(name));
  }
});
test('rejects wildcard, insecure and credential-bearing CORS origins', () => {
  for (const origin of ['*', 'http://shop.example.com', 'https://shop.example.com/path', 'https://user:password@shop.example.com']) {
    assert.throws(() => readEnvironment({...base, STORE_CORS: origin}), /STORE_CORS/);
  }
});
test('rejects placeholder signing keys and worker mode typos', () => {
  assert.throws(() => readEnvironment({...base, JWT_SECRET: 'CHANGE_ME_TO_RANDOM_32_BYTES'}), /JWT_SECRET/);
  assert.throws(() => readEnvironment({...base, MEDUSA_WORKER_MODE: 'serve'}), /MEDUSA_WORKER_MODE/);
});
test('Stripe requires signing secret and protects against accidental live credentials', () => {
  const stripe = {...base, STRIPE_ENABLED:'true', STRIPE_API_KEY:'sk_test_example'};
  assert.throws(() => readEnvironment(stripe), /STRIPE_WEBHOOK_SECRET/);
  assert.equal(readEnvironment({...stripe, STRIPE_WEBHOOK_SECRET:'whsec_example'}).stripe.capture, true);
  assert.throws(() => readEnvironment({...stripe, STRIPE_WEBHOOK_SECRET:'whsec_example', STRIPE_API_KEY:'sk_live_example'}), /Live Stripe/);
});
test('R2 is all-or-nothing when a bucket is selected', () => {
  assert.throws(() => readEnvironment({...base, S3_BUCKET:'sericia-product-media'}), /S3_FILE_URL/);
  const r2 = readEnvironment({...base, S3_BUCKET:'sericia-product-media', S3_FILE_URL:'https://media.example.com',
    S3_ACCESS_KEY_ID:'test', S3_SECRET_ACCESS_KEY:'test', S3_ENDPOINT:'https://test.r2.cloudflarestorage.com'}).r2;
  assert.equal(r2.region, 'auto');
  assert.equal(r2.additional_client_config.requestChecksumCalculation, 'WHEN_REQUIRED');
});
