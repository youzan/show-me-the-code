if (process.env.NODE_ENV !== 'production') {
  require('reflect-metadata');
}
import 'zone.js';
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import 'primeicons/primeicons.css';
import 'primeng/resources/themes/nova-light/theme.css';
import 'primeng/resources/primeng.min.css';

import { AppModule } from './app.module';
import './style.scss';

if (process.env.NODE_ENV === 'production') {
  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(error => {
    console.error(error);
  });
