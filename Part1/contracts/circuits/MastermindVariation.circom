pragma circom 2.0.0;

// [assignment] implement a variation of mastermind from https://en.wikipedia.org/wiki/Mastermind_(board_game)#Variation as a circuit

/*
	The examples provided are a game where one must guess a 4-digit number - 4 spaces with a range of 10 (0-9) per space.
	I've chosen to go with a variation of this with 5 spaces, each with a range of 5 (1-5). This is rather simple, as warm/hot hits will always equal 5.
	It could be improved by increasing input range, say a combo of 2 digit numbers 22-45-96-5-77. But for now, 1-2-3-4-5 for practice.
	- Digits must be 1 >= n <= 5
	- Each must be unique and not repeated
	Valid solutions/guesses:
		1 2 3 4 5
		5 2 4 1 3
		5 3 1 2 4
	Invalid solutions/guesses:
		0 1 2 3 7
		2 2 4 4 1
		1 2 3
*/

include "../../node_modules/circomlib/circuits/comparators.circom";
include "../../node_modules/circomlib/circuits/bitify.circom";
include "../../node_modules/circomlib/circuits/poseidon.circom";
include "./RangeProof.circom";

/**
	This circuit checks for valid mastermind guesses and solutions and checks for accuracy of the guesses solving for the solution.
*/
template MastermindFive() {
	// Public inputs
	signal input publicGuessA;
	signal input publicGuessB;
	signal input publicGuessC;
	signal input publicGuessD;
	signal input publicGuessE;
	signal input publicHitsHot; // correct digit in correct space
	signal input publicHitsWarm; // correct digit in incorrect space
	signal input publicSolutionHash;

	// Private inputs
	signal input privateSolutionA;
	signal input privateSolutionB;
	signal input privateSolutionC;
	signal input privateSolutionD;
	signal input privateSolutionE;
	signal input privateSalt; // use for hashing

	// Output
	signal output solutionHashOut;

	// Intermediary helpers
	var guesses[5] = [publicGuessA, publicGuessB, publicGuessC, publicGuessD, publicGuessE];
	var solutions[5] =  [privateSolutionA, privateSolutionB, privateSolutionC, privateSolutionD, privateSolutionE];
	var i = 0;
	var j = 0;
	component isWithinRange[10]; // An array of RangeProof circuits
	component equalGuesses[10]; // An array of IsEqual() comparators
	component equalSolutions[10]; // An array of IsEqual() comparators
	var equalityIdx = 0; // an intermediary counter

	// Create a constraint that the solution and guess digits are all between 1 >= n <= 5
	for (i=0; i<5; i++) {
		// Check for guess
		isWithinRange[i] = RangeProof();
		isWithinRange[i].in <== guesses[i];
		isWithinRange[i].out === 1;
		// Check for solution (use the slots in second half os isWithinRange array)
		isWithinRange[i+5] = RangeProof();
		isWithinRange[i+5].in <== solutions[i];
		isWithinRange[i+5].out === 1;
		// Loop through and check that each guess and solution is unique from one another
		// Starts a loop at n+1 and checks index i against remaining values using isEqual comparator
		for (j=i+1; j<5; j++) {
			// For the guess
			equalGuesses[equalityIdx] = IsEqual();
			equalGuesses[equalityIdx].in[0] <== guesses[i];
			equalGuesses[equalityIdx].in[1] <== guesses[j];
			equalGuesses[equalityIdx].out === 0; // should not be equal
			// For the solution
			equalSolutions[equalityIdx] = IsEqual();
			equalSolutions[equalityIdx].in[0] <== solutions[i];
			equalSolutions[equalityIdx].in[1] <== solutions[j];
			equalSolutions[equalityIdx].out === 0; // should not be equal
			equalityIdx += 1;
		}
	}

	// Count hot and warm guesses
	// Hot = accurate digit in accurate spot
	// Warm = accurate digit in inaccurate spot
	component equality[25]; // an array of 25 IsEqual circuits (5 * 5)
	var hot = 0;
	var warm = 0;
	var currIdx = 0;
	// Over 25 iterations, currIdx will be:
	// 0, 1, 2, 3, 5					when i is 0
	// 5, 6, 7, 8, 9 					when i is 1
	// 10, 11, 12, 13, 14 		when i is 2
	// 15, 16, 17, 18, 19			when i is 3
	// 20, 21, 22, 23, 24			when i is 4
	for (i=0; i<5; i++) {
		for (j=0; j<5; j++) {
			currIdx = 5*i+j;
			equality[currIdx] = IsEqual();
			// compare if guess matches solution for given spot
			equality[currIdx].in[0] <== solutions[i];
			equality[currIdx].in[1] <== guesses[j];
			// Check for a hot hit on the correct space
			// warm += equality[currIdx].out;
			if (i == j) {
					hot += equality[currIdx].out;
					// warm -= equality[currIdx].out;
			} else {
				// Check for a warm hit
				warm += equality[currIdx].out;
			}
		}
	}

	// Create constrainsts that the number of hot and warm hits are accurate
	component isAccurateHotHits = IsEqual();
	component isAccurateWarmHits = IsEqual();
	// hot
	isAccurateHotHits.in[0] <== publicHitsHot;
	isAccurateHotHits.in[1] <== hot;
	// warm
	isAccurateWarmHits.in[0] <== publicHitsWarm;
	isAccurateWarmHits.in[1] <== warm;
	// both should match
	isAccurateHotHits.out === 1;
	isAccurateWarmHits.out === 1;

	// Verify that the hash of the private solution matches publicSolutionHash
	component poseidon = Poseidon(6);
	poseidon.inputs[0] <== privateSolutionA;
	poseidon.inputs[1] <== privateSolutionB;
	poseidon.inputs[2] <== privateSolutionC;
	poseidon.inputs[3] <== privateSolutionD;
	poseidon.inputs[4] <== privateSolutionE;
	poseidon.inputs[5] <== privateSalt; // use the private salt
	solutionHashOut <== poseidon.out; // should be a valid poseidon hash
	publicSolutionHash === solutionHashOut; // should match the public hash
}

// Make our private signals public
component main {public [publicGuessA, publicGuessB, publicGuessC, publicGuessD, publicHitsHot, publicHitsWarm, publicSolutionHash]} = MastermindFive();

