pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/comparators.circom";
include "../../node_modules/circomlib/circuits/bitify.circom";
include "../../node_modules/circomlib/circuits/poseidon.circom";

template HitAndBlow() {
    // Public inputs
    signal input pubGuessA;
    signal input pubGuessB;
    signal input pubGuessC;
    signal input pubGuessD;
    signal input pubGuessE;
    signal input pubGuessF;
    signal input pubGuessG;
    signal input pubGuessH;

    signal input pubNumHit;
    signal input pubNumBlow;
    signal input pubSolnHash;

    // Private inputs
    signal input privSolnA;
    signal input privSolnB;
    signal input privSolnC;
    signal input privSolnD;
    signal input privSolnE;

    signal input privSalt;

    // Output
    signal output solnHashOut;

    var guess[8] = [pubGuessA, pubGuessB, pubGuessC, pubGuessD, pubGuessE, pubGuessF, pubGuessG, pubGuessH];
    var soln[5] =  [privSolnA, privSolnB, privSolnC, privSolnD, privSolnE];
    var j = 0;
    var k = 0;
    component lessThan[13];
    component equalGuess[6];
    component equalSoln[6];
    var equalIdx = 0;

    // Create a constraint that the solution and guess digits are all less than 10.
    for (j=0; j<8; j++) {
        lessThan[j] = LessThan(4);
        lessThan[j].in[0] <== guess[j];
        lessThan[j].in[1] <== 10;
        lessThan[j].out === 1;
        lessThan[j+4] = LessThan(4);
        lessThan[j+4].in[0] <== soln[j];
        lessThan[j+4].in[1] <== 10;
        lessThan[j+4].out === 1;
        for (k=j+1; k<5; k++) {
            // Create a constraint that the solution and guess digits are unique. no duplication.
            equalGuess[equalIdx] = IsEqual();
            equalGuess[equalIdx].in[0] <== guess[j];
            equalGuess[equalIdx].in[1] <== guess[k];
            equalGuess[equalIdx].out === 0;
            equalSoln[equalIdx] = IsEqual();
            equalSoln[equalIdx].in[0] <== soln[j];
            equalSoln[equalIdx].in[1] <== soln[k];
            equalSoln[equalIdx].out === 0;
            equalIdx += 1;
        }
    }

    // Count hit & blow
    var hit = 0;
    var blow = 0;
    component equalHB[40];

    for (j=0; j<8; j++) {
        for (k=0; k<5; k++) {
            equalHB[8*j+k] = IsEqual();
            equalHB[8*j+k].in[0] <== soln[j];
            equalHB[8*j+k].in[1] <== guess[k];
            blow += equalHB[4*j+k].out;
            if (j == k) {
                hit += equalHB[8*j+k].out;
                blow -= equalHB[8*j+k].out;
            }
        }
    }

    // Create a constraint around the number of hit
    component equalHit = IsEqual();
    equalHit.in[0] <== pubNumHit;
    equalHit.in[1] <== hit;
    equalHit.out === 1;
    
    // Create a constraint around the number of blow
    component equalBlow = IsEqual();
    equalBlow.in[0] <== pubNumBlow;
    equalBlow.in[1] <== blow;
    equalBlow.out === 1;

    // Verify that the hash of the private solution matches pubSolnHash
    component poseidon = Poseidon(6);
    poseidon.inputs[0] <== privSalt;
    poseidon.inputs[1] <== privSolnA;
    poseidon.inputs[2] <== privSolnB;
    poseidon.inputs[3] <== privSolnC;
    poseidon.inputs[4] <== privSolnD;
    poseidon.inputs[5] <== privSolnE;

    solnHashOut <== poseidon.out;
    pubSolnHash === solnHashOut;
 }

 component main {public [pubGuessA, pubGuessB, pubGuessC, pubGuessD, pubGuessE, pubGuessF, 
    pubGuessG, pubGuessH pubNumHit, pubNumBlow, pubSolnHash]} = HitAndBlow();