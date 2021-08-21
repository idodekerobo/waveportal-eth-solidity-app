import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import WavePortalJson from './utils/WavePortal.json'
import './App.css';

export default function App() {
  const [ currentAccount, setCurrentAccount ] = useState('');
  const [ totalWaves, setTotalWaves ] = useState(0);
  const [ allWaves, setAllWaves ] = useState([]);
  const [ value, setValue ] = useState('');

  // const contractAddress = '0xaC42C18FeC2Eb7E6a0988E2dCeeDC0C9559Fa7CE'
  // const contractAddress = '0x7Aa6Dc017F37c25b63F9d7480A09be921905637B'
  const contractAddress = '0x77F409170c6dFa46aB75df7c53EEB4Cd6A19089c'
  const contractABI = WavePortalJson.abi;

  async function getAllWaves() {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner();
    const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

    let waves = await wavePortalContract.getAllWaves();
    console.log('dirty waves')
    console.log(waves)
    console.log()
    setTotalWaves(waves.length);

    let wavesCleaned = [];
    waves.forEach(wave => {
      wavesCleaned.push({
        address: wave.address, 
        timestamp: new Date(wave.timestamp * 1000),
        message: wave.message
      })
    })
    setAllWaves(wavesCleaned);
    console.log('clean waves')
    console.log(wavesCleaned);
    console.log();
  }

  const checkIfWalletIsConnected = () => {
    const { ethereum } = window;
    if (!ethereum) {
      console.log('ethereum object not detected, make sure metamask is connected')
      return;
    } else {
      console.log('here\'s the ethereum object', ethereum)
    }

    // check if we're authorized to use the users account
    ethereum.request({ method: 'eth_accounts' })
    .then(accounts => {
      // we can have multiple accts, chec for one
      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log('found an authorized account', account)
        setCurrentAccount(account);
      }
    })
    .catch(err => {
      console.log('There was an error')
      console.error(err);
    })
  }

  const connectWallet = () => {
    const { ethereum } = window;
    if (!ethereum) {
      alert("Get metamask!");
    }
    ethereum.request({ method: 'eth_requestAccounts' })
    .then(accounts => {
      console.log('connected account', accounts[0])
      setCurrentAccount(accounts[0])
    })
    .catch(err => {
      console.error(err);
    })
  }

  const wave = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

    let count = await wavePortalContract.getTotalWaves();
    console.log('Total wave count: ', count.toNumber());

    console.log('value sending along w/ the wave', value);
    const waveTxn = await wavePortalContract.wave(value);
    console.log('Mining...', waveTxn.hash);
    await waveTxn.wait();
    console.log('Mined -- ', waveTxn.hash);

    count = await wavePortalContract.getTotalWaves();
    console.log('Retreived total wave count: ', count.toNumber())
    setTotalWaves(count.toNumber());

    setValue('');
  }

  useEffect(() => {
    checkIfWalletIsConnected();
    // if (currentAccount !== '') {
      getAllWaves();
    // }
  }, [ ])
  
  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        👋 Hey there!
        </div>

        <div className="bio">
        Yerrrrrrr it's Idode! Come thru and say wassup!
        </div>

        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>

        {(currentAccount ? null : (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>)
        )}
      <textarea value={value} onChange={(event) => setValue(event.target.value)} />

      <div>
        Total Waves: {totalWaves}
      </div>

      {allWaves.map((wave, i) => {
        return (
          <div key={i} style={{backgroundColor: 'OldLace', marginTop: '16px', padding: '8px'}}>
            <div>Address: {wave.address}</div>
            <div>Time: {wave.timestamp.toString()}</div>
            <div>Message:{wave.message}</div>
          </div>
        )
      })

      }
      </div>
    </div>
  );
}
