import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
// only does asyncStorage as driver
import { Storage } from '@ionic/storage';
// uses cordova BLE plugin
import { DevicePage } from '../device/device';
import { BLE } from '@ionic-native/ble';

import { BluetoothCore } from '@manekinekko/angular-web-bluetooth';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})


export class HomePage {

  private _deviceList: string[] = [];
  private isScanning: boolean = false;
  private isConnected: boolean = false;
  protected ble: BLE;

  static MTL_CONTINUATION_CP_UUID: string = "c4edc000-9daf-11e3-8003-00025b000b00";
  static MTL_COMPLETE_CP_UUID: string = "c4edc000-9daf-11e3-8004-00025b000b00";

  constructor( public navCtrl: NavController,
               public storage: Storage,
               public webble: BluetoothCore ) {

    storage.ready().then( () => {

      console.log( "Storage driver ", storage.driver )
      storage.get( 'ownid' ).then(( val ) => {
        if( val != null ) {
          console.log( "no Device ID" );
        } else {
          console.log('Device ID ', val);
        }
      })
    });


    // check BLE
    if( this.ble ) {
        this.ble.isEnabled().then( () => {
          console.log( "BLE is enabled" );
        },
        err => {
          console.log( "enable Bluetooth " );
        })
    } else {
      console.log( "try using web bluetooth");
    }
}

  setData( value ){
    console.log("set data");
    this.storage.set( 'ownid', value );
  }

  getData(){
    this.storage.get( 'ownid' ).then(( data ) => {
      console.log( "ownid ", data );
    });
  }

  startScanning() {

    console.log( "Scanning Started" );
    this._deviceList = [];
    this.isScanning = true;

    if( this.ble ) {
      this.ble.enable();

      this.ble.startScan([]).subscribe(device => {
            this._deviceList.push( device );
            console.log( JSON.stringify( device ));
          },
          err => {
            //this.message = "Error";
          }
      );
    } else {

      // this is web bluetooth scanning, not working yet
      let scanfilter1 = {
        options: {
          acceptAllDevices: true
        }
      };
      let scanfilter2 = {
        filters: [{ services: [ 0xFEF1 ] }],
        options: {
          keepRepeatedDevices: true,
          acceptAllAdvertisements: true,
        }
      };



      try {
        this.webble
            // 1: discover devices
            .discover$( scanfilter2 )
            // 2: get service
            .mergeMap(gatt =>  {
              console.log( "gatt: ", gatt);
              return this.webble.getPrimaryService$(gatt, 0xFEF1);
            })
            // 3) get a specific characteristic on that service
            .mergeMap(primaryService => this.webble.getCharacteristic$( primaryService, HomePage.MTL_COMPLETE_CP_UUID ))
            // 4: another char
            .mergeMap(characteristic => this.webble.readValue$(characteristic))
            // 5: on that Dataview, get the values
            .map(value => value.getUint8(0));
      } catch( e ) {
        console.error('Oops! can not read value from %s', e);
      }
    }

    setTimeout(() => {
      if( this.ble ) {
        this.ble.stopScan().then(() => {
          console.log("Scanning has stopped");
          console.log(JSON.stringify(this._deviceList));
          this.isScanning = false;
        });
      } else {

      }
    }, 3000);
  }

  connectToDevice( device ) {
    console.log( "Connect To Device" );
    console.log( JSON.stringify( device ))
    this.navCtrl.push( DevicePage, {
      device: device
    });
  }

  // BLE helper functions
  // convert data to ArrayBuffers before sending
  // convert from ArrayBuffers when receiving
  // ASCII only
  stringToBytes( string ) {
    var array = new Uint8Array(string.length);
    for (var i = 0, l = string.length; i < l; i++) {
      array[i] = string.charCodeAt(i);
    }
    return array.buffer;
  }

  // ASCII only
  bytesToString( buffer ) {
    return String.fromCharCode.apply(null, new Uint8Array(buffer));
  }



}
