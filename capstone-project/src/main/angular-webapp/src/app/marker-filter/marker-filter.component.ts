import { Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-marker-filter',
  templateUrl: './marker-filter.component.html',
  styleUrls: ['./marker-filter.component.css']
})
export class MarkerFilterComponent implements OnInit {

  myControl = new FormControl();
  animals: Set<string> = new Set();
  options: string[];
  filteredOptions: Observable<string[]>;

  ngOnInit() {  
    this.options = ["Check"];
  }

  setOptionsArray() {
    this.animals.forEach((animal) => {
      this.options.push(animal);
    });

    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.options.filter(option => option.toLowerCase().indexOf(filterValue) === 0);
  }
}

