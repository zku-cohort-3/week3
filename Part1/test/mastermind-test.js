//[assignment] write your own unit test to show that your Mastermind variation circuit is working as expected
const path = require('path')
const F1Field = require('ffjavascript').F1Field
const Scalar = require('ffjavascript').Scalar
const { buildPoseidon } = require('circomlibjs')
const { assert } = require('chai')
const { wasm } = require('circom_tester')

exports.p = Scalar.fromString(
	'21888242871839275222246405745257275088548364400416034343698204186575808495617',
)
const Fr = new F1Field(exports.p)

describe('MastermindFive Circuit', function () {
	const CONTRACT_PATH = path.join(__dirname, '../contracts/circuits', 'MastermindVariation.circom')
	this.timeout(100000000)
	// this.timeout(100000)
	let circuit, poseidon

	beforeEach(async () => {
		// Instantiate contract
		circuit = await wasm(CONTRACT_PATH)
		await circuit.loadConstraints()
		poseidon = await buildPoseidon()
	})

	it('Should have the right number of constraints', () => {
		assert.isNotNull(circuit)
		assert.equal(circuit.nVars, 519)
		assert.equal(circuit.constraints.length, 535)
	})

	it('Should verify that guesses and solutions are of unique values', async () => {
		const guess = [1, 2, 3, 4, 5]
		const solution = [5, 2, 1, 4, 3] // 2 hot, 3 warm
		const salt = ethers.BigNumber.from(ethers.utils.randomBytes(32)).toString()
		const solutionHash = ethers.BigNumber.from(
			Fr.toObject(poseidon([...solution, salt])),
		).toString()
		const input = {
			publicGuessA: guess[0],
			publicGuessB: guess[1],
			publicGuessC: guess[2],
			publicGuessD: guess[3],
			publicGuessE: guess[4],
			publicHitsHot: 2,
			publicHitsWarm: 3,
			publicSolutionHash: solutionHash,
			//	private vars
			privateSolutionA: solution[0],
			privateSolutionB: solution[1],
			privateSolutionC: solution[2],
			privateSolutionD: solution[3],
			privateSolutionE: solution[4],
			privateSalt: salt,
		}
		const witness = await circuit.calculateWitness(input, true)
		console.log(witness)
		// assert(Fr.eq(Fr.e(witness[0]), Fr.e(1)))
		// assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)))

		// Incorrect guess, should fail
		const wrong = [2, 2, 3, 4, 4]
	})

	// it.skip('Should verify that guesses and solutions are between numbers 1 and 5', async () => {})
})

// ========== FOR REFERENCE ==========
// describe('Binary sum test', function () {
// 	this.timeout(100000000)

// 	it('Should create a constant circuit', async () => {
// 		const circuit = await wasm_tester(path.join(__dirname, 'circuits', 'constants_test.circom'))
// 		await circuit.loadConstraints()
// 		assert.equal(circuit.nVars, 2)
// 		assert.equal(circuit.constraints.length, 1)

// 		const witness = await circuit.calculateWitness({ in: Fr.toString(Fr.e('0xd807aa98')) }, true)

// 		assert(Fr.eq(Fr.e(witness[0]), Fr.e(1)))
// 		assert(Fr.eq(Fr.e(witness[1]), Fr.e('0xd807aa98')))
// 	})
// 	it('Should create a sum circuit', async () => {
// 		assert.equal(circuit.constraints.length, 97) // 32 (in1) + 32(in2) + 32(out) + 1 (carry)

// 		const witness = await circuit.calculateWitness({ a: '111', b: '222' }, true)

// 		assert(Fr.eq(Fr.e(witness[0]), Fr.e(1)))
// 		assert(Fr.eq(Fr.e(witness[1]), Fr.e('333')))
// 	})
// })
