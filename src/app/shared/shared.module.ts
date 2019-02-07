import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [],
  exports: [
    CommonModule,    
  ]
})
export class SharedModule {
  public readonly vocalTypes = [{"type":"Soprano"},
                                {"type":"Countertenor"},
                                {"type":"Mezzo"},
                                {"type":"Tenor"},
                                {"type":"Alto"},
                                {"type":"Baritone"},
                                {"type":"Contralto"},
                                {"type":"Bass"}]
}
