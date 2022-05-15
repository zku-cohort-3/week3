import {
  buildEddsaModule,
  decrypt,
  encrypt,
  genKeypair,
  genEcdhSharedKey,
  EdDSA
} from '../index';

describe('ECDH test', () => {
  let eddsa: EdDSA;
  beforeAll(async () => {
    eddsa = await buildEddsaModule();
  }, 15000);

  it('should encrypt/decrypt text', async () => {
    const { privKey: bobPrivKey, pubKey: bobPubKey } = genKeypair(eddsa);
    const { privKey: alicePrivKey, pubKey: alicePubKey } = genKeypair(eddsa);
    const ecdhSharedKey = await genEcdhSharedKey({
      eddsa,
      privKey: alicePrivKey,
      pubKey: bobPubKey,
    });

    const aliceMessage: bigint[] = [];
    for (let i = 0; i < 5; i++) {
      aliceMessage.push(BigInt(Math.floor(Math.random() * 50)));
    }
    //console.log('plaintext:', aliceMessage);
    // Alice encrypt with her private key and bob pubkey
    const ciphertext = await encrypt(aliceMessage, ecdhSharedKey);

    // decrypting using bob's private key + alice pubkey
    const ecdhbobSharedKey = await genEcdhSharedKey({
      eddsa,
      privKey: bobPrivKey,
      pubKey: alicePubKey,
    });
    const decryptedMessage = await decrypt(ciphertext, ecdhbobSharedKey);
    expect(decryptedMessage).toStrictEqual(aliceMessage);
  });

  it('should fail if decrypted with incorrect public key', async () => {
    const { privKey: bobPrivKey, pubKey: bobPubKey } = genKeypair(eddsa);
    const { privKey: alicePrivKey } = genKeypair(eddsa);

    const ecdhSharedKey = await genEcdhSharedKey({
      eddsa,
      privKey: alicePrivKey,
      pubKey: bobPubKey,
    });

    const aliceMessage: bigint[] = [];
    for (let i = 0; i < 5; i++) {
      aliceMessage.push(BigInt(Math.floor(Math.random() * 50)));
    }
    //console.log('plaintext:', aliceMessage);
    // Alice encrypt with her private key and bob pubkey
    const ciphertext = await encrypt(aliceMessage, ecdhSharedKey);

    const maliciousPubKey = [eddsa.prv2pub(123n.toString())];
    const ecdhSharedIncorrectKey = await genEcdhSharedKey({
      eddsa,
      privKey: bobPrivKey,
      pubKey: maliciousPubKey,
    });

    const decryptedMessage = await decrypt(ciphertext, ecdhSharedIncorrectKey);
    expect(decryptedMessage).not.toEqual(aliceMessage);
  });
});