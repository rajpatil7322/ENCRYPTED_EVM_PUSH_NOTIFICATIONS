// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract Hack {

    event DirectMsg (address indexed from, address indexed to, string subject, string body);

   function attack(address impersonate,address to,string memory subject,string memory body) public {
    emit DirectMsg(impersonate,to,subject,body);
   }    
}