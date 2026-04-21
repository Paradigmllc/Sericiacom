'use client'
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var nacl = require('tweetnacl');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var nacl__default = /*#__PURE__*/_interopDefaultLegacy(nacl);

const encryptPayload = (payload, sharedSecret) => {
    const nonce = nacl__default["default"].randomBytes(24);
    const encryptedPayload = nacl__default["default"].box.after(Buffer.from(JSON.stringify(payload)), nonce, sharedSecret);
    return [nonce, encryptedPayload];
};

exports.encryptPayload = encryptPayload;
