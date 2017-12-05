import React, {Component} from 'react'
import Map, { InfoWindow, Marker, GoogleApiWrapper} from 'google-maps-react';
import AddressBar from './addressBar'
import RestaurantList from './restaurantList'
import {getMidArray, getLatLong} from '../services/midpoint'


const url = "http://localhost:3001/api/v1/";

const apiKey =  ('AIzaSyCsmeDgEFx6LZXsP0WqJN0B_9bm61_c1ZQ')

export class MapContainer extends Component {

  constructor(props){
    super(props)
    this.state = {
      addressType: 'work',
      lat: 40.748541,
      lng: -73.985763,
      yelpResults: [],
      eventAddresses: [],

    }
  }


  fetchCoordinates = () => {
    fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${this.state.address}&key=${apiKey}`)
    .then(res => res.json())
    .then(json => this.setState({
      lat: json.results[0].geometry.location.lat,
      lng: json.results[0].geometry.location.lng},() => this.fetchToYelp(this.state.lat,this.state.lng) ) )
  }

  postCoordinates = () => {
    // debugger
    console.log('the yelp results are', this.state.yelpResults)
    // const body = {
    //   method: "POST",
    //   headers: {
    //     'Accept': 'application/json',
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     address: this.state.address,
    //     lat: this.state.lat,
    //     lng: this.state.lng,
    //     addressType: this.state.addressType
    //   })
    // }
    // fetch(`http://localhost:3001/addresses`, body)
    // .then(res => res.json())
  }


  fetchToYelp(lat,lng){
    const body = {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        lat: lat,
        lng: lng
      })
    }

    fetch(`http://localhost:3001/adapters`, body)
    .then(res => res.json()).then(json => this.setState({
      yelpResults: json.businesses.sort(function(a,b){return b.rating-a.rating}).slice(0,6)
    }, () => this.postCoordinates() ))
  }



  fetchMultipleCoordinates = (address, length) => {
    // console.log(this.state)

    fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${apiKey}`)
    .then(res => res.json())
    .then(json =>

      this.setState({
      eventAddresses: [...this.state.eventAddresses, {
        lat: json.results[0].geometry.location.lat,
        lng: json.results[0].geometry.location.lng
      }]
    }, () => this.state.eventAddresses.length === length ? this.calculateMidpoint() : null
  )
  )
  }

  calculateMidpoint = () => {
    const result = getLatLong(this.state.eventAddresses)

    this.setState({
      lat: result.lat,
      lng: result.lng,
      eventAddresses: []
   }, () => this.fetchToYelp(this.state.lat,this.state.lng) )
  }

  handleAddressSubmit = (state) => {
    const addresses = state.addresses
    const length = state.addresses.length
    this.setState({
      lat:null,
      lng: null
      }, ()=> addresses.map(address => { return this.fetchMultipleCoordinates(address.address, length) }))

  }

render() {
  const style = {
    display: 'block',
    width: '50%',
    height: '50%'
  }

    return (
      <div>
      

        <AddressBar
        handleSubmit={this.handleAddressSubmit}
        />

        {(this.state.lat && this.state.lng) ?
          <Map
          google={this.props.google}
          zoom={16}
          style={style}
          initialCenter={{
            lat: this.state.lat,
            lng: this.state.lng
          }}
          >
          {this.state.yelpResults.map(result => <Marker position={
            {
              lat: result.coordinates.latitude,
              lng: result.coordinates.longitude
            }}/>)}
          </Map> :
          <p>loading map.....</p>
        }



          {this.state.yelpResults[1] ?
            <RestaurantList
              results = {this.state.yelpResults}/>: <p></p>}
      </div>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: ('AIzaSyCsmeDgEFx6LZXsP0WqJN0B_9bm61_c1ZQ')
})(MapContainer)
