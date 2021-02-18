
import * as moment from 'moment';

export class DateUtils {

    static defaultFormatDate: string = "YYYY-MM-DD HH:mm:ss";
    static defaultFormatShortDate: string = "YYYY-MM-DD";

    public static convertStringToDate(dateS: any, format: string = this.defaultFormatDate): Date {
        if (dateS) {
            let date: Date;
            const mom = moment(dateS, format);
            if ( mom.isValid() ) {
                 date = moment(dateS, format).toDate();
            } else {
                date = null;
            }

            return date;
        } else {
            return null;
        }
    }

    public static convertDateToString(date: Date, format: string = this.defaultFormatDate): any {
        if (date) {
            const dateS: string = moment(date).format(format);
            return dateS;
        } else {
            return null;
        }
    }

    public static convertStringTimeToDate(time: string, format: string = this.defaultFormatDate): Date {
        if (time) {
            const dateActual = moment().format(this.defaultFormatShortDate);
            const dateResult: Date = moment(dateActual, format).toDate();

            const arrayTime:string[] = time.split(":");
            dateResult.setHours(Number(arrayTime[0]),Number(arrayTime[1]),Number(arrayTime[2]));
            return dateResult;
        } else {
            return null;
        }
    }
}
