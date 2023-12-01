import {Component, OnInit} from '@angular/core';
import {DbConnectService} from '../db-connect.service';
import {debounceTime, distinctUntilChanged, map, Observable, OperatorFunction} from "rxjs";

interface rowData {
  name: string
}

interface dbData {
  metaData: rowData[],
  rows: any[]
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {
  selectedYear: string = "Year";
  selectedYear2: string = "Year2";
  selectedMonth: string = "Month";
  selectedCity: string = "City";
  isYearVisible: boolean = false;
  isYear2Visible: boolean = false;
  isCityVisible: boolean = false;
  isMonthVisible: boolean = false;
  selectedQuery: string = "Choose a table";
  months: string[] = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  years!: string[];
  cities: string[] = [];
  xLabels: string[] = [];
  xName: string = "";
  yName: string = "";
  data: number[] = [];
  backendService: DbConnectService;
  queries: string[] = [
    "Display total airline delay time of each month in a particular year and particular city",
    "Total airline delay in minutes per month of the airline which has the most delay time in specified year",
    "Compare two years on various delay times on a given month",
    "Top 5 Airports with security delay on a given month and year",
    "Top 5 Airports with the most dissatisfaction rates in a given year"
  ]
  series: any = [];
  queryIndex: number = -1;
  monthIndex: number = -1;
  title: string = "";

  // public model: any;

  search: OperatorFunction<string, readonly string[]> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map((term) =>
        term.length < 2 ? [] : this.cities.filter((v) => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10),
      ),
    );

  constructor(backendService: DbConnectService) {
    this.backendService = backendService;
  }

  ngOnInit(): void {
    this.backendService.getYears().subscribe(
      (response) => {
        console.log(response)
        let responseData: dbData = response as dbData;
        this.years = responseData.rows.map(item => item["AIRLINE_YEAR"] as string);
      },
      (error) => {
        console.log(error)
      }
    )

    this.backendService.getCities().subscribe(
      (response) => {
        console.log(response)
        let responseData: dbData = response as dbData;
        this.cities = responseData.rows.map(item => item["CITY"] as string);
        console.log(this.cities);
      },
      (error) => {
        console.log(error)
      }
    )
  }

  onSelectYear(year: string) {
    this.selectedYear = year;
  }

  onSelectYear2(year: string) {
    this.selectedYear2 = year;
  }

  onSelectMonth(month: string, i: number) {
    this.selectedMonth = month;
    this.monthIndex = i;
  }

  onSelectQuery(query: string, index: number) {
    this.selectedQuery = query;
    this.queryIndex = index;
    this.isYearVisible = false;
    this.isYear2Visible = false;
    this.isMonthVisible = false;
    this.isCityVisible = false;
    this.selectedYear = "Year";
    this.selectedYear2 = "Year2";
    this.selectedMonth = "Month";
    this.selectedCity = "City";
    switch (this.queryIndex) {
      case 0:
        this.xName = "Month";
        this.yName = "Delay in Minutes";
        this.isCityVisible = true;
        this.isYearVisible = true;
        break;
      case 1:
        this.xName = "Month";
        this.yName = "Delay in Minutes";
        this.isYearVisible = true;
        break;
      case 2:
        this.xName = "Year";
        this.yName = "Delay in Minutes";
        this.isYearVisible = true;
        this.isYear2Visible = true;
        this.isMonthVisible = true;
        break;
      case 3:
        this.xName = "Airports";
        this.yName = "Delay in Minutes";
        this.isYearVisible = true;
        this.isMonthVisible = true;
        break;
      case 4:
        this.xName = "Airports";
        this.yName = "Dissatisfaction rate";
        this.isYearVisible = true;
        break;
    }
  }

  submit() {
    console.log(this.selectedCity);
    switch (this.queryIndex) {
      case 0:
        this.setDelayPerMonth();
        break;
      case 1:
        this.setMostDelayPerYear();
        break;
      case 2 :
        this.setDelayTypeCompareByYear();
        break;
      case 3:
        this.setSecurityDelays();
        break;
      case 4:
        this.setDissatisfactionRate()
        break;
    }

  }

