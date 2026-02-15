import React, { useRef } from "react";
import {useEffect, useState} from "react";
import {Actor, HttpAgent} from "@dfinity/agent";
import { idlFactory } from "../../../declarations/nft/index";
import { opend } from "../../../declarations/opend";
import Button from "./Button";

function Item(props) {

  const [name, setName] = useState("");
  const [owner, setOwner] = useState("");
  const [image, setImage] = useState("");
  const [button, setButton] = useState();
  const [price, setPrice]=useState();
  const [priceInput, setPriceInput]=useState();
  const [loaderHidden, setLoaderHidden] = useState(true);
  const [blur, setBlur] = useState();
  const [sellStatus, setSellStatus] = useState("");

  const principal = props.id? props.id : null;
  let NFTActor;
  const priceRef = useRef("");

  async function loadNFT(){

    try {
      const agent = new HttpAgent({host : "http://localhost:8000"});
      await agent.fetchRootKey();
      NFTActor = Actor.createActor(idlFactory,{
        agent,
        canisterId: principal
      });

     
      const name = await NFTActor.getName();
      setName(name)

      const ownerPrincipal = await NFTActor.getOwner();
      const owner = ownerPrincipal.toText();
      setOwner(owner);


      const imageData = await NFTActor.getAsset();
      const imageContent = new Uint8Array(imageData);
      const image = URL.createObjectURL(new Blob([imageContent.buffer], {type: "image/png"}));
      setImage(image);

      const nftIsListed =  await opend.isListed(props.id);

      if (nftIsListed) {
        setOwner("OpenD");
        setBlur({filter: "blur(4px)"});
        setSellStatus("Listed");
      }else{
        setButton(<Button handleClick = {()=> handleSell()} text={"sell"}/>);
      };



    } catch (error) {
      console.error("failed to load NFT: ", error);
    }
    
  };  


  useEffect(()=>{
    loadNFT();
  }, []);

  function handleSell(){
    console.log("clicked the sell button");
    setPriceInput(
      <input
          placeholder="Price in FORTUNE"
          type="number"
          className="price-input"
          value={price}
          onChange={(e)=> {setPrice(e.target.value);
            priceRef.current = e.target.value;
          }}
        />
    );

    setButton(<Button handleClick = {()=>sellItem()} text={"confirm"}/>);
  };

  async function sellItem(){

    setBlur({filter: "blur(4px)"});

    setLoaderHidden(false);

    const currentPrice = priceRef.current;

    if(!currentPrice || currentPrice === "" || isNaN(currentPrice)){
      alert("Please enter a valid price");
      return;
    }

    console.log("set price" + currentPrice);

    const listingResult = await opend.listItem(props.id, Number(currentPrice)); 
    console.log("Listing Result: ",listingResult);
    if(listingResult == "Success"){

      const openDId = await opend.getOpenDCanisterID();

      const transferResult = await NFTActor.transferOwnership(openDId);
      console.log("transfer: ", transferResult);

      if(transferResult == "Success"){
        setLoaderHidden(true);
        setButton();
        setPriceInput();
        setOwner("OpenD");
        setSellStatus("Listed")
      }
      
    };
       
  };


 
  return (
    <div className="disGrid-item">
      <div className="disPaper-root disCard-root makeStyles-root-17 disPaper-elevation1 disPaper-rounded">
        <img
          className="disCardMedia-root makeStyles-image-19 disCardMedia-media disCardMedia-img"
          src={image}
          style={blur}
        />
        <div className="lds-ellipsis" hidden={loaderHidden}>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>

        <div className="disCardContent-root">
          <h2 className="disTypography-root makeStyles-bodyText-24 disTypography-h5 disTypography-gutterBottom">
            {name}<span className="purple-text"> {sellStatus}</span>
          </h2>
          <p className="disTypography-root makeStyles-bodyText-24 disTypography-body2 disTypography-colorTextSecondary">
            Owner: {owner}
            {priceInput}
          </p>
          {button}
        </div>
      </div>
    </div>
  );
}



export default Item;
