/**
 * Created by juergen on 4/12/17.
 */
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

/*
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/concatMap';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/publish';
import 'rxjs/add/operator/scan';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/zip';
import 'rxjs/add/operator/share';
*/
// all RX operators
import {Observable} from 'rxjs/Rx';

import { BluetoothCore } from '@manekinekko/angular-web-bluetooth';


@Injectable()
export class MeshService {

    static MESH_SERVICE = 0xFEF1;
    static MTL_CONTINUATION_CP: string = "c4edc000-9daf-11e3-8003-00025b000b00";
    static MTL_COMPLETE_CP: string = "c4edc000-9daf-11e3-8004-00025b000b00";
    static MTL_SHORT_CP = 0xFEF2;

    gatt:       BluetoothRemoteGATTServer;

    receive$:   Observable<string>;
    lines$:     Observable<string>;
    writable$:  Observable<boolean>;

    // writeable chars
    private completeChar:   BluetoothRemoteGATTCharacteristic;
    private continueChar:   BluetoothRemoteGATTCharacteristic;

    private writableSubject = new BehaviorSubject<boolean>(false);


    constructor( private _core: BluetoothCore ) {
        // make one behavior control
        this.writable$ = this.writableSubject.asObservable();
    }

    disconnect() {
        this.gatt.disconnect();
    }

    connectMesh(){
        return this._connect();
    }

    // connect
    private _connect() {

        let scanfilter = {
            filters: [{ services: [ 0xFEF1 ] }],
            options: {
                keepRepeatedDevices: true,
                acceptAllAdvertisements: true,
            }
        };

        return this._core
            .discover$( scanfilter )
            .mergeMap( (gatt: BluetoothRemoteGATTServer)  => {
                this.gatt = gatt;
                return this._core.getPrimaryService$( gatt, MeshService.MESH_SERVICE );
            })
            .mergeMap( (primaryService: BluetoothRemoteGATTService) =>
                this._connectChars( primaryService ));
    }

    // connect to the CHARACTERISTICS
    private _connectChars( primaryService: BluetoothRemoteGATTService ) {

        const MTL_short    = this._core.getCharacteristic$( primaryService, MeshService.MTL_SHORT_CP ).share();

        this.receive$ = MTL_short.mergeMap( characteristic => this._core.observeValue$( characteristic ))
            .map( value => String.fromCharCode.apply( null, new Uint8Array(value.buffer)) as string );

        const chars = this.receive$.concatMap(chunk => chunk.split(''));
        this.lines$ = chars.scan((acc, curr) => acc[acc.length - 1] === '\n' ? curr : acc + curr)
            .filter(item => item.indexOf('\n') >= 0);

        return Observable.zip(
            // write characteristic setup
            this._core
                .getCharacteristic$( primaryService, MeshService.MTL_COMPLETE_CP )
                .map(( characteristic: BluetoothRemoteGATTCharacteristic ) => {
                    this.completeChar = characteristic;
                }),
            // second one
            this._core
                .getCharacteristic$( primaryService, MeshService.MTL_CONTINUATION_CP )
                .map(( characteristic: BluetoothRemoteGATTCharacteristic ) => {
                    this.continueChar = characteristic;
                }),

            // read from characteristic
            MTL_short,
        ).do(([ _short, _complete, _continue ]) => {
            setTimeout(() => this.writableSubject.next( true ), 0);
        });
    }

    // write to CHAR
    writeCompleteMTL( text: string ) {
        const bytes = text.split('').map(c => c.charCodeAt(0));
        const chunks = [];
        while (bytes.length > 0) {
            chunks.push(new Uint8Array(bytes.splice(0, 20)));
        }
        const result = Observable.zip( Observable.from(chunks), this.writableSubject.filter(value => value))
            .mergeMap(([ chunk, writable ]) => {
                this.writableSubject.next( false );
                return this._core.writeValue$( this.completeChar, chunk);
            })
            .map(() => setTimeout(() => this.writableSubject.next(true), 10))
            .publish();
        result.connect();
        return result;
    }




    streamValues() {
        return this._core.streamValues$()
            .map( (value: DataView) => value.getUint8(0) );
    }




}