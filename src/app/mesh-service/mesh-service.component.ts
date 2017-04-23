/**
 * Created by juergen on 4/12/17.
 */
import { Component, OnInit, NgZone } from '@angular/core';
import { MeshService } from '../mesh-service/mesh-service.service';
import { BluetoothCore } from '@manekinekko/angular-web-bluetooth';

@Component({
    selector: 'mesh-packets',
    template: `

    <ion-card *ngIf="!connected">
      <ion-card-title>Connect</ion-card-title>
      <button md-raised-button (click)="connect()" [disabled]="connecting">
        <ion-icon>bluetooth_searching</ion-icon> Connect to Mesh Bridge
      </button>
    </ion-card>

    <div *ngIf="connected">
          <ion-card>
            <ion-card-title><ion-icon>done</ion-icon> Connected</ion-card-title>

            <ion-card-content>
              <p>Device: {{deviceName}}</p>
            </ion-card-content>

            <a href="#" (click)="getMeshPacket()">MeshPacket ({{meshPacket || 'N/A'}}%)</a>


            <button md-raised-button (click)="disconnect()">Disconnect</button>
            <button md-button (click)="sendMsg( '1' )">SEND</button>
          </ion-card>
    </div>

    <ion-card>
        <ion-card-title>Debug Log</ion-card-title>
        <ion-card-content>
            <pre>{{debugLog}}</pre>
            <button ion-button (click)="clearLog()"><ion-icon>delete</ion-icon></button>
        </ion-card-content>
    </ion-card>
  `,
    providers: [ MeshService ]
})
export class MeshServiceComponent {

    debugLog: string;
    meshPacket: string = '--';
    device: any = {};

    connecting = false;
    connected = false;

    constructor(
        public _zone: NgZone,
        public _meshService: MeshService
    ) {}


    streamValues() {
        this._meshService.streamValues().subscribe( this.showMeshPacket.bind( this ));
    }

    connect() {
        this.connecting = true;

        this._meshService.connectMesh()
            .finally(() => {
                this.connecting = false;
            })
            .subscribe(( device ) => {
                this.connected = true;
                this._meshService.receive$.subscribe( value => {
                    this.debugLog += JSON.stringify( value );
                });

            }
        );

        //getShortMTL().subscribe( this.showMeshPacket.bind( this ));

    }


    get deviceName() {
        return this._meshService.gatt ? this._meshService.gatt.device.name : null;
    }


    // this uses Observer to subscribe. Use map to create another observer with data mapping

    // map data .map( (data: DataView) => {
    // let value = data.getUint16(0, true /* little endian */);
    // let mantissa = value & 0x0FFF;
    //  let exponent = value >> 12;
    //  let magnitude = Math.pow(2, exponent);
    //  let output = (mantissa * magnitude);
    //  let lux = output / 100.0;
    //  return +lux.toFixed(2);
    //});



    disconnect() {
        this._meshService.disconnect();
    }

    showMeshPacket( value: number ) {

        // force change detection
        this._zone.run( () =>  {
            console.log('Reading mesh %d', value);
            this.meshPacket = ''+value;
        });
    }

    sendMsg( value: string ){
        this._meshService.writeCompleteMTL( value );
    }

}