  setMostDelayPerYear() {
    if (this.selectedYear != "Year") {
      this.backendService.getMostDelayPerYear(`?year=${this.selectedYear}`).subscribe(
        (response) => {
          console.log(response)
          let responseData: dbData = response as dbData;
          this.xLabels = responseData.rows.map(item => item["DELAY_MONTH"] as string);
          let data = responseData.rows.map(item => item["TOTAL_DELAY"] as number);
          this.title = responseData.rows[0]["CARRIER_NAME"];
          this.series = [{
            data: data,
            type: 'line',
          }];
        },
        (error) => {
          console.log(error)
        }
      )
    }
  }

  setDelayPerMonth() {
    if (this.selectedYear != "Year" && this.selectedCity != "City") {
      this.backendService.getDelayPerMonth(`?city=\'${this.selectedCity}\'&year=${this.selectedYear}`).subscribe(
        (response) => {
          console.log(response)
          let responseData: dbData = response as dbData;
          this.xLabels = responseData.rows.map(item => item["DELAY_MONTH"] as string);
          let data = responseData.rows.map(item => item["TOTAL_TIME"] as number);
          this.title = this.selectedCity + " " + this.selectedYear;
          this.series = [{
            data: data,
            type: 'line',
          }];
        },
        (error) => {
          console.log(error)
        }
      )
    }
  }

  setDelayTypeCompareByYear() {
    if (this.selectedYear != "Year" && this.selectedYear2 != "Year2" && this.selectedMonth != "Month") {
      this.backendService.getDelayTypeCompareByYear(`?year=${this.selectedYear}&year2=${this.selectedYear2}&month=${this.monthIndex}`).subscribe(
        (response) => {
          console.log(response)
          let responseData: dbData = response as dbData;
          this.xLabels = responseData.rows.map(item => item["YEAR"] as string);
          let meta = responseData.metaData.map(item => item.name)
          this.title = "Month: " + this.selectedMonth;
          console.log(meta);
          let test = []
          for (const metaKey of meta) {
            if(metaKey != "YEAR") {
              console.log(metaKey);
              test.push({
                name: metaKey,
                type: 'bar',
                data: responseData.rows.map(item => item[metaKey] as number)
              })
            }
          }
          // @ts-ignore
          this.series = test;
        },
        (error) => {
          console.log(error)
        }
      )
    }
  }

  setSecurityDelays() {
    if (this.selectedYear != "Year" && this.selectedMonth != "Month") {
      this.backendService.getSecurityDelays(`?year=${this.selectedYear}&month=${this.monthIndex}`).subscribe(
        (response) => {
          console.log(response)
          let responseData: dbData = response as dbData;
          this.xLabels = responseData.rows.map(item => item["AIRPORT_NAME"] as string);
          let data = responseData.rows.map(item => item["TOTAL_NO_OF_DELAYS"] as number);
          this.title = "Security related delays on Year: " + this.selectedYear + " Month: " + this.selectedMonth;
          this.series = [{
            data: data,
            type: 'bar',
          }];
        },
        (error) => {
          console.log(error)
        }
      )
    }
  }

  setDissatisfactionRate() {
    if (this.selectedYear != "Year") {
      this.backendService.getDissatisfaction(`?year=${this.selectedYear}`).subscribe(
        (response) => {
          console.log(response)
          let responseData: dbData = response as dbData;
          this.xLabels = responseData.rows.map(item => item["CARRIER_NAME"] as string);
          let data = responseData.rows.map(item => item["DISSATISFACTION_RATE"] as number);
          this.title = "Top 5 Airports with dissatisfaction rates in: " + this.selectedYear;
          this.series = [{
            data: data,
            type: 'bar',
          }];
        },
        (error) => {
          console.log(error)
        }
      )
    }
  }

}

