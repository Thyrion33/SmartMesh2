/**
 * Created by juergen on 4/12/17.
 */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BluetoothCore } from '@manekinekko/angular-web-bluetooth';


@Injectable()
export class MeshService {

    static GATT_CHARACTERISCTICS = [
        // MTL_CONTINUATION_CP_UUID
        "c4edc000-9daf-11e3-8003-00025b000b00",
        // MTL_COMPLETE_CP_UUID
        "c4edc000-9daf-11e3-8004-00025b000b00"
    ];
    static MTL_CONTINUATION_CP_UUID: string = "c4edc000-9daf-11e3-8003-00025b000b00";
    static MTL_COMPLETE_CP_UUID: string = "c4edc000-9daf-11e3-8004-00025b000b00";

    static GATT_PRIMARY_SERVICE = 0xFEF1;

    constructor(
        private _core: BluetoothCore
    ) {
    }

    getFakeValue() {
        this._core.fakeNext();
    }

    getDevice() {
        return this._core.getDevice$();
    }

    streamValues() {
        return this._core.streamValues$()
            .map( (value: DataView) => value.getUint8(0) );
    }

    /**
     * Get Battery Level GATT Characteristic value.
     * This logic is specific to this service, this is why we can't abstract it elsewhere.
     * The developer is free to provide any service, and characteristics she wants.
     *
     * @return {Observable<number>} Emites the value of the requested service read from the device
     */

    // map data .map( (data: DataView) => {
    // let value = data.getUint16(0, true /* little endian */);
    // let mantissa = value & 0x0FFF;
    //  let exponent = value >> 12;
    //  let magnitude = Math.pow(2, exponent);
    //  let output = (mantissa * magnitude);
    //  let lux = output / 100.0;
    //  return +lux.toFixed(2);
    //});

    getContinuationMTL(): Observable<number> {
        console.log('Getting cont Mesh Service: %s', MeshService.GATT_CHARACTERISCTICS[0]);

        return this._setupGATTConnection(MeshService.GATT_CHARACTERISCTICS[0])
            .mergeMap( (characteristic: BluetoothRemoteGATTCharacteristic) =>  this._core.readValue$(characteristic) )
            .map( (value: DataView, index: number) => value.getUint8(0) )

    }


    getCompleteMTL(): Observable<number> {
        console.log('Getting complete Mesh Service: %s', MeshService.GATT_CHARACTERISCTICS[1]);

        return this._setupGATTConnection( MeshService.GATT_CHARACTERISCTICS[1] )
            .mergeMap( (characteristic: BluetoothRemoteGATTCharacteristic) =>  this._core.readValue$(characteristic) )
            .map( (value: DataView, index: number) => {
                return value.getUint8(0);
            });

    }


    private _setupGATTConnection(characteristic): Observable<any> {

        let scanfilter = {
            filters: [{ services: [ 0xFEF1 ] }],
            options: {
                keepRepeatedDevices: true,
                acceptAllAdvertisements: true,
            }
        };

        return this._core
            .discover$( scanfilter )
            .mergeMap( (gatt: BluetoothRemoteGATTServer)  => this._core.getPrimaryService$(gatt, MeshService.GATT_PRIMARY_SERVICE) )
            .mergeMap( (primaryService: BluetoothRemoteGATTService) => this._core.getCharacteristic$(primaryService, characteristic) );
    }

}