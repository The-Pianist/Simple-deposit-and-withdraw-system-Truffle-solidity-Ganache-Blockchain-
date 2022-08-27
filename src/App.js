import { useCallback, useEffect, useState } from "react";
import "./App.css";
import Web3 from "web3";
import detectEthereumProvider from "@metamask/detect-provider"
import { loadContract } from "./utils/load-contract";

function App() {
  const [web3Api, setWeb3Api] = useState({
    provider : null,
    isProviderloaded : false,
    web3 : null,
    contract : null
  })

  const [account, setAccount] = useState(null)
  const [balance, setBalance] = useState(null)
  const [shouldReload, reload] = useState(false);
  const canConnectToContract = account && web3Api.contract

  const reloadEffect = useCallback(() => reload(!shouldReload),[shouldReload])

  const setAccountListener = (provider) =>{
    provider.on("accountsChanged", _=> window.location.reload())
    provider.on("chainChanged", _=> window.location.reload())

    // provider._jsonRpcConnection.event.on("notification", (payload)=>{
    //   const {method }= payload

    //   if(method === "metamask_unlockStateChanged"){
    //     setAccount(null)
    //   }
    // })
  }

  useEffect(()=>{
    const loadProvider = async()=>{
      const provider = await detectEthereumProvider()
        if (provider && provider.isMetaMask) {
          setAccountListener(provider)
          const contract = await loadContract("Faucet", provider).then(PromiseResult =>{
            return PromiseResult});
          setWeb3Api({
            web3: new Web3(provider),
            provider :  provider,
            contract : contract,
            isProviderloaded : true
          })
          console.log("Successfully connected");
        } else {
          setWeb3Api(api => ({...api, isProviderloaded : true}))
          console.log('Please install MetaMask!');
        }
    }


    loadProvider();
  }, [])

  useEffect(() => {
    const loadBalance = async () => {
      const { contract, web3 } = web3Api
      const balance = await web3.eth.getBalance(contract.address);
      // 0x91AFd85011912339EE3b7ac743f8F46E74Be0b22
      setBalance(web3.utils.fromWei(balance, "ether"))
    }

    web3Api.contract && loadBalance()
  }, [web3Api, shouldReload ])

  useEffect(()=>{
    const getAccount = async () => {
      const accounts = await web3Api.web3.eth.getAccounts()
      setAccount(accounts[0])
    }
    web3Api.web3 && getAccount()
  }, [web3Api.web3]); 

  const addFunds = useCallback(async() =>{
      const { contract, web3 } = web3Api;
      console.log("This is the web3 in the addFunds function", web3);
      await contract.addFunds({
      from : account,
      value: web3.utils.toWei("1", "ether")
    })
    reloadEffect()
  },[web3Api, account, reloadEffect])

  const withdrawFunds= async() =>{
    const {contract, web3} = web3Api
    const amount = web3.utils.toWei("0.1", "ether")
    await contract.withdraw(amount,{
      from : account,
    })
    reloadEffect()
  }



  return (
    <>
    <div className="faucet-wrapper">
        <div className="faucet">

        { web3Api.isProviderloaded ?
            <div className="is-flex is-align-items-center">
              <span>
                <strong className="mr-2">Account: </strong>
              </span>
                { account ?
                  <div>{account}</div> :
                  !web3Api.provider ?
                  <>
                    <div className="notification is-warning is-size-6 is-rounded">
                      Wallet is not detected!{` `}
                      <a target="_blank" href="https://docs.metamask.io" rel="noreferrer">
                        Install Metamask
                      </a>
                    </div>
                  </> :
                  <button
                    className="button is-small"
                    onClick={() =>
                      web3Api.provider.request({method: "eth_requestAccounts"}
                    )}
                  >
                    Connect Wallet
                  </button>
                }
            </div> :
            <span>Looking for Web3...</span>
          }
          <div className="balance-view is-size-2 my-4">
            Current Balance: <strong>{balance}</strong> ETH
          </div>
          { !canConnectToContract && <i className="is-block">connect to Ganache</i>}
          <button
            disabled={!canConnectToContract}
            onClick={addFunds}
            className="button is-link mr-2">
              Donate 1eth
            </button>
          <button
            disabled={!canConnectToContract}
            onClick={withdrawFunds}
            className="button is-primary">Withdraw 0.1 eth</button>
        </div>
      </div>
    </>
);
}

export default App;
