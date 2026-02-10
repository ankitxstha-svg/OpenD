import React from "react";
import {useEffect, useState} from "react";
import logo from "../../assets/logo.png";
import {Principal} from "@dfinity/principal";
import {Actor, HttpAgent} from "@dfinity/agent";
import { idlFactory } from "../../../declarations/nft/index";
import { opend } from "../../../declarations/opend";

function Item(props) {

  const [name, setName] = useState("");
  const [owner, setOwner] = useState("");
  const [image, setImage] = useState("");

  const principal = props.id? props.id : null;


  useEffect(()=>{
    loadNFT();
  }, []);

  async function loadNFT(){

    try {
      const agent = new HttpAgent({host : "http://localhost:8000"});
      await agent.fetchRootKey();
      const NFTActor = Actor.createActor(idlFactory,{
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
      

    } catch (error) {
      console.error("failed to load NFT: ", error);
    }
    
  };  


 
  return (
    <div className="disGrid-item">
      <div className="disPaper-root disCard-root makeStyles-root-17 disPaper-elevation1 disPaper-rounded">
        <img
          className="disCardMedia-root makeStyles-image-19 disCardMedia-media disCardMedia-img"
          src={image}
        />
        <div className="disCardContent-root">
          <h2 className="disTypography-root makeStyles-bodyText-24 disTypography-h5 disTypography-gutterBottom">
            {name}<span className="purple-text"></span>
          </h2>
          <p className="disTypography-root makeStyles-bodyText-24 disTypography-body2 disTypography-colorTextSecondary">
            Owner: {owner}
          </p>
        </div>
      </div>
    </div>
  );
}



export default Item;
