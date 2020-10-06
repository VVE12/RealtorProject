export class Division{
    
    id: number;
    name: string;
    date: string;
    state: boolean;
    selectedDate: string;

    constructor(id: number, name: string, date: string, 
        state: boolean, selectedDate: string
        ){
        this.id = id;
        this.name = name;
        this.date = date;
        this.state = state;
        this.selectedDate = selectedDate;
    }
}