//By Jnbez 


const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("Two parties Scenario : ", function () {




  it("Should InitiateEncryption successfully", async function () {
    const YourContract = await ethers.getContractFactory("multi_RNG");
    const contract = await YourContract.deploy();
    await contract.deployed();

    // Get the first two default accounts provided by Hardhat
    const [signer1, signer2] = await ethers.getSigners();

    // Create a new Contract instance using the specified Signer and from address
    const contractAddress = contract.address;
    const contractAbi = YourContract.interface.fragments;
    const contractWithSigner1 = new ethers.Contract(contractAddress, contractAbi, signer1);

    // Use the same Ethereum addresses as signer1 and signer2 for the others array
    const others = [await signer2.getAddress()];

    // Define the expected event parameters
    const id = 1;
    const parties = [ await signer1.getAddress(),await signer2.getAddress()];
    const z = 1234;
    const d = 5678;
    const e = 91011;

    // Call the InitiateEncryption function
    const tx = await contractWithSigner1.InitiateEncryption(id, others, e, z, d);

    // Parse the EncryptionInitiated event from the transaction receipt using queryFilter
    const events = await contract.queryFilter(['EncryptionInitiated'], tx.blockNumber, tx.blockNumber);
    const actualId = events[0].args[0].toNumber();
    const actualE = events[0].args[4].toNumber();
    const actualZ = events[0].args[2].toNumber();
    const actualD = events[0].args[3].toNumber();
    const actualParties = events[0].args[1];


    // Verify that the event was emitted with the correct parameters using expect statements
    expect(actualId).to.equal(id);
    expect(actualParties.map((addr) => addr.toLowerCase())).to.have.members(parties.map((addr) => addr.toLowerCase()));
    expect(actualE).to.equal(e);
    expect(actualZ).to.equal(z);
    expect(actualD).to.equal(d);
});



it("Should AcceptEncryption successfully", async function () {

  const YourContract = await ethers.getContractFactory("multi_RNG");
  const contract = await YourContract.deploy();
  await contract.deployed();

  // Get the first two default accounts provided by Hardhat
  const signer1 = await ethers.provider.getSigner(0);
  const signer2 = await ethers.provider.getSigner(1);

  // Create a new Contract instance using the specified Signer and from address
  const contractAddress = contract.address;
  const contractAbi = YourContract.interface.fragments;
  const contractWithSigner1 = new ethers.Contract(contractAddress, contractAbi, signer1);
  const contractWithSigner2 = new ethers.Contract(contractAddress, contractAbi, signer2);

  // Use the same Ethereum addresses as signer1 and signer2 for the others array
  const others = [await signer2.getAddress()];

  // Initiate encryption with the specified addresses
  await contractWithSigner1.InitiateEncryption(1, others, 1234, 5678, 91011);

  // Accept encryption from authorized parties
  const tx =await contractWithSigner2.AcceptEncryption(1, 2345);
  parties=[await signer2.getAddress()] ;

  const events = await contract.queryFilter(['EncryptionAccepted'], tx.blockNumber, tx.blockNumber);
  const actualId = events[0].args._id.toNumber();
  const actualE = events[0].args._Encryption;
  const actualParties = events[0].args._accepter;


  // Verify that the event was emitted with the correct parameters using expect statements
  expect(actualId).to.equal(1);
  expect(actualParties.toLowerCase()).to.equal(parties[0].toLowerCase());
  expect(actualE).to.equal(2345);




});



  it("Should Finish Procces and calculate the result correctly ", async function () {
    const YourContract = await ethers.getContractFactory("multi_RNG");
    const contract = await YourContract.deploy();
    await contract.deployed();

    // Get the first two default accounts provided by Hardhat
    const signer1 = await ethers.provider.getSigner(0);
    const signer2 = await ethers.provider.getSigner(1);

    // Create a new Contract instance using the specified Signer and from address
    const contractAddress = contract.address;
    const contractAbi = YourContract.interface.fragments;
    const contractWithSigner1 = new ethers.Contract(contractAddress, contractAbi, signer1);
    const contractWithSigner2 = new ethers.Contract(contractAddress, contractAbi, signer2);

    // Use the same Ethereum addresses as signer1 and signer2 for the others array
    const others = [await signer2.getAddress()];

    // Initiate encryption with the specified addresses
    await contractWithSigner1.InitiateEncryption(1, others, 1234, 5678, 91011);

    // Accept encryption from authorized parties
    await contractWithSigner2.AcceptEncryption(1, 2345);
    // Sign messages for each party
    const message1 = 'Final Result: 42841';
    const signature1 = await signer1.signMessage(message1);
    const { r: r1, s: s1, v: v1 } = ethers.utils.splitSignature(signature1);
    const sig1 = { message: message1, v: v1,  r: r1, s: s1,};


    const message2 = 'Final Result: 42841';
    const signature2 = await signer2.signMessage(message2);
    const { r: r2, s: s2, v: v2 } = ethers.utils.splitSignature(signature2);
    const sig2 = { message: message2,v: v2, r: r2 , s: s2 };
    

    // Finish the process with coefficients and random numbers
    const coeffs = [56789, 101121];
    const rngs = [131451, 161711];

    const expectedRes = ((131451 + 161711) % 0xE96C6372AB55884E99242C8341393C43953A3C8C6F6D57B3B863C882DEFFC3B7 % (91011 - 5678)) + 5678;


    const tx = await contractWithSigner2.Finish_Procces(1, coeffs, rngs, [sig1,sig2]);

    // Verify the result was calculated correctly
    
    const filter = {
      address: contractAddress,
      topics: [
        ethers.utils.id("Done(uint256,uint256)")
      ],
      fromBlock: tx.blockNumber,
      toBlock: tx.blockNumber
    };
    const Devents = await ethers.provider.getLogs(filter);
    const actualRes = parseInt(Devents[0].data.slice(2), 16);
    expect(actualRes).to.equal(expectedRes);

  });





  it("Should Emitt events successfully ", async function () {




  const YourContract = await ethers.getContractFactory("multi_RNG");
  const contract = await YourContract.deploy();
  await contract.deployed();

  // Get the first two default accounts provided by Hardhat
  const signer1 = await ethers.provider.getSigner(0);
  const signer2 = await ethers.provider.getSigner(1);

  // Create a new Contract instance using the specified Signer and from address
  const contractAddress = contract.address;
  const contractAbi = YourContract.interface.fragments;
  const contractWithSigner1 = new ethers.Contract(contractAddress, contractAbi, signer1);
  const contractWithSigner2 = new ethers.Contract(contractAddress, contractAbi, signer2);

  const others = [await signer2.getAddress()];

  // Initiate encryption with the specified addresses
  await contractWithSigner1.InitiateEncryption(1, others, 1234, 5678, 91011);

  // Accept encryption from authorized parties
  await contractWithSigner2.AcceptEncryption(1, 2345);
  // Sign messages for each party
  const message1 = 'Final Result: 42841';
  const signature1 = await signer1.signMessage(message1);
  const { r: r1, s: s1, v: v1 } = ethers.utils.splitSignature(signature1);
  const sig1 = { message: message1, v: v1,  r: r1, s: s1,};


  const message2 = 'Final Result: 42841';
  const signature2 = await signer2.signMessage(message2);
  const { r: r2, s: s2, v: v2 } = ethers.utils.splitSignature(signature2);
  const sig2 = { message: message2,v: v2, r: r2 , s: s2 };
  

  // Finish the process with coefficients and random numbers
  const coeffs = [56789, 101112];
  const rngs = [131451, 161711];


  const expectedRes = ((131451 + 161711) % 0xE96C6372AB55884E99242C8341393C43953A3C8C6F6D57B3B863C882DEFFC3B7 % (91011 - 5678)) + 5678;
  const tx = await contractWithSigner2.Finish_Procces(1, coeffs, rngs, [sig1,sig2]);

  
  
  const events = await contract.queryFilter(['Revealed', 'Done'], tx.blockNumber);
    expect(events.length).to.equal(3);
    expect(events[0].args._id).to.equal(1);
    expect(parseInt(events[0].args._coeff)).to.equal(56789);
    expect(parseInt(events[0].args._rng)).to.equal(131451);
    expect(events[1].args._id).to.equal(1);
    expect(parseInt(events[1].args._coeff)).to.equal(101112);
    expect(parseInt(events[1].args._rng)).to.equal(161711);
    expect(events[2].args._id).to.equal(1);
    expect(parseInt(events[2].args._result)).to.equal(expectedRes);
  });
});



