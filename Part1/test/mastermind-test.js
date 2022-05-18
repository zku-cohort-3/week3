//[assignment] write your own unit test to show that your Mastermind variation circuit is working as expected\
//一旦普通のmasterminfでテストを実行しましょう
const crypto = require("crypto");
const snarkjs = require("snarkjs");
// const bigInt = snarkjs.bigInt;
// console.log(bigInt);
const bigInt = require("big-integer");
const utils = require("ffjavascript").utils;

const genSolnInput = (soln) => {
  let m = bigInt(0);

  for (let i = soln.length - 1; i >= 0; i--) {
    m = m.add(bigInt(soln[i] * 4 ** i));
  }

  return m;
};

const unstringifyBigInts = (o) => {
  if (typeof o === "string" && /^[0-9]+$/.test(o)) {
    return bigInt(o);
  } else if (Array.isArray(o)) {
    return o.map(unstringifyBigInts);
  } else if (typeof o === "object") {
    const res = {};
    for (let k in o) {
      res[k] = unstringifyBigInts(o[k]);
    }
    return res;
  } else {
    return o;
  }
};

const stringifyBigInts = (o) => {
  //@ts-ignore TS2365
  if (typeof o == "bigint" || o instanceof bigInt) {
    return o.toString(10);
  } else if (Array.isArray(o)) {
    return o.map(stringifyBigInts);
  } else if (typeof o === "object") {
    const res = {};
    for (let k in o) {
      res[k] = stringifyBigInts(o[k]);
    }
    return res;
  } else {
    return o;
  }
};

const genSalt = () => {
  // the maximum integer supported by Solidity is (2 ^ 256), which is 32
  // bytes long
  const buf = crypto.randomBytes(30);
  const salt = utils.leBuff2int(buf) - 340n;
  console.log(salt);
  console.log(bigInt(340));

  // 4 * (4^3) + 4 * (4^2) + 4 * (4^1) + 4 * (4^0) = 340
  // Only return values greater than the largest possible solution
  if (salt < 340n) {
    return genSalt();
  }

  return salt;
};

/////pedersen//////

const pedersen = require("circomlib").pedersenHash;
const babyJub = require("circomlib").babyjub;

const pedersenHash = (val) => {
  const buff = utils.leInt2Buff(val, 32n);
  const hashed = pedersen.hash(buff);
  const hashAsInt = utils.leBuff2int(hashed);
  const result = babyJub.unpackPoint(hashed);
  const encodedHash = encodePedersen(result);

  return {
    encodedHash,
    babyJubX: result[0],
    babyJubY: result[1],
  };
};

const pedersenHashDouble = (a, b) => {
  return pedersenHash(joinEncodedHashes(a, b));
};

const joinEncodedHashes = (a, b) => {
  const bufA = bigInt.leInt2Buff(a, 32);
  const bufB = bigInt.leInt2Buff(b, 32);
  const resultBuf = Buffer.alloc(32);

  for (let i = 0; i < 16; i++) {
    resultBuf[i + 16] = bufA[i];
    resultBuf[i] = bufB[i];
  }

  const result = bigInt.leBuff2int(resultBuf);

  return result;
};

const encodePedersen = (unpackedPoint) => {
  const xBuff = bigInt.leInt2Buff(unpackedPoint[0], 32);
  const yBuff = bigInt.leInt2Buff(unpackedPoint[1], 32);

  const result = Buffer.alloc(32);

  result[31] = xBuff[31];

  for (let i = 0; i < 31; i++) {
    result[i] = yBuff[i];
  }
  return bigInt.leBuff2int(result, 32);
};

if (require.main === module) {
  const input = bigInt(process.argv[2]);
  const hash = pedersenHash(input).encodedHash.toString();
  console.log(hash);
}

const wasm_tester = require("circom_tester").wasm;

describe("Super MasterMind Tests", function () {
  this.timeout(20000);

  it("pub inputs are filled", async () => {
    const circuit = await wasm_tester("contracts/circuits/hitandblow.circom");
    await circuit.loadConstraints();

    const testCase = {
      guess: [1, 2, 2, 1],
      soln: [2, 2, 1, 2],
      whitePegs: 2,
      blackPegs: 1,
    };

    const soln = genSolnInput(testCase.soln);
    const saltedSoln = soln.add(genSalt());
    console.log(soln);
    console.log(saltedSoln);
    // const hashedSoln = pedersenHash(saltedSoln);

    const INPUT = {
      pubGuessA: testCase.guess[0],
      pubGuessB: testCase.guess[1],
      pubGuessC: testCase.guess[2],
      pubGuessD: testCase.guess[3],
      pubNumBlacks: testCase.blackPegs.toString(),
      pubNumWhites: testCase.whitePegs.toString(),
      pubSolnHash:
        "21888242871839275222246405745257275088548364400416034343698204186575808495617",

      privSolnA: testCase.soln[0],
      privSolnB: testCase.soln[1],
      privSolnC: testCase.soln[2],
      privSolnD: testCase.soln[3],
      privSaltedSoln: saltedSoln.toString(),
    };
    const witness = await circuit.calculateWitness(INPUT, false);
    console.log(witness);
  });
});
