import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { BLE } from '@ionic-native/ble';

/**
 * Generated class for the Device page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-device',
  templateUrl: 'device.html',
})
export class DevicePage {

  device: any;
  connecting: boolean;
  characteristics: any;

  constructor( public navCtrl: NavController,
               public navParams: NavParams,
               private ble: BLE ) {

    this.device = this.navParams.get( 'device' );
    this.connecting = true;
    this.connect( this.device.id );
  }

  connect( deviceID ) {
    this.characteristics = [];

    this.ble.connect(deviceID).subscribe( peripheralData => {
          console.log( peripheralData.characteristics );
          this.characteristics = peripheralData.characteristics;
          this.connecting = false;
        },
        peripheralData => {
          console.log( "disconnected" );
        });
  }

  connectToCharacteristic( deviceID,characteristic ) {
    console.log( "Connect To Characteristic" );
    console.log(deviceID);
    console.log(characteristic);
  }



  ionViewDidLoad() {
    console.log( 'ionViewDidLoad Device' );
  }

}
