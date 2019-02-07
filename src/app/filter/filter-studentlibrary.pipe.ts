import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterStudentlibrary'
})
export class FilterStudentlibraryPipe implements PipeTransform { 
  transform(items: any[], filterStudents: any): any[] { 
    if(!items) return [];
    if(!filterStudents) return items;
    filterStudents = filterStudents.toLowerCase();
     return items.filter( it =>{
      return (it.UserName.toLowerCase().includes(filterStudents)) || (it.UserName.toString().toLowerCase().includes(filterStudents));
    });
  }
}
