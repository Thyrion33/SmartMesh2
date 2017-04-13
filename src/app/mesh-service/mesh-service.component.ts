/**
 * Created by juergen on 4/12/17.
 */
import { Component, OnInit, NgZone } from '@angular/core';
import { MeshService } from '../mesh-service/mesh-service.service';
import { BluetoothCore } from '@manekinekko/angular-web-bluetooth';

@Component({
    selector: 'mesh-packets',
    template: `
    <a href="#" (click)="getMeshPacket()">MeshPacket ({{meshPacket || 'N/A'}}%)</a>
  `,
    styles: [`
    a {
      position: relative;
      color: rgba(255,255,255,1);
      text-decoration: none;
      background-color: #CD2834;
      font-family: monospace;
      font-weight: 700;
      font-size: 3em;
      display: block;
      padding: 4px;
      border-radius: 8px;
      box-shadow: 0px 9px 0px #B52231, 0px 9px 25px rgba(0,0,0,.7);
      margin: 100px auto;
      width: 410px;
      text-align: center;
      transition: all .1s ease;
    }
    a:active {
      box-shadow: 0px 3px 0px rgba(219,31,5,1), 0px 3px 6px rgba(0,0,0,.9);
      position: relative;
      top: 6px;
    }
  `],
    providers: [ MeshService ]
})
export class MeshServiceComponent implements OnInit {

    meshPacket: string = '--';
    device: any = {};

    constructor(
        public _zone: NgZone,
        public _meshService: MeshService
    ) {}

    ngOnInit() {
        this.getDeviceStatus();
        this.streamValues();
    }

    streamValues() {
        this._meshService.streamValues().subscribe( this.showMeshPacket.bind( this ));
    }

    getDeviceStatus() {
        this._meshService.getDevice().subscribe(
            (device) => {

                if(device) {
                    this.device = device;
                }
                else {
                    // device not connected or disconnected
                    this.device = null;
                    this.meshPacket = '--';
                }
            }
        );
    }

    getFakeValue() {
        this._meshService.getFakeValue();
    }

    getMeshPacket() {
        return this._meshService.getCompleteMTL().subscribe(this.showMeshPacket.bind(this));
    }

    showMeshPacket( value: number ) {

        // force change detection
        this._zone.run( () =>  {
            console.log('Reading mesh %d', value);
            this.meshPacket = ''+value;
        });
    }

}