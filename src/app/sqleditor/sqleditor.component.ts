import { Component, OnInit } from '@angular/core';
import {DbConnectService} from '../db-connect.service';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
interface rowData {
  name: string
}
interface dbData {
  metaData: rowData[],
  rows: any[]
}

interface Alert {
	type: string;
	message: string;
}

const ALERTS: Alert[] = [
	{
		type: 'danger',
		message: 'SQL QUERY SYNTAX ERROR: Please check your query.',
	},
];
@Component({
  selector: 'app-sqleditor',
  templateUrl: './sqleditor.component.html',
  styleUrls: ['./sqleditor.component.css']
})
export class SqleditorComponent implements OnInit {
  data!: dbData;
  backendService: DbConnectService;
  resultsHeader: string[] = [];
  rows: any[] = [];
  alerts: Alert[] = [];
  public textAreaForm: FormGroup;
  constructor(backendService: DbConnectService,fb : FormBuilder) {
    this.backendService = backendService;
    this.textAreaForm = fb.group({
      textArea: ""
    });
  }

  ngOnInit(): void {
  }

  onClickSubmit() {
    let query = this.textAreaForm.value.textArea;
    let gtQuery = query.replace(">","&gt;");
    let ltQuery = gtQuery.replace("<","&lt;");
    this.backendService.executeQuery(ltQuery).subscribe(
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
          this.reset();
          console.log(error)
        }
        this.data = data;
        this.rows = data.rows;
        console.log(data);
      },
      (error) => {
        console.log(error)
      }
    )
 }
 close(alert: Alert) {
		this.alerts.splice(this.alerts.indexOf(alert), 1);
	}

	reset() {
		this.alerts = Array.from(ALERTS);
	}

 
}



/*
`select *
           from daiyilong.airport_project`
           where state_name = 'FL'
*/