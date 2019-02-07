import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterVideolibrary'
})
export class FilterVideoLibraryPipe implements PipeTransform {
  transform(items: any[], filterVideo: any): any[] {
    if(!items) return [];
    if(!filterVideo) return items;
    filterVideo = filterVideo.toLowerCase();
     return items.filter( it =>{
      return (it.VideoName.toLowerCase().includes(filterVideo)) || (it.VideoName.toString().toLowerCase().includes(filterVideo)
    ||it.Tags.toLowerCase().includes(filterVideo)) || (it.Tags.toString().toLowerCase().includes(filterVideo));
    });
  }

}
