import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { DevicePage } from './device';

@NgModule({
  declarations: [
    DevicePage,
  ],
  imports: [
    //IonicModule.forChild(DevicePage),
  ],
  exports: [
    DevicePage
  ]
})
export class DeviceModule {}
