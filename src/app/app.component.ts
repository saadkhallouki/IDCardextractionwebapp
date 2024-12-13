import { Component } from '@angular/core';
import { IdCardExtractionComponent } from './id-card-extraction/id-card-extraction.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IdCardExtractionComponent],
  template: `<app-id-card-extraction></app-id-card-extraction>`
})
export class AppComponent {
  title = 'id-card-extraction-app';
}
