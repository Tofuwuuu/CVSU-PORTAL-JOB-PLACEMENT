// blockchain.js (Node.js sample code)
const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

async function verifyAlumni(alumniId) {
  const ccpPath = path.resolve(__dirname, '..', 'connection-org1.json');
  const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

  // Create wallet and gateway instance...
  const walletPath = path.join(process.cwd(), 'wallet');
  const wallet = await Wallets.newFileSystemWallet(walletPath);
  const gateway = new Gateway();
  await gateway.connect(ccp, { wallet, identity: 'admin', discovery: { enabled: true, asLocalhost: true } });
  const network = await gateway.getNetwork('mychannel');
  const contract = network.getContract('alumniCC');

  // Submit transaction to verify alumni:
  await contract.submitTransaction('VerifyAlumni', alumniId);
  await gateway.disconnect();
  return { result: 'success', alumni_id: alumniId, message: 'Alumni verified on blockchain' };
}

module.exports = { verifyAlumni };
