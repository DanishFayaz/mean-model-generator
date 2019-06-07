import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from "@angular/common";
import { AdminLayoutRoutes } from './admin-layout.routing';
import { HomeComponent } from "../../pages/home/home.component";
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HighlightModule } from "ngx-highlightjs";
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AdminLayoutRoutes),
    FormsModule,
    ReactiveFormsModule,
    HighlightModule,
    HttpClientModule,
    NgbModule
  ],
  declarations: [
    HomeComponent
  ]
})

export class AdminLayoutModule {}
