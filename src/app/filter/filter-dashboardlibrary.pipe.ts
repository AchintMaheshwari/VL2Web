import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterDashboardlibrary'
})
export class FilterDashboardlibraryPipe implements PipeTransform {

  transform(items: any[], filterDashboard: any): any[] {
    if(!items) return [];
    if(!filterDashboard) return items;
    filterDashboard = filterDashboard.toLowerCase();
     return items.filter( it =>{
      return (it.LessonName.toLowerCase().includes(filterDashboard)) || (it.LessonName.toString().toLowerCase().includes(filterDashboard)
    ||it.Tags.toLowerCase().includes(filterDashboard)) || (it.Tags.toString().toLowerCase().includes(filterDashboard));
    });
  }

}
