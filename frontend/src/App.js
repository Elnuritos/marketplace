import React, { useState, useEffect } from "react";
import Web3 from "web3";
import MarketplaceABI from "./MarketplaceABI.json";

const CONTRACT_ADDRESS = "0x8975ee9D516E431D512F250367BFa94Aa00293b7";

function App() {
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("");
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [items, setItems] = useState([]);
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [sellerMode, setSellerMode] = useState(false);

  
  useEffect(() => {
    if (window.ethereum) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);

      const contractInstance = new web3Instance.eth.Contract(
        MarketplaceABI.abi,
        CONTRACT_ADDRESS
      );
      setContract(contractInstance);
    } else {
      alert("Please install MetaMask!");
    }
  }, []);

  
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);
        const userBalance = await web3.eth.getBalance(accounts[0]);
        setBalance(Web3.utils.fromWei(userBalance, "ether"));
      } catch (error) {
        console.error("Failed to connect wallet:", error);
        alert("Failed to connect wallet. Please try again.");
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  // Загрузка товаров
  const loadItems = async () => {
    if (contract) {
      try {
        const itemCount = await contract.methods.itemCount().call();
        const loadedItems = [];
        for (let i = 1; i <= itemCount; i++) {
          const item = await contract.methods.items(i).call();
          loadedItems.push(item);
        }
        setItems(loadedItems);
      } catch (error) {
        console.error("Failed to load items:", error);
      }
    }
  };

  // Добавление товара
  const addItem = async (e) => {
    e.preventDefault();
    if (!sellerMode) {
      alert("You must be in seller mode to add items.");
      return;
    }

    try {
      const weiPrice = Web3.utils.toWei(itemPrice.toString(), "ether");
      await contract.methods.addItem(itemName, weiPrice).send({ from: account });
      alert("Item added successfully!");
      loadItems();
    } catch (error) {
      console.error("Failed to add item:", error);
      alert("Failed to add item. Please try again.");
    }
  };

  
  const purchaseItem = async (id, price) => {
    try {
      await contract.methods.purchaseItem(id).send({
        from: account,
        value: price,
      });
      alert("Item purchased successfully!");
      loadItems();
    } catch (error) {
      console.error("Purchase failed:", error);
      alert("Failed to purchase item. Check your balance and try again.");
    }
  };

  
  const withdrawBalance = async () => {
    try {
      await contract.methods.withdrawBalance().send({ from: account });
      alert("Balance withdrawn successfully!");
    } catch (error) {
      console.error("Withdraw failed:", error);
      alert("Failed to withdraw balance. Please try again.");
    }
  };

  
  const toggleSellerMode = () => {
    setSellerMode(!sellerMode);
  };

  useEffect(() => {
    if (contract) {
      loadItems();
    }
  }, [contract]);

  return (
    <div className="container mt-5">
      <h1 className="text-center">Marketplace</h1>
      <div className="d-flex justify-content-between mb-4">
        <button className="btn btn-primary" onClick={connectWallet}>
          {account
            ? `Connected: ${account.substring(0, 6)}...${account.slice(-4)}`
            : "Connect Wallet"}
        </button>
        <div className="ms-3">
          <strong>Balance: {balance ? `${balance} ETH` : "N/A"}</strong>
        </div>
        <button
          className={`btn ${sellerMode ? "btn-success" : "btn-secondary"}`}
          onClick={toggleSellerMode}
        >
          {sellerMode ? "Switch to Buyer Mode" : "Switch to Seller Mode"}
        </button>
        {sellerMode && (
          <button className="btn btn-warning" onClick={withdrawBalance}>
            Withdraw Balance
          </button>
        )}
      </div>

      {sellerMode ? (
        <div>
          <h2>Add Item</h2>
          <form onSubmit={addItem}>
            <div className="mb-3">
              <input
                type="text"
                placeholder="Item Name"
                className="form-control"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <input
                type="number"
                placeholder="Price in ETH"
                className="form-control"
                value={itemPrice}
                onChange={(e) => setItemPrice(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-success">
              Add Item
            </button>
          </form>
        </div>
      ) : (
        <div>
          <h2>Items for Sale</h2>
          <ul className="list-group">
            {items.map((item) => (
              <li
                key={item.id}
                className={`list-group-item d-flex justify-content-between align-items-center ${
                  item.sold ? "list-group-item-danger" : ""
                }`}
              >
                <div>
                  <strong>{item.name}</strong> -{" "}
                  {Web3.utils.fromWei(item.price, "ether")} ETH
                </div>
                {!item.sold && (
                  <button
                    className="btn btn-primary"
                    onClick={() => purchaseItem(item.id, item.price)}
                  >
                    Buy
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
