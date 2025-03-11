import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'; // Importez FormsModule ici
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CandidatureDetailsComponent } from './page/candidature-details/candidature-details.component';

@NgModule({
  declarations: [
    AppComponent,
  
  ],

  imports: [
    BrowserModule,
    HttpClientModule, // Ajout de HttpClientModule ici

    AppRoutingModule, // Ajoutez AppRoutingModule ici
    FormsModule, // Ajoutez FormsModule ici
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {} // Assurez-vous que AppModule est exporté