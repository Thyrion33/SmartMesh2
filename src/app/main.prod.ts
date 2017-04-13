/**
 * Created by juergen on 4/10/17.
 */

import { platformBrowser } from '@angular/platform-browser';
import {enableProdMode } from '@angular/core';


import { AppModuleNgFactory } from './app.module.ngfactory';

enableProdMode();
platformBrowser().bootstrapModuleFactory( AppModuleNgFactory );
