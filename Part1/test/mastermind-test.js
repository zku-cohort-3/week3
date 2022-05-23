//[assignment] write your own unit test to show that your Mastermind variation circuit is working as expected
const { poseidonContract } = require("circomlibjs");
const chai = require("chai");
const path = require("path");

const wasm_tester = require("circom_tester").wasm;

const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);

const assert = chai.assert;

describe("Binary sum test", function () {
    this.timeout(100000000);

    it("Should create a constant circuit", async () => {
        const circuit = await wasm_tester("/Users/willjiang/Desktop/BlockChain/ZKU/week3/Part1/contracts/circuits/MastermindVariation.circom");

        await circuit.loadConstraints();

        const INPUT = {
            "pubGuessA": 1,
            "pubGuessB": 2,
            "pubGuessC": 3,
            "pubGuessD": 4,
            "pubGuessE": 5,
            "pubNumHit": 5,
            "pubNumBlow": 0,
            "pubSolnHash": 2270772356636569352506466833589959572225506174548229038911029986980743921057n,
            "privSolnA": 1,
            "privSolnB": 2,
            "privSolnC": 3,
            "privSolnD": 4,
            "privSolnE": 5,
            "privSalt": 12312312
        }
    
        const witness = await circuit.calculateWitness(INPUT, true);

        // console.log(witness);

        // assert(Fr.eq(Fr.e(witness[0]),Fr.e(1)));
        // assert(Fr.eq(Fr.e(witness[1]),Fr.e(1)));
    });
});