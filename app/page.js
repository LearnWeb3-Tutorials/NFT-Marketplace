"use client"
import { useEffect, useState } from "react";
import Header from "./components/Header";
import { ethers } from "ethers";
import contractabi from "./abi/abi.json"
const axios = require('axios')
const FormData = require('form-data')



export default function Home() {
  const [address, setAddress] = useState(null);
  const [balance, setBalance] = useState(0);
  const [contract, setContract] = useState(null);
  const [name, setName] = useState("");
  const [description,setDescription] = useState("");
  const [image, setImage] = useState(null);  
  useEffect(()=>{
    async function initialize(){
      if(typeof window.ethereum !== "undefined"){
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        const balance = await provider.getBalance(address);
        setAddress(address);
        // setBalance(ethers.utils.parseEther(balance));
        const mycontractaddress="0xDF2Bba0535EAb94Fa772398555554d143505ee22";
        const contract = new ethers.Contract(mycontractaddress,contractabi,signer)
        setContract(contract)
      }
    }
    initialize();
  },[])

  function onChangeFile(e){
    const file = e.target.files[0];
    setImage(file);
    console.log(file)
  }

 async function onSubmit(event){
    if(!name && !description && !image){
      alert("Fill the required details")
      return;
    } 
    const JWT="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI3OTkwYWEwZS0wN2JkLTQ4YWYtOWI5OC1iN2M0N2I0NDMzOWUiLCJlbWFpbCI6InRoaXJ1bXVydWdhbjgyMDAzQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImlkIjoiRlJBMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfSx7ImlkIjoiTllDMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI2YTFlNDE4NThkMWFlMjgzMWQ0YyIsInNjb3BlZEtleVNlY3JldCI6IjVmYzZiN2ZlYTBkZmQ2NmYwMTUwN2EyOTkyODgwODVlNmQwMzAyN2Y1YTU4NjIxZjQwNTRkNTA5MDJjM2M1MTkiLCJpYXQiOjE2OTQyNDQzMTh9.7DM5yqXAgainRLbwJ6eFTwxoLNP1pDSZ6q85qZAIW-g";
    event.preventDefault();

    const formData = new FormData();
    formData.append('file', image);

    const pinataMetadata = JSON.stringify({
      name: 'File name',
    });
    formData.append('pinataMetadata', pinataMetadata);

    const pinataOptions = JSON.stringify({
      cidVersion: 0,
    });
    formData.append('pinataOptions', pinataOptions);

    try{
      const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
        maxBodyLength: "Infinity",
        headers: {
          'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
          Authorization: "Bearer " + JWT,
        }
      });
      const ipfshash = res.data.IpfsHash;
      try {
        const jsondic = {
          name,
          description,
          "image": `ipfs/${ipfshash}`,
        };
        const resjson = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", jsondic, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: "Bearer " + JWT, 
          }
        });
        const jsonHash = resjson.data.IpfsHash;
        const tokenURI = `https://ipfs.io/ipfs/${jsonHash}`;
        const conc = contract?.mintNFT(address, tokenURI )
        console.log("mytokenID",conc)
      } catch (error) {
        console.error(error);
      }
    } catch (error) {
      console.error(error);
    }


  }
  return (
    <>
    <div>
   <Header/>
   <div className="text-center">
   <p className="text-md text-blue-400 lg:text-3xl">Hi, {address?.slice(0,10)}...{address?.slice(-10)} </p>
   <div className="flex bg-yellow-400 px-10 mt-5 flex-col space-y-4 py-10 rounded-xl md:mx-[200px] lg:mx-[800px]">
   <p>NFT MarketPlace</p>
   <input type="text" placeholder="Enter your name" value={name} onChange={(e)=>{setName(e.target.value)}} className="border border-black px-2 " />
   <input type="text" placeholder="Enter your description" value={description} onChange={(e)=>{setDescription(e.target.value)}} className="border border-black px-2 " />
   <div>
   <label>Upload Image</label>
   <input type="file" className="mt-2" accept="image/*"  onChange={onChangeFile} />
   <button className="bg-blue-400 px-4 py-2 rounded-lg mt-4" onClick={onSubmit} >Submit</button>
   </div>
   </div>
  </div>
    </div>
    </>
  )
}
