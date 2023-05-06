import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Row, Col, Card } from 'react-bootstrap'

export default function MyPurchases({ marketplace, nft, account }) {
  const [loading, setLoading] = useState(true)
  const [purchases, setPurchases] = useState([])
  const loadPurchasedItems = async () => {
    // Fetch purchased items from marketplace by quering Offered events with the buyer set as the user
    const filter =  marketplace.filters.Bought(null,null,null,null,null,account)
    const results = await marketplace.queryFilter(filter)
    //Fetch metadata of each nft and add that to listedItem object.
    const purchases = await Promise.all(results.map(async i => {
      // fetch arguments from each result
      i = i.args
      // get uri url from nft contract
      const uri = await nft.tokenURI(i.tokenId)
      // use uri to fetch the nft metadata stored on ipfs 
      const response = await fetch(uri)
      const metadata = await response.json()
      // get total price of item (item price + fee)
      const totalPrice = await marketplace.getTotalPrice(i.itemId)
      // define listed item object
      let purchasedItem = {
        totalPrice,
        price: i.price,
        itemId: i.itemId,
        name: metadata.name,
        description: metadata.description,
        image: metadata.image,
        path: metadata.path
      }
      return purchasedItem
    }))
    setLoading(false)
    setPurchases(purchases)
  }
  useEffect(() => {
    loadPurchasedItems()
  }, [])
  if (loading) return (
    <main style={{ padding: "1rem 0" }}>
      <h2>Loading...</h2>
    </main>
  )
  return (
    <div className="flex justify-center">
      {purchases.length > 0 ?
        <div className="px-5 container">
          <Row xs={1} md={2} lg={4} className="g-4 py-5">
            {purchases.map((item, idx) => (
              // <Col key={idx} className="overflow-hidden">
              //   <Card>
              //     <Card.Img variant="top" src={item.image} />
              //     <Card.Footer>{ethers.utils.formatEther(item.totalPrice)} ETH</Card.Footer>
              //   </Card>
              // </Col>
              <Col key={idx} className="overflow-hidden">
              <Card>
                <Card.Img variant="top" src={item.image}/>
                <Card.Body color="secondary">
                  <Card.Title>{item.name}</Card.Title>
                  <Card.Text>
                    {item.description}
                  </Card.Text>
                </Card.Body>
                <Card.Footer>
                Coordinates : 
                  <Card.Text>
                     {item.path.map((data) => <li key={data.lat}>&rarr; lat:{data.lat.toFixed(5)} lng:{data.lng.toFixed(5)}</li>)}
                  </Card.Text>
              </Card.Footer>
              </Card>
            </Col>
            ))}
          </Row>
        </div>
        : (
          <main style={{ padding: "1rem 0" }}>
            <div className="noHeadingdiv">
              <h2 className="noHeading">No purchases</h2>
            </div>
          </main>
        )}
    </div>
  );
}