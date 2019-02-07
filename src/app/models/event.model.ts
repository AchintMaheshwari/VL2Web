export class EventModel {
    id: number;
    title: string;
    start: string;
    end: string;
    allDay: boolean = true;
    className:string;
    editable : boolean;
}