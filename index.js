const request = require('request');
var btc = require('bitcoinjs-lib');
var network = btc.networks.testnet;
var blockExplorerTestnetApiEndpoint = 'https://testnet.blockexplorer.com/api/';

// get randoms keys
var getKeys = function () {
    var firstKeys = btc.ECPair.makeRandom({
        network: network
    });
    var secondKeys = btc.ECPair.makeRandom({
        network: network
    });
    
    console.log(firstKeys.toWIF(), firstKeys.privateKey);
    console.log(secondKeys.toWIF(),secondKeys.privateKey);
    return [firstKeys, secondKeys];
};

// get ouputTransactions
var getOutputs = function (address) {
    var url = blockExplorerTestnetApiEndpoint + 'addr/' + address + '/utxo';
    return new Promise(function (resolve, reject) {
        request.get(url, function (err, res, body) {
            if (err) {
                reject(err);
            }
            resolve(body);
        });
}); };
/*
[
    {
        address: 'msDkUzzd69idLLGCkDFDjVRz44jHcV3pW2',
        txid: 'db2e5966c5139c6e937203d567403867643482bbd9a6624
        752bbc583ca259958',
        vout: 0,
        scriptPubKey: '76a914806094191cbd4fcd8b4169a70588ad
        c51dc02d6888ac',
        amount: 0.99992,
        satoshis: 99992000,
        height: 1258815,
        confirmations: 1011
    }
]
*/

const keys = getKeys();

var resTransactions = getOutputs('msDkUzzd69idLLGCkDFDjVRz44jHcV3pW2');

//create transaction from ouputs
var utxo = JSON.parse(resTransactions.toString());
var transaction = new btc.TransactionBuilder(network);
// add inputs to new transactions from ouputs
transaction.addInput(utxo[0].txid, utxo[0].vout);
// add ouputs new transaction
transaction.addOutput('reciever public key', 5000000);
// sign new transaction
transaction.sign(0, 'senderKeys');
// generate hex new transaction
var transactionHex = transaction.build().toHex();
// post new transaction
var txPostUrl = blockExplorerTestnetApiEndpoint + 'tx/send';
request.post({
    url: txPostUrl,
        json: {
            rawtx: transactionHex
        }
    }, function (err, res, body) {
        if (err) console.log(err);
        console.log(res);
        console.log(body);
    }
);
/*
{
    txid: "db2e5966c5139c6e937203d567403867643482bbd9a6624752bbc583ca259958"
}
*/

