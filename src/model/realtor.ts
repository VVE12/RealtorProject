export class Realtor {

    id: number;
    guid: number;
    firstName: string;
    lastName: string;
    division: string;
    date: string;

    constructor(
        id: number, guid: number,
        firstName: string, lastName: string, 
        division: string, date: string,
        ){
            
        this.id = id;
        this.guid = guid;
        this.firstName = firstName;
        this.lastName = lastName;
        this.division = division;
        this.date = date;
    }
}