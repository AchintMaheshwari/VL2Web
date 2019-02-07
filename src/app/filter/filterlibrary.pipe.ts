import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterlibrary'
})
export class FilterlibraryPipe implements PipeTransform {

  //transform(value: any, args?: any): any {
  //  return null;
  //}
  transform(items: any[], searchText: any): any[] {
    if(!items) return [];
    if(!searchText) return items;
     searchText = searchText.toLowerCase();
     return items.filter( it =>{
     return (it.LabelName.toLowerCase().includes(searchText)) 
     || (it.Artist.toString().toLowerCase().includes(searchText))
     || (it.FilterType.toString().toLowerCase().includes(searchText));
    });
   }}

