import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterLesson'
})
export class FilterLessonPipe implements PipeTransform { 
  transform(items: any[], filterlessons: any): any[] { 
    if(!items) return [];
    if(!filterlessons) return items;
    filterlessons = filterlessons.toLowerCase();
     return items.filter( it =>{
      return (it.LessonName.toLowerCase().includes(filterlessons)) || (it.LessonName.toString().toLowerCase().includes(filterlessons));
    });
  }
}
