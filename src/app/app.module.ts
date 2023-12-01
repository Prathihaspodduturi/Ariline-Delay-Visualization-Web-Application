import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule  } from '@angular/forms';
import { AppComponent } from './app.component';
import { LineChartComponent } from './line-chart/line-chart.component';
import { HttpClientModule } from '@angular/common/http';
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxEchartsModule } from 'ngx-echarts';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule, Routes } from '@angular/router';
import { SummaryComponent } from './summary/summary.component';
import { NavbarComponent } from './navbar/navbar.component';
import { TableComponent } from './table/table.component';
import { SqleditorComponent } from './sqleditor/sqleditor.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HomeComponent } from './home/home.component';
import { Component, OnInit, PipeTransform } from '@angular/core';
import { DecimalPipe } from '@angular/common';

const appRoutes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'summary', component: SummaryComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'table', component: TableComponent  },
  { path: 'sql', component: SqleditorComponent },
];

@NgModule({
  declarations: [
    AppComponent,
    LineChartComponent,
    NavbarComponent,
    SummaryComponent,
    TableComponent,
    SqleditorComponent,
    DashboardComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,FormsModule,ReactiveFormsModule,NgbAlertModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts'), // or import('./path-to-my-custom-echarts')
    }),
    NgbModule, RouterModule.forRoot(
      appRoutes,
      { enableTracing: true } // <-- debugging purposes only
    )
  ],
  providers: [DecimalPipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