describe("Three / more parties Scenario :", function () {



  it("Should InitiateEncryption successfully with 3 players", async function () {
    const YourContract = await ethers.getContractFactory("multi_RNG");
    const contract = await YourContract.deploy();
    await contract.deployed();

    // Get the first three default accounts provided by Hardhat
    const [signer1, signer2,signer3] = await ethers.getSigners();

    // Create a new Contract instance using the specified Signer and from address
    const contractAddress = contract.address;
    const contractAbi = YourContract.interface.fragments;
    const contractWithSigner1 = new ethers.Contract(contractAddress, contractAbi, signer1);

    const others = [await signer2.getAddress(),signer3.getAddress()];

    const id = 1;
    const parties = [ await signer1.getAddress(),await signer2.getAddress(),await signer3.getAddress()];
    const z = 1234;
    const d = 5678;
    const e = 91011;

    // Call the InitiateEncryption function
    const tx = await contractWithSigner1.InitiateEncryption(id, others, e, z, d);

    // Parse the EncryptionInitiated event from the transaction receipt using queryFilter
    const events = await contract.queryFilter(['EncryptionInitiated'], tx.blockNumber, tx.blockNumber);
    const actualId = events[0].args[0].toNumber();
    const actualE = events[0].args[4].toNumber();
    const actualZ = events[0].args[2].toNumber();
    const actualD = events[0].args[3].toNumber();
    const actualParties = events[0].args[1];


    // Verify that the event was emitted with the correct parameters using expect statements
    expect(actualId).to.equal(id);
    expect(actualParties.map((addr) => addr.toLowerCase())).to.have.members(parties.map((addr) => addr.toLowerCase()));
    expect(actualE).to.equal(e);
    expect(actualZ).to.equal(z);
    expect(actualD).to.equal(d);
});



it("Should AcceptEncryption successfully with 3 players", async function () {

  const YourContract = await ethers.getContractFactory("multi_RNG");
  const contract = await YourContract.deploy();
  await contract.deployed();

  // Get the first three default accounts provided by Hardhat
  const signer1 = await ethers.provider.getSigner(0);
  const signer2 = await ethers.provider.getSigner(1);
  const signer3 = await ethers.provider.getSigner(2);
  // Create a new Contract instance using the specified Signer and from address
  const contractAddress = contract.address;
  const contractAbi = YourContract.interface.fragments;
  const contractWithSigner1 = new ethers.Contract(contractAddress, contractAbi, signer1);
  const contractWithSigner2 = new ethers.Contract(contractAddress, contractAbi, signer2);
  const contractWithSigner3 = new ethers.Contract(contractAddress, contractAbi, signer3);

  const others = [await signer2.getAddress(),signer3.getAddress()];

  // Initiate encryption with the specified addresses
  await contractWithSigner1.InitiateEncryption(1, others, 1234, 5678, 91011);

  // Accept encryption from authorized parties
  const tx =await contractWithSigner2.AcceptEncryption(1, 2345);
  parties=[await signer2.getAddress()] ;

  const events = await contract.queryFilter(['EncryptionAccepted'], tx.blockNumber, tx.blockNumber);
  const actualId = events[0].args._id.toNumber();
  const actualE = events[0].args._Encryption;
  const actualParties = events[0].args._accepter;


  // Verify that the event was emitted with the correct parameters using expect statements
  expect(actualId).to.equal(1);
  expect(actualParties.toLowerCase()).to.equal(parties[0].toLowerCase());
  expect(actualE).to.equal(2345);


  const  sx = await contractWithSigner3.AcceptEncryption(1,3254);
  parties1=[await signer3.getAddress()] ;
  const ev = await contract.queryFilter(['EncryptionAccepted'], sx.blockNumber, sx.blockNumber);
  const actualId1 = ev[0].args._id.toNumber();
  const actualE1 = ev[0].args._Encryption;
  const actualParties1 = ev[0].args._accepter;


  // Verify that the event was emitted with the correct parameters using expect statements
  expect(actualId1).to.equal(1);
  expect(actualParties1.toLowerCase()).to.equal(parties1[0].toLowerCase());
  expect(actualE1).to.equal(3254);
});



  it("Should Finish Procces and calculate the result correctly with 3 players", async function () {


  const YourContract = await ethers.getContractFactory("multi_RNG");
  const contract = await YourContract.deploy();
  await contract.deployed();

  // Get the first 3 default accounts provided by Hardhat
  const signer1 = await ethers.provider.getSigner(0);
  const signer2 = await ethers.provider.getSigner(1);
  const signer3 = await ethers.provider.getSigner(2);
  // Create a new Contract instance using the specified Signer and from address
  const contractAddress = contract.address;
  const contractAbi = YourContract.interface.fragments;
  const contractWithSigner1 = new ethers.Contract(contractAddress, contractAbi, signer1);
  const contractWithSigner2 = new ethers.Contract(contractAddress, contractAbi, signer2);
  const contractWithSigner3 = new ethers.Contract(contractAddress, contractAbi, signer3);

  const others = [await signer2.getAddress(),await signer3.getAddress()];

  // Initiate encryption with the specified addresses
  await contractWithSigner1.InitiateEncryption(1, others, 1234, 5678, 91011);

  // Accept encryption from authorized parties
  await contractWithSigner2.AcceptEncryption(1, 2345);
  await contractWithSigner3.AcceptEncryption(1,3452)

   ///////
  // Sign messages for each party :
  //////
  const message1 = 'Final Result:  59088';
  const signature1 = await signer1.signMessage(message1);
  const { r: r1, s: s1, v: v1 } = ethers.utils.splitSignature(signature1);
  const sig1 = { message: message1, v: v1,  r: r1, s: s1,};


  const message2 = 'Final Result:  59088';
  const signature2 = await signer2.signMessage(message2);
  const { r: r2, s: s2, v: v2 } = ethers.utils.splitSignature(signature2);
  const sig2 = { message: message2,v: v2, r: r2 , s: s2 };

  const message3 = 'Final Result:  59088'    ;
  const signature3 = await signer3.signMessage(message3);
  const { r: r3, s: s3, v: v3 } = ethers.utils.splitSignature(signature3);
  const sig3 = { message: message3, v: v3,  r: r3, s: s3};

  

  // Finish the process with coefficients and random numbers
  const coeffs = [56789, 101121,148551];
  const rngs = [131451, 161711,186913];

  const expectedRes = ((131451 + 161711+ 186913) % 0xE96C6372AB55884E99242C8341393C43953A3C8C6F6D57B3B863C882DEFFC3B7 % (91011 - 5678)) + 5678;
  
  const tx = await contractWithSigner2.Finish_Procces(1, coeffs, rngs, [sig1,sig2,sig3]);


  // Verify the result was calculated correctly
  
  const filter = {
    address: contractAddress,
    topics: [
      ethers.utils.id("Done(uint256,uint256)")
    ],
    fromBlock: tx.blockNumber,
    toBlock: tx.blockNumber
  };
  const Devents = await ethers.provider.getLogs(filter);
  const actualRes = parseInt(Devents[0].data.slice(2), 16);
  expect(actualRes).to.equal(expectedRes);


  });

  it("Should Init / Accept / Finish Procces and calculate the result correctly with 5 players", async function () {


    const YourContract = await ethers.getContractFactory("multi_RNG");
    const contract = await YourContract.deploy();
    await contract.deployed();
  
    // Get the first 5 default accounts provided by Hardhat
    const signer1 = await ethers.provider.getSigner(0);
    const signer2 = await ethers.provider.getSigner(1);
    const signer3 = await ethers.provider.getSigner(2);
    const signer4 = await ethers.provider.getSigner(3);
    const signer5 = await ethers.provider.getSigner(4);
  

    // Create a new Contract instance using the specified Signer and from address
    const contractAddress = contract.address;
    const contractAbi = YourContract.interface.fragments;
    const contractWithSigner1 = new ethers.Contract(contractAddress, contractAbi, signer1);
    const contractWithSigner2 = new ethers.Contract(contractAddress, contractAbi, signer2);
    const contractWithSigner3 = new ethers.Contract(contractAddress, contractAbi, signer3);
    const contractWithSigner4 = new ethers.Contract(contractAddress, contractAbi, signer4);
    const contractWithSigner5 = new ethers.Contract(contractAddress, contractAbi, signer5);


  
    const others = [await signer2.getAddress(),await signer3.getAddress(),
                     await signer4.getAddress(),await signer5.getAddress()];
  
    // Initiate encryption with the specified addresses
    await contractWithSigner1.InitiateEncryption(1, others, 1234, 5678, 91011);
  
    // Accept encryption from authorized parties
    await contractWithSigner2.AcceptEncryption(1,2345);
    await contractWithSigner3.AcceptEncryption(1,7859);
    await contractWithSigner4.AcceptEncryption(1,1876);
    await contractWithSigner5.AcceptEncryption(1,6879);

     ///////
    // Sign messages for each party :
    //////
    const message1 = 'Final Result: 61257';
    const signature1 = await signer1.signMessage(message1);
    const { r: r1, s: s1, v: v1 } = ethers.utils.splitSignature(signature1);
    const sig1 = { message: message1, v: v1,  r: r1, s: s1,};
  
  
    const message2 = 'Final Result: 61257';
    const signature2 = await signer2.signMessage(message2);
    const { r: r2, s: s2, v: v2 } = ethers.utils.splitSignature(signature2);
    const sig2 = { message: message2,v: v2, r: r2 , s: s2 };
  
    const message3 = 'Final Result: 61257';
    const signature3 = await signer3.signMessage(message3);
    const { r: r3, s: s3, v: v3 } = ethers.utils.splitSignature(signature3);
    const sig3 = { message: message3, v: v3,  r: r3, s: s3};
  
    
    const message4 = 'Final Result: 61257';
    const signature4 = await signer4.signMessage(message4);
    const { r: r4, s: s4, v: v4 } = ethers.utils.splitSignature(signature4);
    const sig4 = { message: message4, v: v4,  r: r4, s: s4};


    const message5 = 'Final Result: 61257';
    const signature5 = await signer5.signMessage(message5);
    const { r: r5, s: s5, v: v5 } = ethers.utils.splitSignature(signature5);
    const sig5 = { message: message5, v: v5,  r: r5, s: s5};
  
    // Finish the process with coefficients and random numbers
    const coeffs = [56789, 101121,148551,137987,769813];
  const rngs = [127271, 389473, 613189, 829211, 997757]
  ;
  
    const expectedRes = ((127271 + 389473+ 613189 + 829211 + 997757) % 0xE96C6372AB55884E99242C8341393C43953A3C8C6F6D57B3B863C882DEFFC3B7 % (91011 - 5678)) + 5678;


  
    const tx = await contractWithSigner2.Finish_Procces(1, coeffs, rngs, [sig1,sig2,sig3,sig4,sig5]);
  
    // Verify the result was calculated correctly
    
    const filter = {
      address: contractAddress,
      topics: [
        ethers.utils.id("Done(uint256,uint256)")
      ],
      fromBlock: tx.blockNumber,
      toBlock: tx.blockNumber
    };
    const Devents = await ethers.provider.getLogs(filter);
    const actualRes = parseInt(Devents[0].data.slice(2), 16);
    expect(actualRes).to.equal(expectedRes);
  
  
    });


    it("Should Init / Accept / Finish Procces and calculate the result correctly with 7 players", async function () {


      const YourContract = await ethers.getContractFactory("multi_RNG");
      const contract = await YourContract.deploy();
      await contract.deployed();
    
      // Get the first 7 default accounts provided by Hardhat
      const signer1 = await ethers.provider.getSigner(0);
      const signer2 = await ethers.provider.getSigner(1);
      const signer3 = await ethers.provider.getSigner(2);
      const signer4 = await ethers.provider.getSigner(3);
      const signer5 = await ethers.provider.getSigner(4);
      const signer6 = await ethers.provider.getSigner(5);
      const signer7 = await ethers.provider.getSigner(6);

  
      // Create a new Contract instance using the specified Signer and from address
      const contractAddress = contract.address;
      const contractAbi = YourContract.interface.fragments;
      const contractWithSigner1 = new ethers.Contract(contractAddress, contractAbi, signer1);
      const contractWithSigner2 = new ethers.Contract(contractAddress, contractAbi, signer2);
      const contractWithSigner3 = new ethers.Contract(contractAddress, contractAbi, signer3);
      const contractWithSigner4 = new ethers.Contract(contractAddress, contractAbi, signer4);
      const contractWithSigner5 = new ethers.Contract(contractAddress, contractAbi, signer5);
      const contractWithSigner6 = new ethers.Contract(contractAddress, contractAbi, signer6);
      const contractWithSigner7 = new ethers.Contract(contractAddress, contractAbi, signer7);

  
    
      const others = [await signer2.getAddress(),await signer3.getAddress(),
                      await signer4.getAddress(),await signer5.getAddress(),
                      await signer6.getAddress(),await signer7.getAddress()];
    
      // Initiate encryption with the specified addresses
      await contractWithSigner1.InitiateEncryption(1, others, 1234, 5678, 91011);
    
      // Accept encryption from authorized parties
      await contractWithSigner2.AcceptEncryption(1,2345);
      await contractWithSigner3.AcceptEncryption(1,7859);
      await contractWithSigner4.AcceptEncryption(1,1876);
      await contractWithSigner5.AcceptEncryption(1,6879);
      await contractWithSigner6.AcceptEncryption(1,5269);
      await contractWithSigner7.AcceptEncryption(1,3161);

  
       ///////
      // Sign messages for each party :
      //////
      const message1 = 'Final Result: 38225';
      const signature1 = await signer1.signMessage(message1);
      const { r: r1, s: s1, v: v1 } = ethers.utils.splitSignature(signature1);
      const sig1 = { message: message1, v: v1,  r: r1, s: s1,};
    
    
      const message2 = 'Final Result: 38225';
      const signature2 = await signer2.signMessage(message2);
      const { r: r2, s: s2, v: v2 } = ethers.utils.splitSignature(signature2);
      const sig2 = { message: message2,v: v2, r: r2 , s: s2 };
    
      const message3 = 'Final Result: 38225';
      const signature3 = await signer3.signMessage(message3);
      const { r: r3, s: s3, v: v3 } = ethers.utils.splitSignature(signature3);
      const sig3 = { message: message3, v: v3,  r: r3, s: s3};
    
      
      const message4 = 'Final Result: 38225';
      const signature4 = await signer4.signMessage(message4);
      const { r: r4, s: s4, v: v4 } = ethers.utils.splitSignature(signature4);
      const sig4 = { message: message4, v: v4,  r: r4, s: s4};
  
  
      const message5 = 'Final Result: 38225';
      const signature5 = await signer5.signMessage(message5);
      const { r: r5, s: s5, v: v5 } = ethers.utils.splitSignature(signature5);
      const sig5 = { message: message5, v: v5,  r: r5, s: s5};

      const message6 = 'Final Result: 38225';
      const signature6 = await signer6.signMessage(message6);
      const { r: r6, s: s6, v: v6 } = ethers.utils.splitSignature(signature6);
      const sig6 = { message: message6, v: v6,  r: r6, s: s6};

      const message7 = 'Final Result: 38225';
      const signature7 = await signer7.signMessage(message7);
      const { r: r7, s: s7, v: v7 } = ethers.utils.splitSignature(signature7);
      const sig7 = { message: message7, v: v7,  r: r7, s: s7}
    
      // Finish the process with coefficients and random numbers
      const coeffs = [56789, 101121,148551,137987,769813,103801,547411];
      const rngs = [127271, 389473, 613189, 829211, 997757,691721,479909];
    ;
    
      const expectedRes = ((127271 + 389473+ 613189 + 829211 + 997757 +479909 + 691721) % 0xE96C6372AB55884E99242C8341393C43953A3C8C6F6D57B3B863C882DEFFC3B7 % (91011 - 5678)) + 5678;
  
    
      const tx = await contractWithSigner2.Finish_Procces(1, coeffs, rngs, [sig1,sig2,sig3,sig4,sig5,sig6,sig7]);
    
      // Verify the result was calculated correctly
      
      const filter = {
        address: contractAddress,
        topics: [
          ethers.utils.id("Done(uint256,uint256)")
        ],
        fromBlock: tx.blockNumber,
        toBlock: tx.blockNumber
      };
      const Devents = await ethers.provider.getLogs(filter);
      const actualRes = parseInt(Devents[0].data.slice(2), 16);
      expect(actualRes).to.equal(expectedRes);
    
    
      });


  });

  

    describe("Attacks / Cheating Scenario :", function () {
    
      it("Trying to init twice , Should revert with (Already initiated)", async function () {
        const YourContract = await ethers.getContractFactory("multi_RNG");
        const contract = await YourContract.deploy();
        await contract.deployed();
    
        // Get the first two default accounts provided by Hardhat
        const [signer1, signer2] = await ethers.getSigners();
    
        // Create a new Contract instance using the specified Signer and from address
        const contractAddress = contract.address;
        const contractAbi = YourContract.interface.fragments;
        const contractWithSigner1 = new ethers.Contract(contractAddress, contractAbi, signer1);
    
        // Use the same Ethereum addresses as signer1 and signer2 for the others array
        const others = [await signer2.getAddress()];
    
        const id = 1;
        const parties = [ await signer1.getAddress(),await signer2.getAddress()];
        const z = 1234;
        const d = 5678;
        const e = 91011;
    
        // Call the InitiateEncryption function
        const tx = await contractWithSigner1.InitiateEncryption(id, others, e, z, d);

       // Call the InitiateEncryption function again with signer2
       const contractWithSigner2 = new ethers.Contract(contractAddress, contractAbi, signer2);

       await expect(
                 contractWithSigner2.InitiateEncryption(id, others, e, z, d)
                ).to.be.revertedWith("Already initiated");
      });



it("Who init the process trying to AcceptEncryption,Should revert with (Already Accepted)", async function () {


  const YourContract = await ethers.getContractFactory("multi_RNG");
  const contract = await YourContract.deploy();
  await contract.deployed();

  // Get the first two default accounts provided by Hardhat
  const signer1 = await ethers.provider.getSigner(0);
  const signer2 = await ethers.provider.getSigner(1);

  // Create a new Contract instance using the specified Signer and from address
  const contractAddress = contract.address;
  const contractAbi = YourContract.interface.fragments;
  const contractWithSigner1 = new ethers.Contract(contractAddress, contractAbi, signer1);
  const contractWithSigner2 = new ethers.Contract(contractAddress, contractAbi, signer2);

  // Use the same Ethereum addresses as signer1 and signer2 for the others array
  const others = [await signer2.getAddress()];

  // Initiate encryption with the specified addresses
  await contractWithSigner1.InitiateEncryption(1, others, 1234, 5678, 91011);

  // Accept encryption from authorized parties
  const tx =await contractWithSigner2.AcceptEncryption(1, 2345);
  await expect(
    contractWithSigner1.AcceptEncryption(1,1558)
  ).to.be.revertedWith("Already Accepted");

      });

     
 it("Attack untrusted address (unknown when init process (not in _parties ),Trying to AcceptEncryption,revert with (Not Authorized)", 
 async function () {

  const YourContract = await ethers.getContractFactory("multi_RNG");
  const contract = await YourContract.deploy();
  await contract.deployed();

  // Get the first two default accounts provided by Hardhat
  const signer1 = await ethers.provider.getSigner(0);
  const signer2 = await ethers.provider.getSigner(1);

 const unknow = await ethers.provider.getSigner(7);

  const contractAddress = contract.address;
  const contractAbi = YourContract.interface.fragments;
  const contractWithSigner1 = new ethers.Contract(contractAddress, contractAbi, signer1);
  const contractWithSigner2 = new ethers.Contract(contractAddress, contractAbi, signer2);

  const others = [await signer2.getAddress()];

  // Initiate encryption with the specified addresses
  await contractWithSigner1.InitiateEncryption(1, others, 1234, 5678, 91011);

  // Accept encryption from authorized parties
  const tx =await contractWithSigner2.AcceptEncryption(1, 2345);

  const contractWithUnkown = new ethers.Contract(contractAddress, contractAbi, unknow);

  await expect(
    contractWithUnkown.AcceptEncryption(1,1558)
  ).to.be.revertedWith("Not Authorized");

      });



 it("Who init the process trying to Finsh process,Should revert with (Faild,initializer can't finish)", async function () {


        const YourContract = await ethers.getContractFactory("multi_RNG");
        const contract = await YourContract.deploy();
        await contract.deployed();
      
        // Get the first two default accounts provided by Hardhat
        const signer1 = await ethers.provider.getSigner(0);
        const signer2 = await ethers.provider.getSigner(1);
      
        // Create a new Contract instance using the specified Signer and from address
        const contractAddress = contract.address;
        const contractAbi = YourContract.interface.fragments;
        const contractWithSigner1 = new ethers.Contract(contractAddress, contractAbi, signer1);
        const contractWithSigner2 = new ethers.Contract(contractAddress, contractAbi, signer2);
      
        // Use the same Ethereum addresses as signer1 and signer2 for the others array
        const others = [await signer2.getAddress()];
      
        // Initiate encryption with the specified addresses
        await contractWithSigner1.InitiateEncryption(1, others, 1234, 5678, 91011);
      
        // Accept encryption from authorized parties
        const tx =await contractWithSigner2.AcceptEncryption(1, 2345);
   
        const message1 = 'Final Result: 42841';
        const signature1 = await signer1.signMessage(message1);
        const { r: r1, s: s1, v: v1 } = ethers.utils.splitSignature(signature1);
        const sig1 = { message: message1, v: v1,  r: r1, s: s1,};
    
    
        const message2 = 'Final Result: 42841';
        const signature2 = await signer2.signMessage(message2);
        const { r: r2, s: s2, v: v2 } = ethers.utils.splitSignature(signature2);
        const sig2 = { message: message2,v: v2, r: r2 , s: s2 };




        const coeffs = [56789, 101121];
        const rngs = [131451, 161711];
        await expect(
          contractWithSigner1.Finish_Procces(1, coeffs, rngs, [sig1,sig2])
        ).to.be.revertedWith("Faild,initializer can't finish");
      
            });



 it("Trying to finish without AcceptEncryption ,Should revert with (Accpet encryption First)", async function () {


              const YourContract = await ethers.getContractFactory("multi_RNG");
              const contract = await YourContract.deploy();
              await contract.deployed();
            
              // Get the first two default accounts provided by Hardhat
              const signer1 = await ethers.provider.getSigner(0);
              const signer2 = await ethers.provider.getSigner(1);
            
              // Create a new Contract instance using the specified Signer and from address
              const contractAddress = contract.address;
              const contractAbi = YourContract.interface.fragments;
              const contractWithSigner1 = new ethers.Contract(contractAddress, contractAbi, signer1);
              const contractWithSigner2 = new ethers.Contract(contractAddress, contractAbi, signer2);
            
              // Use the same Ethereum addresses as signer1 and signer2 for the others array
              const others = [await signer2.getAddress()];
            
              // Initiate encryption with the specified addresses
              await contractWithSigner1.InitiateEncryption(1, others, 1234, 5678, 91011);
            
              
              //const tx =await contractWithSigner2.AcceptEncryption(1, 2345);

              const message1 = 'Final Result: 42841';
              const signature1 = await signer1.signMessage(message1);
              const { r: r1, s: s1, v: v1 } = ethers.utils.splitSignature(signature1);
              const sig1 = { message: message1, v: v1,  r: r1, s: s1,};
          
          
              const message2 = 'Final Result: 42841';
              const signature2 = await signer2.signMessage(message2);
              const { r: r2, s: s2, v: v2 } = ethers.utils.splitSignature(signature2);
              const sig2 = { message: message2,v: v2, r: r2 , s: s2 };
      
      
      
      
              const coeffs = [56789, 101121];
              const rngs = [131451, 161711];
              await expect(
                contractWithSigner2.Finish_Procces(1, coeffs, rngs, [sig1,sig2])
              ).to.be.revertedWith("Accpet encryption First");
            
                  });
      

it("Trying to finish with Not Authorized user(wrong signature) ,Should revert with (Invalid signature,Not Authorized)", async function () {


                    const YourContract = await ethers.getContractFactory("multi_RNG");
                    const contract = await YourContract.deploy();
                    await contract.deployed();
                  
                    // Get the first two default accounts provided by Hardhat
                    const signer1 = await ethers.provider.getSigner(0);
                    const signer2 = await ethers.provider.getSigner(1);
                   const signer3 = await ethers.provider.getSigner(2);
                    // Create a new Contract instance using the specified Signer and from address
                    const contractAddress = contract.address;
                    const contractAbi = YourContract.interface.fragments;
                    const contractWithSigner1 = new ethers.Contract(contractAddress, contractAbi, signer1);
                    const contractWithSigner2 = new ethers.Contract(contractAddress, contractAbi, signer2);
                    const contractWithSigner3 = new ethers.Contract(contractAddress, contractAbi, signer3);

                    // Use the same Ethereum addresses as signer1 and signer2 for the others array
                    const others = [await signer2.getAddress(),await signer3.getAddress()];
                  
                    // Initiate encryption with the specified addresses
                    await contractWithSigner1.InitiateEncryption(1, others, 1234, 5678, 91011);
                  
                     //Accept encryption from authorized parties
                    const tx =await contractWithSigner2.AcceptEncryption(1, 2345);
                    const ax =await contractWithSigner3.AcceptEncryption(1, 2334);

                    const message1 = 'Final Result: 42841';
                    const signature1 = await signer1.signMessage(message1);
                    const { r: r1, s: s1, v: v1 } = ethers.utils.splitSignature(signature1);
                    const sig1 = { message: message1, v: v1,  r: r1, s: s1,};
                
                
                    const message2 = 'Final Result: 42841';
                    const signature2 = await signer2.signMessage(message2);
                    const { r: r2, s: s2, v: v2 } = ethers.utils.splitSignature(signature2);
                    const sig2 = { message: message2,v: v2, r: r2 , s: s2 };
            
                    const message3 = 'Final Result: 42841';
                    const signature3 = await signer3.signMessage(message2);
                    const { r: r3, s: s3, v: v3 } = ethers.utils.splitSignature(signature3);
  // change v to random value to make singarture differents from provided by initiator 
                    const sig3 = { message: message3,v: 12, r: r3 , s: s3 };
            
            
                    const coeffs = [56789, 101121,57922];
                    const rngs = [131451, 161711,788521];
                    await expect(
                      contractWithSigner2.Finish_Procces(1, coeffs, rngs, [sig1,sig2,sig3])
                    ).to.be.revertedWith("Invalid signature,Not Authorized");
                  
                        });


it("Trying to finish with duplicate user (use same account twice in parties trying to dominance the process) ,Should revert with (duplicate signature)", async function () {


          const YourContract = await ethers.getContractFactory("multi_RNG");
          const contract = await YourContract.deploy();
          await contract.deployed();
                        
                          // Get the first two default accounts provided by Hardhat
                          const signer1 = await ethers.provider.getSigner(0);
                          const signer2 = await ethers.provider.getSigner(1);
                         const signer3 = await ethers.provider.getSigner(2);
                          // Create a new Contract instance using the specified Signer and from address
                          const contractAddress = contract.address;
                          const contractAbi = YourContract.interface.fragments;
                          const contractWithSigner1 = new ethers.Contract(contractAddress, contractAbi, signer1);
                          const contractWithSigner2 = new ethers.Contract(contractAddress, contractAbi, signer2);
                          const contractWithSigner3 = new ethers.Contract(contractAddress, contractAbi, signer3);
      
                          
                          const others = [await signer2.getAddress(),await signer2.getAddress(),await signer3.getAddress()];
                        
                          // Initiate encryption with the specified addresses
                          await contractWithSigner1.InitiateEncryption(1, others, 1234, 5678, 91011);
                        
                           //Accept encryption from authorized parties
                          const tx =await contractWithSigner2.AcceptEncryption(1, 2345);
                          const ax =await contractWithSigner3.AcceptEncryption(1, 2334);
      
                          const message1 = 'Final Result: 42841';
                          const signature1 = await signer1.signMessage(message1);
                          const { r: r1, s: s1, v: v1 } = ethers.utils.splitSignature(signature1);
                          const sig1 = { message: message1, v: v1,  r: r1, s: s1,};
                      
                      
                          const message2 = 'Final Result: 42841';
                          const signature2 = await signer2.signMessage(message2);
                          const { r: r2, s: s2, v: v2 } = ethers.utils.splitSignature(signature2);
                          const sig2 = { message: message2,v: v2, r: r2 , s: s2 };
                  
                          const message3 = 'Final Result: 42841';
                          const signature3 = await signer3.signMessage(message2);
                          const { r: r3, s: s3, v: v3 } = ethers.utils.splitSignature(signature3);
                          const sig3 = { message: message3,v: v3, r: r3 , s: s3 };
                  
                  
                          const coeffs = [56789, 101121,5799];
                          const rngs = [131451, 161711,89642];
  //duplicate sig2 
                          await expect(
                            contractWithSigner2.Finish_Procces(1, coeffs, rngs, [sig1,sig2,sig2,sig3])
                          ).to.be.revertedWith("duplicate signature");
                        
                              });


it("Trying to finish but 51% parties don't AcceptEncryption , Should revert with (Half of parties don't accept)", async function () {


      const YourContract = await ethers.getContractFactory("multi_RNG");
      const contract = await YourContract.deploy();
      await contract.deployed();
    
      // Get the first two default accounts provided by Hardhat
      const signer1 = await ethers.provider.getSigner(0);
      const signer2 = await ethers.provider.getSigner(1);
      const signer3 = await ethers.provider.getSigner(2);
      const signer4 = await ethers.provider.getSigner(3);
      const signer5 = await ethers.provider.getSigner(4);
      const signer6 = await ethers.provider.getSigner(5);
      const signer7 = await ethers.provider.getSigner(6);

  
      // Create a new Contract instance using the specified Signer 
      const contractAddress = contract.address;
      const contractAbi = YourContract.interface.fragments;
      const contractWithSigner1 = new ethers.Contract(contractAddress, contractAbi, signer1);
      const contractWithSigner2 = new ethers.Contract(contractAddress, contractAbi, signer2);
      const contractWithSigner3 = new ethers.Contract(contractAddress, contractAbi, signer3);
      const contractWithSigner4 = new ethers.Contract(contractAddress, contractAbi, signer4);
      const contractWithSigner5 = new ethers.Contract(contractAddress, contractAbi, signer5);
      const contractWithSigner6 = new ethers.Contract(contractAddress, contractAbi, signer6);
      const contractWithSigner7 = new ethers.Contract(contractAddress, contractAbi, signer7);

  
    
      const others = [await signer2.getAddress(),await signer3.getAddress(),
                      await signer4.getAddress(),await signer5.getAddress(),
                      await signer6.getAddress(),await signer7.getAddress()];
    
      // Initiate encryption with the specified addresses
      await contractWithSigner1.InitiateEncryption(1, others, 1234, 5678, 91011);
    
      // Accept encryption from authorized parties
      await contractWithSigner2.AcceptEncryption(1,2345);
      await contractWithSigner3.AcceptEncryption(1,7859);
  //only two parties accpected .
      // await contractWithSigner4.AcceptEncryption(1,1876);
      // await contractWithSigner5.AcceptEncryption(1,6879);
      // await contractWithSigner6.AcceptEncryption(1,5269);
      // await contractWithSigner7.AcceptEncryption(1,3161);

  
       ///////
      // Sign messages for each party :
      //////
      const message1 = 'Final Result: 38225';
      const signature1 = await signer1.signMessage(message1);
      const { r: r1, s: s1, v: v1 } = ethers.utils.splitSignature(signature1);
      const sig1 = { message: message1, v: v1,  r: r1, s: s1,};
    
    
      const message2 = 'Final Result: 38225';
      const signature2 = await signer2.signMessage(message2);
      const { r: r2, s: s2, v: v2 } = ethers.utils.splitSignature(signature2);
      const sig2 = { message: message2,v: v2, r: r2 , s: s2 };
    
      const message3 = 'Final Result: 38225';
      const signature3 = await signer3.signMessage(message3);
      const { r: r3, s: s3, v: v3 } = ethers.utils.splitSignature(signature3);
      const sig3 = { message: message3, v: v3,  r: r3, s: s3};
    
      
      const message4 = 'Final Result: 38225';
      const signature4 = await signer4.signMessage(message4);
      const { r: r4, s: s4, v: v4 } = ethers.utils.splitSignature(signature4);
      const sig4 = { message: message4, v: v4,  r: r4, s: s4};
  
  
      const message5 = 'Final Result: 38225';
      const signature5 = await signer5.signMessage(message5);
      const { r: r5, s: s5, v: v5 } = ethers.utils.splitSignature(signature5);
      const sig5 = { message: message5, v: v5,  r: r5, s: s5};

      const message6 = 'Final Result: 38225';
      const signature6 = await signer6.signMessage(message6);
      const { r: r6, s: s6, v: v6 } = ethers.utils.splitSignature(signature6);
      const sig6 = { message: message6, v: v6,  r: r6, s: s6};

      const message7 = 'Final Result: 38225';
      const signature7 = await signer7.signMessage(message7);
      const { r: r7, s: s7, v: v7 } = ethers.utils.splitSignature(signature7);
      const sig7 = { message: message7, v: v7,  r: r7, s: s7}
    
      // Finish the process with coefficients and random numbers
      const coeffs = [56789, 101121,148551,137987,769813,103801,547411];
      const rngs = [127271, 389473, 613189, 829211, 997757,691721,479909];
    ;
    
      const expectedRes = ((127271 + 389473+ 613189 + 829211 + 997757 +479909 + 691721) % 0xE96C6372AB55884E99242C8341393C43953A3C8C6F6D57B3B863C882DEFFC3B7 % (91011 - 5678)) + 5678;
  
    
      await expect(
        contractWithSigner2.Finish_Procces(1, coeffs, rngs, [sig1,sig2,sig3,sig4,sig5,sig6,sig7])
      ).to.be.revertedWith("Half of parties don't accept");
    
      
      });


it("Trying to finish with wrong rngs (Cheating) ,Should revert with (Cheating,invalid number)", async function () {


                          const YourContract = await ethers.getContractFactory("multi_RNG");
                          const contract = await YourContract.deploy();
                          await contract.deployed();
                        
                          // Get the first two default accounts provided by Hardhat
                          const signer1 = await ethers.provider.getSigner(0);
                          const signer2 = await ethers.provider.getSigner(1);
                         const signer3 = await ethers.provider.getSigner(2);
                          // Create a new Contract instance using the specified Signer and from address
                          const contractAddress = contract.address;
                          const contractAbi = YourContract.interface.fragments;
                          const contractWithSigner1 = new ethers.Contract(contractAddress, contractAbi, signer1);
                          const contractWithSigner2 = new ethers.Contract(contractAddress, contractAbi, signer2);
                          const contractWithSigner3 = new ethers.Contract(contractAddress, contractAbi, signer3);
      
                          // Use the same Ethereum addresses as signer1 and signer2 for the others array
                          const others = [await signer2.getAddress(),await signer3.getAddress()];
                        
                          // Initiate encryption with the specified addresses
                          await contractWithSigner1.InitiateEncryption(1, others, 1234, 5678, 91011);
                        
                           //Accept encryption from authorized parties
                          const tx =await contractWithSigner2.AcceptEncryption(1, 2345);
                          const ax =await contractWithSigner3.AcceptEncryption(1, 2334);
      
                          const message1 = 'Final Result: 42841';
                          const signature1 = await signer1.signMessage(message1);
                          const { r: r1, s: s1, v: v1 } = ethers.utils.splitSignature(signature1);
                          const sig1 = { message: message1, v: v1,  r: r1, s: s1,};
                      
                      
                          const message2 = 'Final Result: 42841';
                          const signature2 = await signer2.signMessage(message2);
                          const { r: r2, s: s2, v: v2 } = ethers.utils.splitSignature(signature2);
                          const sig2 = { message: message2,v: v2, r: r2 , s: s2 };
                  
                          const message3 = 'Final Result: 42841';
                          const signature3 = await signer3.signMessage(message2);
                          const { r: r3, s: s3, v: v3 } = ethers.utils.splitSignature(signature3);
                          const sig3 = { message: message3,v: v3, r: r3 , s: s3 };
                  
                  
                          const coeffs = [56789, 101121,88623];
                          const rngs = [131451, 161711,598756];
                          await expect(
                            contractWithSigner2.Finish_Procces(1, coeffs, rngs, [sig1,sig2,sig3])
                          ).to.be.revertedWith("Cheating,invalid number");
                        
                              });

    });



