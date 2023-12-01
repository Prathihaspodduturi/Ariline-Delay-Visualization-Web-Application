import { Component, OnInit } from '@angular/core';
import {DbConnectService} from '../db-connect.service';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbPaginationModule, NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
interface rowData {
  name: string
}
interface dbData {
  metaData: rowData[],
  rows: any[]
}

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit {
  page = 1;
  pageSize = 15;
  data!: dbData;
  backendService: DbConnectService;
  resultsHeader: string[] = [];
  ConstantRows: any[] = [];
  rows: any[] = [];
  collectionSize = this.ConstantRows.length;
  selectedQuery: string = "Choose a table";
  queries: string[] = [
    "Airline Change",
    "Airline Passenger Satisfaction",
    "Airports",
    "Carrier",
    "Delay less than 15 minutes",
    "Delay more than 15 minutes",
    "Flight weather",
    "Weather Event"
  ]
  public textAreaForm: FormGroup;
  constructor(backendService: DbConnectService,fb : FormBuilder) {
    this.backendService = backendService;
    this.textAreaForm = fb.group({
      textArea: ""
    });
    //this.collectionSize = this.ConstantRows.length;
    //this.refreshRows();
  }

  ngOnInit(): void {
  }

  submitSelectAll(tablename:String) {
    this.backendService.executeQuery("select * from "+tablename).subscribe(
      (response) => {
        console.log(response)
        let data : dbData = response as dbData;
        this.resultsHeader = [];
        try {
          data.metaData.map(item => {
            this.resultsHeader.push(item.name);
          })
        } catch (error) {
          console.log("Something went wrong")
          // this.reset();
          console.log(error)
        }
        this.data = data;
        this.rows = data.rows;
        this.ConstantRows = data.rows;
        this.collectionSize = this.ConstantRows.length;
        this.refreshRows();
        console.log(data);
      },
      (error) => {
        console.log(error)
      }
    )
  }

  onSelectQuery(query: string, index: number) {
    this.selectedQuery = query;
    switch(index){
      case 0:
        this.submitSelectAll("daiyilong.airline_change");
      break;
      case 1:
        this.submitSelectAll("daiyilong.airport_passenger_satisfaction");
      break;
      case 2:
        this.submitSelectAll("daiyilong.airport_project");
      break;
      case 3:
        this.submitSelectAll("daiyilong.carrier");
      break;
      case 4:
        this.submitSelectAll("daiyilong.delay_less_15");
      break;
      case 5:
        this.submitSelectAll("daiyilong.delay_more_15");
      break;
      case 6:
        this.submitSelectAll("daiyilong.flight_weather");
      break;
      case 7:
        this.submitSelectAll("daiyilong.weatherevent");
      break;
    }
    //this.refreshRows();
  }
  refreshRows(){
    this.rows = this.ConstantRows.map((row, i) => ({ id: i + 1, ...row })).slice(
			(this.page - 1) * this.pageSize,
			(this.page - 1) * this.pageSize + this.pageSize,
		)
  }


}



/*
`select *
           from daiyilong.airport_project`
           where state_name = 'FL'
*/
