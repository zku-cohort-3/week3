//[assignment] write your own unit test to show that your Mastermind variation circuit is working as expected\

const chai = require("chai");

const wasm_tester = require("circom_tester").wasm;
const assert = chai.assert;

const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString(
  "21888242871839275222246405745257275088548364400416034343698204186575808495617"
);
const Fr = new F1Field(exports.p);

describe("MasterMind Tests", function () {
  this.timeout(100000000);

  // it("should true original mastermind", async () => {
  //   const circuit = await wasm_tester("contracts/circuits/hitandblow.circom");
  //   await circuit.loadConstraints();

  //   const testCase = {
  //     guess: ["5", "4", "3", "2"],
  //     soln: ["5", "4", "3", "2"],
  //     blowPegs: "4",
  //     hitPegs: "0",
  //   };
  //   console.log(testCase.soln);
  //   console.log(testCase.soln.length);

  //   const poseidon = await buildPoseidon();
  //   const poseidonHash = poseidon(testCase.soln);
  //   console.log(poseidonHash);
  //   const hash = poseidon.F.toObject(poseidonHash);
  //   console.log(hash);

  //   const INPUT = {
  //     pubGuessA: "5",
  //     pubGuessB: "4",
  //     pubGuessC: "3",
  //     pubGuessD: "2",
  //     pubNumHit: "4",
  //     pubNumBlow: "0",
  //     pubSolnHash:
  //       "1495238578116584814691438460316833932729105699599396707152918206731739541468",

  //     privSolnA: "5",
  //     privSolnB: "4",
  //     privSolnC: "3",
  //     privSolnD: "2",
  //     privSalt: "12354",
  //   };

  //   const witness = await circuit.calculateWitness(INPUT);
  //   assert.equal(witness[0], 1n);
  // });

  it("should true wittness", async () => {
    const circuit = await wasm_tester(
      "contracts/circuits/MastermindVariation.circom"
    );
    await circuit.loadConstraints();

    const INPUT = {
      pubGuessA: "5",
      pubGuessB: "4",
      pubGuessC: "3",
      pubGuessD: "2",
      pubGuessE: "1",

      pubNumHit: "5",
      pubNumBlow: "0",
      pubSolnHash:
        "11645460396676660026079729241894520513777884186412360415867506828064962469608",

      privSolnA: "5",
      privSolnB: "4",
      privSolnC: "3",
      privSolnD: "2",
      privSolnE: "1",
      privSalt: "12345",
    };

    const witness = await circuit.calculateWitness(INPUT);
    assert(Fr.eq(Fr.e(witness[0]), Fr.e(1)));
    assert.equal(witness[0], 1n);
  });
});
