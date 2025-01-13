async function main() {
    const Marketplace = await ethers.getContractFactory("Marketplace"); // Получаем контракт
    const marketplace = await Marketplace.deploy(); // Деплоим контракт
  
    await marketplace.deployed(); // Ожидаем завершения деплоя
  
    console.log("Marketplace deployed to:", marketplace.address); // Печатаем адрес контракта
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
  