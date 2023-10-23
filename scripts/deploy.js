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


async function main() {
  const provider=new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/");

  const factory=new ethers.ContractFactory(NotificationData.abi,NotificationData.bytecode,provider.getSigner(0));
  const signer=provider.getSigner();

  const notification=await factory.deploy();
  console.log(notification.address);

  const tx=await notification.connect(provider.getSigner(0)).contractDM(await signer.getAddress(),"Liquidation","You are about to Liquidate");
  await tx.wait();
  console.log("Transaction is sucessfull")


filter = {
    address: notification.address,
    topics: [
        ethers.utils.id("DirectMsg(address,address,string,string)"),
        ethers.utils.hexZeroPad(notification.address, 32),
        ethers.utils.hexZeroPad(await signer.getAddress(), 32)  // Subscribing to the specific address to get the brodcast messages.
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


  provider.on(filter, async (value) => {
    const intrfc = new ethers.utils.Interface(NotificationData.abi);
    const body=intrfc.parseLog(value).args.body

    if(value.address==intrfc.parseLog(value).args.from){
      console.log("Authentic message");
      sendMessage(intrfc.parseLog(value).args.from,body);
    }
  
    })

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
