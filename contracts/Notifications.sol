// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import {INotification} from "../contracts/INotification.sol";

contract Notification is INotification {
    /**
    * @dev Send a notification to an address from the address executing the function
    * @param to address to send a notification to
    * @param subject subject of the message to send
    * @param body body of the message to send
    */
    function walletDM(address to, string memory subject, string memory body) external payable virtual override {
        emit DirectMsg(msg.sender, to, subject, body);
    }

    /**
    * @dev Send a notification to an address from the smart contract
    * @param to address to send a notification to
    * @param subject subject of the message to send
    * @param body body of the message to send
    */
    function contractDM(address to, string memory subject, string memory body) external virtual override {
        emit DirectMsg(address(this), to, subject, body);
    }
  
    /**
    * @dev Send a general notification from the address executing the function
    * @param subject subject of the message to broadcast
    * @param body body of the message to broadcast
    */
    function walletBroadcast(string memory subject, string memory body) external payable virtual override {
        emit BroadcastMsg(msg.sender, subject, body);
    }

    /**
    * @dev Send a general notification from the address executing the function
    * @param subject subject of the message to broadcast
    * @param body body of the message to broadcast
    */
    function contractBroadcast(string memory subject, string memory body) external virtual override {
        emit BroadcastMsg(address(this), subject, body);
    }
}