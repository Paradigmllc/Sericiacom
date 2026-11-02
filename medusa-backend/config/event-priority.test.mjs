import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const RedisEventBus = require('@medusajs/event-bus-redis/dist/services/event-bus-redis').default;
test('internal and catalog events use a priority accepted by BullMQ', () => {
  const source = readFileSync(new URL('../medusa-config.ts', import.meta.url), 'utf8');
  const priority = Number(source.match(/jobOptions: \{ priority: (\d+)/)?.[1]);
  for (const internal of [false, true]) {
    const [job] = RedisEventBus.prototype.buildEvents.call({ jobOptions_: { priority }, logger_: { warn: assert.fail } }, [{ name: 'product.updated', data: { id: 'prod_test' } }], { internal });
    assert.ok(job.opts.priority > 0 && job.opts.priority < 2 ** 21);
  }
});
