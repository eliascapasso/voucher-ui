
export interface Page<T> {
    content: T[];
    first:boolean;
    last:boolean;
    number:number;
    size:number;
    numberOfElements:number;
    totalPage: number;
    totalElements: number;
    empty:boolean;
}
