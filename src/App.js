import Torus from "@toruslabs/torus-embed";
import "./App.css";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import VegasONE from "./abi/VegasONE.json";
import { isEmpty } from "lodash";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3Modal from "web3modal";
// import Web3 from "web3";

const USDT = "0xd691aCE60338a304cb0e5e7F82d77e81f02A248f";
const myAddr = "0x99e54058245b08bd7b40481F971F0EaC255ffDf7";

// const addNetwork = async (params) => {
//   try {
//     await window.ethereum.request({
//       method: "wallet_addEthereumChain",
//       params,
//     });
//   } catch (e) {
//     console.log("addNetwork err", e);
//   }
// };

function App() {
  const [web3Modal, setWeb3Modal] = useState();
  const [provider, setProvider] = useState();
  const [signer, setSigner] = useState();
  const [address, setAddress] = useState("");
  const [chainId, setChainId] = useState();
  const [balance, setBalance] = useState();
  const [to, setTo] = useState("");

  useEffect(() => {
    !isEmpty(signer) && getBalance();
  }, [signer]);

  const login = async () => {
    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider, // required
        options: {
          rpc: { 1172: "https://testnet-rpc.vegas.one" }, // required
          chainId: [1172],
          // infuraId: "1505b863360c4bfa846e6e9a170aa9fe",
        },
        qrcodeModalOptions: {
          mobileLinks: ["metamask"],
        },
      },
      torus: {
        package: Torus,
        options: {
          networkParams: {
            host: "https://testnet-rpc.vegas.one",
            chainId: 1172,
            // networkName: "VegasOneChain testnet",
            // host: "goerli",
            // chainId: 5,
            // infuraId: "1505b863360c4bfa846e6e9a170aa9fe",
          },
          // network: "goerli",
          // host: "https://testnet-rpc.vegas.one",
        },
      },
    };

    try {
      let initWeb3Modal = new Web3Modal({
        // disableInjectedProvider: false,
        cacheProvider: false,
        providerOptions, // required
      });
      // console.log(initWeb3Modal);

      const provider = await initWeb3Modal.connect();
      console.log(provider);
      // console.log(provider);

      // if (provider.chainId !== 1172)
      //   await addNetwork([
      //     {
      //       chainId: "0x494",
      //       chainName: "Testnet",
      //       nativeCurrency: {
      //         name: "VOC",
      //         symbol: "VOC",
      //         decimals: 18,
      //       },
      //       rpcUrls: ["https://testnet-rpc.vegas.one"],
      //       // blockExplorerUrls: [""]
      //     },
      //   ]);

      console.log(typeof provider.wc);
      // only test wc with metamask or metamask extension
      if (provider.chainId !== 1172) {
        if (
          provider.isMetaMask ||
          (typeof provider.wc !== "undefined" &&
            provider.wc.peerMeta.name === "MetaMask")
        ) {
          await provider.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: ethers.utils.hexValue(1172) }],
          });
        }

        // change chain when Torus wallet is not on 1172
        if (provider.torus) {
          await provider.torus.setProvider({
            // host: "goerli",
            // chainId: "5",
            // networkName: "goerli",
            host: "https://testnet-rpc.vegas.one",
            chainId: "1172",
            networkName: "testnet",
          });
        }
      }

      // console.log(provider);
      /*
    const web3 = new Web3(provider);
    console.log(web3);
    // torus account
    const accounts = await web3.eth.getAccounts();
    const signer = await web3.eth.accounts;
    console.log(signer);
    const chainId = await web3.eth.getChainId();
    console.log("chainId", chainId);
    setProvider(web3);
    setSigner(signer);
    if (chainId !== 1172)
      addNetwork([
        {
          chainId: "0x494",
          chainName: "VegasONE Chain",
          nativeCurrency: {
            name: "VOC",
            symbol: "VOC",
            decimals: 18,
          },
          rpcUrls: ["https://testnet-rpc.vegas.one"],
          // blockExplorerUrls: [""]
        },
      ]);
    */
      const web3Provider = new ethers.providers.Web3Provider(provider, "any");
      const signer = web3Provider.getSigner();
      const address = await signer.getAddress();
      const network = await web3Provider.getNetwork();
      console.log("currently address : ", address);
      console.log("currently network : ", network);
      // const contract = new ethers.Contract(USDT, VegasONE["abi"], signer);
      // const decimals = await contract.decimals();
      // setBalance(
      //   ethers.utils.formatUnits(
      //     await contract.balanceOf(await signer.getAddress()),
      //     decimals
      //   )
      // );
      setAddress(address);
      setChainId(network.chainId);
      setWeb3Modal(provider);
      setProvider(web3Provider);
      setSigner(signer);
      // await getBalance();
      // if (network.chainId !== 1172)
      //   addNetwork([
      //     {
      //       chainId: "0x494",
      //       chainName: "VegasONE Chain",
      //       nativeCurrency: {
      //         name: "VOC",
      //         symbol: "VOC",
      //         decimals: 18,
      //       },
      //       rpcUrls: ["https://testnet-rpc.vegas.one"],
      //       // blockExplorerUrls: [""]
      //     },
      //   ]);
    } catch (e) {
      console.log("catch err", e);
    }
  };

  const getBalance = async () => {
    console.log("getBalance start");
    const contract = new ethers.Contract(USDT, VegasONE["abi"], signer);
    const decimals = await contract.decimals();
    console.log("getBalance address", address);
    console.log("getBalance decimals", decimals);
    const res = await contract.balanceOf(address);
    setBalance(ethers.utils.formatUnits(res, decimals));
  };

  // const test = () => {
  //   let opts = {
  //     networkParams: {
  //       // host: "https://testnet-rpc.vegas.one",
  //       // chainId: 1172,
  //       // networkName: "VegasOneChain testnet",
  //       host: "goerli",
  //       chainId: 5,
  //       // infuraId: "1505b863360c4bfa846e6e9a170aa9fe",
  //     },
  //     // network: "goerli",
  //     // host: "https://testnet-rpc.vegas.one",
  //   };
  //   let network =
  //     opts.networkParams || opts.network
  //       ? { host: opts.network, ...opts.networkParams }
  //       : network;
  //   console.log(network);
  // };

  const transfer = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }

    const contract = new ethers.Contract(USDT, VegasONE["abi"], signer);
    const decimals = await contract.decimals();
    console.log(
      "balance before: ",
      ethers.utils.formatUnits(
        await contract.balanceOf(await signer.getAddress()),
        decimals
      )
    );

    let tx = await contract.transfer(
      to,
      ethers.utils.parseUnits("1", decimals)
    );
    await tx.wait();

    console.log(
      "balance after: ",
      ethers.utils.formatUnits(
        await contract.balanceOf(await signer.getAddress()),
        decimals
      )
    );
  };

  // const logout = async () => {
  //   if (!provider) return;
  //   if (signer.wallet) await signer.wallet.clear();
  //   console.log(provider);
  //   console.log(signer);
  //   setProvider(null);
  //   setSigner(null);
  // };

  const logout = async () => {
    if (!provider) return;
    // await web3Modal.clearCachedProvider();
    if (web3Modal.wc) {
      web3Modal.wc.killSession();
    } else if (web3Modal.torus) {
      await web3Modal.torus.logout();
    } else if (provider.disconnect) {
      await provider.disconnect();
    }
    setWeb3Modal(null);
    setProvider(null);
    setSigner(null);
    setAddress("");
    setChainId();
    setBalance();
    console.log(
      "logout!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
    );
  };

  return (
    <div className="App">
      {isEmpty(signer) && <button onClick={login}>login</button>}
      {!isEmpty(signer) && <button onClick={logout}>logout</button>}
      <button onClick={getBalance}>getBalance</button>
      <p>address: {address}</p>
      <p>chainId: {chainId}</p>
      <p>balance: {balance}</p>
      <div className="transfer">
        <div className="input-group">
          <p>固定轉出：USDT * 1</p>
          <div className="transfer-to">
            <p>to address: </p>
            <input type="text" onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>
        <button onClick={transfer}>transfer</button>
      </div>
    </div>
  );
}

export default App;
