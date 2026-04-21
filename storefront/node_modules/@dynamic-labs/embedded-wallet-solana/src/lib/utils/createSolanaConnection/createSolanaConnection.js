'use client'
import { Connection } from '@solana/web3.js';

const createSolanaConnection = (rpcUrl, commitmentOrConfig) => {
    if (!rpcUrl)
        throw new Error('rpcUrl is required');
    return new Connection(rpcUrl, commitmentOrConfig);
};

export { createSolanaConnection };
