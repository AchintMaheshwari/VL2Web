import { Pipe, PipeTransform } from '@angular/core';
import { LowerCasePipe } from '@angular/common';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {
  debugger;

  transform(items: any[], searchText: any): any[] {
    if(!items) return [];
    if(!searchText) return items;
     searchText = searchText.toLowerCase();
     return items.filter( it =>{
      return (it.Name.toLowerCase().includes(searchText)) || (it.Amount.toString().toLowerCase().includes(searchText));
    });
   }}