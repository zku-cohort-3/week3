pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/comparators.circom";

/**
	This circuit checks if the given input is in the range of 1-5, and it can be either 1 or 5 as well.
*/
template RangeProof() {
    signal input in; // this is the number to be proved inside the range
    signal output out;

    component low = LessEqThan(4);
    component high = GreaterEqThan(4);

    low.in[0] <== in;
    low.in[1] <== 5;
    high.in[0] <== in;
    high.in[1] <== 1;
    out <== low.out * high.out;
}
