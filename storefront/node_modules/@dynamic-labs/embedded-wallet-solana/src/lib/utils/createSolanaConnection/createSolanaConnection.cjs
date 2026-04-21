'use client'
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var web3_js = require('@solana/web3.js');

const createSolanaConnection = (rpcUrl, commitmentOrConfig) => {
    if (!rpcUrl)
        throw new Error('rpcUrl is required');
    return new web3_js.Connection(rpcUrl, commitmentOrConfig);
};

exports.createSolanaConnection = createSolanaConnection;
