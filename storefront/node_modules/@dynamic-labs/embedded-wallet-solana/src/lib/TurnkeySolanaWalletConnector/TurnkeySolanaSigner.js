'use client'
import { __awaiter } from '../../../_virtual/_tslib.js';
import { PublicKey } from '@solana/web3.js';

class TurnkeySolanaSigner {
    constructor({ walletConnector, }) {
        this.isConnected = true;
        this.providers = [this];
        this.walletConnector = walletConnector;
        this.turnkeyAddress = this.walletConnector.turnkeyAddress;
        this.publicKey = this.turnkeyAddress
            ? new PublicKey(this.turnkeyAddress)
            : undefined;
    }
    signMessage(encodedMessage) {
        return __awaiter(this, void 0, void 0, function* () {
            const signedMessage = yield this.walletConnector.signUint8ArrayMessage(encodedMessage);
            return { signature: signedMessage };
        });
    }
    signTransaction(transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.walletConnector.signTransaction(transaction);
        });
    }
    signAllTransactions(transactions) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.walletConnector.signAllTransactions(transactions);
        });
    }
    signAndSendTransaction(transaction, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const signature = yield this.walletConnector.signAndSendTransaction(transaction, options);
            return { signature };
        });
    }
    connect(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _args) {
        return __awaiter(this, void 0, void 0, function* () {
            return { address: this.turnkeyAddress, publicKey: this.publicKey };
        });
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            return;
        });
    }
}

export { TurnkeySolanaSigner };
