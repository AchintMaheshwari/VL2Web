import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterExerciselibrary'
})
export class FilterExerciseLibraryPipe implements PipeTransform {
  transform(items: any[], filterExercise: any): any[] {
    if(!items) return [];
    if(!filterExercise) return items;
    filterExercise = filterExercise.toLowerCase();
     return items.filter( it =>{
      return (it.ExerciseName.toLowerCase().includes(filterExercise)) || (it.ExerciseName.toString().toLowerCase().includes(filterExercise)
    ||it.Tags.toLowerCase().includes(filterExercise)) || (it.Tags.toString().toLowerCase().includes(filterExercise));
    });
  }

}
