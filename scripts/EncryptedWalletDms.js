// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const ethers=require("ethers");
const NotificationData=require("../artifacts/contracts/Notifications.sol/Notification.json");
require('dotenv').config();
const EthCrypto = require('eth-crypto');

async function Encrypt(message_to_encrypt,signed_message,sig){
    const pk = EthCrypto.recoverPublicKey(
      sig, // signature
      EthCrypto.hash.keccak256(
        "\x19Ethereum Signed Message:\n" + signed_message.length + signed_message
      ) // message hash
  );
  
    const encrypted = await EthCrypto.encryptWithPublicKey(
      pk, // publicKey
      message_to_encrypt // message
    );
  
    const str = EthCrypto.cipher.stringify(encrypted);
    return str;
  }
  
  async function Decrypt(data,private_key){
    const encrypt_object = EthCrypto.cipher.parse(data);
    const message = await EthCrypto.decryptWithPrivateKey(
      private_key, // privateKey
      encrypt_object
      );
  
      return message
  }
  


async function main() {
  const provider=new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/");

  const factory=new ethers.ContractFactory(NotificationData.abi,NotificationData.bytecode,provider.getSigner(0));
  const signer=provider.getSigner();

  const notification=await factory.deploy();
  console.log("Notification address:",notification.address);

  const sig=await signer.signMessage("Sign message")
  const str=await Encrypt("You are about to liquidate","Sign message",sig);


  const tx=await notification.connect(provider.getSigner(0)).walletDM(await signer.getAddress(),"Liquidation",str);
  await tx.wait();
  console.log("Transaction is sucessfull")


filter={
    topic:[
        ethers.utils.id("DirectMsg(address,address,string,string)")
    ]
}

function sendMessage(from,message) {
  fetch(process.env.DISCORD_URL, {
    body: JSON.stringify({
      content: `Message from ${from}   ${message}`,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  })
    .then(function (res) {
      console.log(res);
    })
    .catch(function (res) {
      console.log(res);
    });

}




provider.on(filter,async (value)=>{
    const transaction=await provider.getTransaction(value.transactionHash);
    const intrfc = new ethers.utils.Interface(NotificationData.abi);
    if(transaction.from==intrfc.parseLog(value).args.from){
        console.log("Authentic transaction");
        const body=intrfc.parseLog(value).args.body;
        console.log(body);
        const private_key="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

        const message =await Decrypt(body,private_key);
    
        sendMessage(intrfc.parseLog(value).args.from,message);
    }
    else{
        console.log("Not authentic");
    }

})

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
