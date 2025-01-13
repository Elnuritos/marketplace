// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Marketplace {
    struct Item {
        uint id;
        string name;
        uint price;
        address seller;
        bool sold;
    }

    uint public itemCount = 0;
    mapping(uint => Item) public items; 
    mapping(address => uint) public sellerBalances;

    event ItemAdded(uint id, string name, uint price, address seller);
    event ItemPurchased(uint id, address buyer, uint price);

    
    modifier onlySeller() {
        require(msg.sender != address(0), "Invalid sender address");
        _;
    }

    // Добавление товара
    function addItem(string memory name, uint price) public onlySeller {
        require(price > 0, "Price must be greater than zero"); 
        itemCount++;
        items[itemCount] = Item(itemCount, name, price, msg.sender, false);

        emit ItemAdded(itemCount, name, price, msg.sender);
    }

    // Покупка товара
  function purchaseItem(uint id) public payable {
    Item storage item = items[id];
    require(item.id > 0 && item.id <= itemCount, "Item does not exist");
    require(msg.value == item.price, "Incorrect price");
    require(!item.sold, "Item already sold");
   
    item.sold = true;
    sellerBalances[item.seller] += msg.value;

    emit ItemPurchased(id, msg.sender, msg.value);
}


   
    function withdrawBalance() public {
        uint balance = sellerBalances[msg.sender];
        require(balance > 0, "No funds to withdraw");

        sellerBalances[msg.sender] = 0; 
        payable(msg.sender).transfer(balance); 
    }

  
    function getItems() public view returns (Item[] memory) {
        Item[] memory result = new Item[](itemCount);
        for (uint i = 1; i <= itemCount; i++) {
            result[i - 1] = items[i];
        }
        return result;
    }
}
