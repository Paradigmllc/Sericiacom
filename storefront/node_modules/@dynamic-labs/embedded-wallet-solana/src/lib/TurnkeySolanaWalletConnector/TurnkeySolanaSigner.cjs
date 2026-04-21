'use client'
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var _tslib = require('../../../_virtual/_tslib.cjs');
var web3_js = require('@solana/web3.js');

class TurnkeySolanaSigner {
    constructor({ walletConnector, }) {
        this.isConnected = true;
        this.providers = [this];
        this.walletConnector = walletConnector;
        this.turnkeyAddress = this.walletConnector.turnkeyAddress;
        this.publicKey = this.turnkeyAddress
            ? new web3_js.PublicKey(this.turnkeyAddress)
            : undefined;
    }
    signMessage(encodedMessage) {
        return _tslib.__awaiter(this, void 0, void 0, function* () {
            const signedMessage = yield this.walletConnector.signUint8ArrayMessage(encodedMessage);
            return { signature: signedMessage };
        });
    }
    signTransaction(transaction) {
        return _tslib.__awaiter(this, void 0, void 0, function* () {
            return this.walletConnector.signTransaction(transaction);
        });
    }
    signAllTransactions(transactions) {
        return _tslib.__awaiter(this, void 0, void 0, function* () {
            return this.walletConnector.signAllTransactions(transactions);
        });
    }
    signAndSendTransaction(transaction, options) {
        return _tslib.__awaiter(this, void 0, void 0, function* () {
            const signature = yield this.walletConnector.signAndSendTransaction(transaction, options);
            return { signature };
        });
    }
    connect(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _args) {
        return _tslib.__awaiter(this, void 0, void 0, function* () {
            return { address: this.turnkeyAddress, publicKey: this.publicKey };
        });
    }
    disconnect() {
        return _tslib.__awaiter(this, void 0, void 0, function* () {
            return;
        });
    }
}

exports.TurnkeySolanaSigner = TurnkeySolanaSigner;
