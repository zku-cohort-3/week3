//[assignment] write your own unit test to show that your Mastermind variation circuit is working as expected\
//一旦普通のmasterminfでテストを実行しましょう

const chai = require("chai");
const path = require("path");
import { pedersenHash } from "./pedersen";
import { unstringifyBigInts, genSolnInput, genSalt } from "./utils";

const wasm_tester = require("circom_tester").wasm;

describe("Super MasterMind Tests", function () {
  this.timeout(20000);

  it("pub inputs are filled", async () => {
    const circuit = await wasm_tester("contracts/circuits/hitandblow.circom");
    await circuit.loadConstraints();
    console.log(circuit);

    const testCase = {
      guess: [1, 2, 2, 1],
      soln: [2, 2, 1, 2],
      whitePegs: 2,
      blackPegs: 1,
    };

    const soln = genSolnInput(testCase.soln);
    const saltSoln = soln.add(genSalt());
    const hashedSoln = pedersenHash(saltSoln);

    const INPUT = {
      pubNumBlacks: testCase.blackPegs.toString(),
      pubNumWhites: testCase.whitePegs.toString(),

      pubSolnHash: hashedSoln.encodedHash.toString(),
      privSaltedSoln: saltedSoln.toString(),

      pubGuessA: testCase.guess[0],
      pubGuessB: testCase.guess[1],
      pubGuessC: testCase.guess[2],
      pubGuessD: testCase.guess[3],
      privSolnA: testCase.soln[0],
      privSolnB: testCase.soln[1],
      privSolnC: testCase.soln[2],
      privSolnD: testCase.soln[3],
    };

    const witness = await circuit.calculateWitness(testCase, false);
    console.log(witness);
  });
});
