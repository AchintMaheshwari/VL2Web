import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterSonglibrary'
})
export class FilterSongLibraryPipe implements PipeTransform {
  transform(items: any[], filterSong: any): any[] {
    if(!items) return [];
    if(!filterSong) return items;
    filterSong = filterSong.toLowerCase();
     return items.filter( it =>{
      return (it.SongName.toLowerCase().includes(filterSong)) || (it.SongName.toString().toLowerCase().includes(filterSong)
    ||it.Tags.toLowerCase().includes(filterSong)) || (it.Tags.toString().toLowerCase().includes(filterSong));
    });
  }

}
