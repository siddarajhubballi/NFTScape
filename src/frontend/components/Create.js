import { useState } from 'react'
import { ethers } from "ethers"
import { Row, Form, Button } from 'react-bootstrap'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { Buffer } from 'buffer';
import Geomaps from './map';

const projectId = '2ItlyYUaEKFL69SYHsgL9aQu4TJ';
const projectSecret = '5960b01ad9d079b1a2e6d9b457c3b51a';
const auth = `Basic ${Buffer.from(`${projectId}:${projectSecret}`).toString('base64')}`;

const client = ipfsHttpClient({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: auth,
  },
});


// const client = ipfsHttpClient('https://nishil.infura-ipfs.io:5001/api/v0')

const Create = ({ marketplace, nft }) => {
  const [image, setImage] = useState('')
  const [price, setPrice] = useState(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [path, setPath] = useState([]);
  const [avButton, setButton] = useState(true);

  const childToParent = (data)=> {
    setPath(data);
    console.log("hi");
    console.log(data);
    if(data.length != 0) {
      setButton(false);
    }
    else {
      setButton(true);
    }
  }
  console.log(path);
  const listItems = path.map((item) =>
        <li key={item.lng}>&rarr; lag:{item.lat.toFixed(5)} lng:{item.lng.toFixed(5)}</li> 
  );

  const uploadToIPFS = async (event) => {
    event.preventDefault()
    const file = event.target.files[0]
    const subdomain = 'https://nishil.infura-ipfs.io';
    if (typeof file !== 'undefined') {
      try {
        const result = await client.add(file)
        console.log(result)
        setImage(`${subdomain}/ipfs/${result.path}`)
      } catch (error){
        console.log("ipfs image upload error: ", error)
      }
    }
  }
  const createNFT = async () => {
    if (!image || !price || !name || !description || !path) {
      alert("Please enter all the details...");
      return
    }
    try{
      const result = await client.add(JSON.stringify({image, price, name, description,path}))
      mintThenList(result)
    } catch(error) {
      console.log("ipfs uri upload error: ", error)
    }
  }
  const mintThenList = async (result) => {
    const uri = `https://nishil.infura-ipfs.io/ipfs/${result.path}`
    // mint nft 
    await(await nft.mint(uri)).wait()
    // get tokenId of new nft 
    const id = await nft.tokenCount()
    // approve marketplace to spend nft
    await(await nft.setApprovalForAll(marketplace.address, true)).wait()
    // add nft to marketplace
    const listingPrice = ethers.utils.parseEther(price.toString())
    await(await marketplace.makeItem(nft.address, id, listingPrice)).wait()
    alert("NFT Listed Successfully...")
  }
  return (
    <div className="container-fluid mt-5">
      <div className="row">
        <main role="main" className="col-lg-12 mx-auto" style={{ maxWidth: '1000px' }}>
          <div className="content mx-auto formBlock">
            <h4 className="createHeading">Enter Details : </h4>
            <Row className="g-4">
              <Form.Control
                type="file"
                required
                name="file"
                onChange={uploadToIPFS}
              />
              <Form.Control onChange={(e) => setName(e.target.value)} size="lg" required type="text" placeholder="Name" />
              <Form.Control onChange={(e) => setDescription(e.target.value)} size="lg" required as="textarea" placeholder="Address and Landmark" />
              <Form.Control onChange={(e) => setPrice(e.target.value)} size="lg" required type="number" placeholder="Price in ETH" />
              <div className="d-grid px-0">
              <h4 className="mapHeading">Please mark coordinates of the property : </h4>
              <Geomaps childToParent={childToParent}></Geomaps>
              <div>
              {(path.length == 0)?<h5>[Draw a valid Polygon]</h5>:<div><h5>Coordinates of the Polygon are : </h5><ul key={listItems.lng}>{listItems}</ul></div>}
              </div>
                <Button disabled={avButton} onClick={createNFT} variant="primary" size="lg" className="createbtn">
                  Create & List NFT!
                </Button>
              </div>
            </Row>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Create