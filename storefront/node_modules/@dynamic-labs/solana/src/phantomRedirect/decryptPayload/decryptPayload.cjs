'use client'
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var bs58 = require('bs58');
var nacl = require('tweetnacl');
var logger = require('../../utils/logger.cjs');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var bs58__default = /*#__PURE__*/_interopDefaultLegacy(bs58);
var nacl__default = /*#__PURE__*/_interopDefaultLegacy(nacl);

const failForMissingParam = (paramName, param) => {
    const message = `Failed to decrypt phantom redirect payload: ${paramName} was invalid (${param})`;
    logger.logger.error(message);
    throw new Error(message);
};
const decryptPayload = (data, nonce, sharedSecret) => {
    if (!data)
        failForMissingParam('data', data);
    if (!nonce)
        failForMissingParam('nonce', nonce);
    if (!sharedSecret)
        failForMissingParam('sharedSecret', sharedSecret);
    const decryptedData = nacl__default["default"].box.open.after(bs58__default["default"].decode(data), bs58__default["default"].decode(nonce), sharedSecret);
    if (!decryptedData) {
        throw new Error('Unable to decrypt data');
    }
    return JSON.parse(Buffer.from(decryptedData).toString('utf8'));
};

exports.decryptPayload = decryptPayload;
