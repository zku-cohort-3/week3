//[assignment] write your own unit test to show that your Mastermind variation circuit is working as expected\
//一旦普通のmasterminfでテストを実行しましょう

const chai = require("chai");

const wasm_tester = require("circom_tester").wasm;
const assert = chai.assert;

describe("Super MasterMind Tests", function () {
  this.timeout(100000000);

  it("should false wittness", async () => {
    const circuit = await wasm_tester("contracts/circuits/hitandblow.circom");
    await circuit.loadConstraints();

    const INPUT = {
      pubGuessA: "5",
      pubGuessB: "4",
      pubGuessC: "3",
      pubGuessD: "2",
      pubNumHit: "4",
      pubNumBlow: "0",
      pubSolnHash:
        "13630663015064836160108906220859308498479326522620485278897182547087795876906",
      privSolnA: "5",
      privSolnB: "4",
      privSolnC: "3",
      privSolnD: "2",
      privSalt: "12354",
    };

    const witness = await circuit.calculateWitness(INPUT);
    console.log("witness = ", witness);
    assert.equal(witness[0], 1n);
  });
});
