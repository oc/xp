module api.util {

    export class DateHelper {

        public static isInvalidDate(value: Date): boolean {
            return isNaN(value.getTime());
        }

        public static getTZOffset(): number {
            return (new Date().getTimezoneOffset() / 60) * -1;
        }

        public static parseUTCTime(localTime: string): string {
            var values = localTime.split(':');
            var date = new Date();
            var localHours = Number(values[0]);
            if (values.length == 3) {
                date.setHours(localHours, Number(values[1]), Number(values[2]));
            } else {
                date.setHours(localHours, Number(values[1]));
            }

            var hoursAsString = "" + date.getUTCHours();
            var minutesAsString = "" + date.getUTCMinutes();
            return hoursAsString + ":" + minutesAsString;
        }

        public static parseUTCDate(value: string): Date {

            var parsedYear: number = Number(value.substring(0, 4));
            var parsedMonth: number = Number(value.substring(5, 7));
            var parsedDayOfMonth: number = Number(value.substring(8, 10));
            return api.util.DateHelper.newUTCDate(parsedYear, parsedMonth - 1, parsedDayOfMonth);
        }

        public static parseUTCDateTime(value: string): Date {

            var parsedYear: number = Number(value.substring(0, 4));
            var parsedMonth: number = Number(value.substring(5, 7));
            var parsedDayOfMonth: number = Number(value.substring(8, 10));
            var parsedHours: number = Number(value.substring(11, 13));
            var parsedMinutes: number = Number(value.substring(14, 16));
            var parsedSeconds: number = Number(value.substring(17, 19));
            return api.util.DateHelper.newUTCDateTime(parsedYear, parsedMonth - 1, parsedDayOfMonth, parsedHours, parsedMinutes,
                parsedSeconds);
        }

        public static newUTCDate(year: number, month: number, date: number) {

            return new Date(Date.UTC(year, month, date));
        }

        public static newUTCDateTime(year: number, month: number, date: number, hours: number, minutes: number, seconds: number = 0) {

            return new Date(Date.UTC(year, month, date, hours, minutes, seconds));
        }

        public static formatUTCDate(date: Date): string {
            var yearAsString = "" + date.getUTCFullYear();
            return yearAsString + "-" + this.padNumber(date.getUTCMonth() + 1) + "-" + this.padNumber(date.getUTCDate());
        }

        public static formatDate(date: Date): string {
            var yearAsString = "" + date.getFullYear();
            return yearAsString + "-" + this.padNumber(date.getMonth() + 1) + "-" + this.padNumber(date.getDate());
        }

        private static padNumber(num: number): string {
            return (num < 10 ? '0' : '') + num;
        }

        public static formatUTCDateTime(date: Date): string {
            var dateAsString = DateHelper.formatUTCDate(date);
            return dateAsString + "T" + this.padNumber(date.getUTCHours()) + ":" + this.padNumber(date.getUTCMinutes()) + ":" +
                   this.padNumber(date.getUTCSeconds());
        }

        public static parseDate(value: string): Date {
            var dateStr = (value || '').trim();
            if (dateStr.length < 8 || dateStr.length > 10) {
                return null;
            }
            var parts = dateStr.split('-');
            if (parts.length !== 3 || parts[0].length !== 4) {
                return null;
            }
            var parsedYear: number = Number(parts[0]);
            var parsedMonth: number = Number(parts[1]);
            var parsedDayOfMonth: number = Number(parts[2]);

            var date = new Date(parsedYear, parsedMonth - 1, parsedDayOfMonth);
            return date.getFullYear() === parsedYear && date.getMonth() === (parsedMonth - 1) && date.getDate() === parsedDayOfMonth
                ? date
                : null;
        }

        private static parseTime(value: string): Time {
            var dateStr = (value || '').trim();
            if (dateStr.length != 5) {
                return null;
            }
            var parts = dateStr.split(':');
            if (parts.length !== 2) {
                return null;
            }
            var hour: number = Number(parts[0]);
            var minute: number = Number(parts[1]);
            if (isNaN(hour) || isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
                return null;
            }
            return {hour: hour, minute: minute};
        }

        static parseDateTime(value: string): Date {
            var dateStr = (value || '').trim();
            if (dateStr.length < 14 || dateStr.length > 16) {
                return null;
            }
            var parts = dateStr.split(' ');
            if (parts.length !== 2) {
                return null;
            }
            var datePart = parts[0];
            var timePart = parts[1];
            var date = DateHelper.parseDate(datePart);
            if (!date) {
                return null;
            }
            var time = DateHelper.parseTime(timePart);
            if (!time) {
                return null;
            }
            date.setHours(time.hour, time.minute, 0, 0);
            return date;
        }

        /**
         * E.g. numDaysInMonth(2015, 1) -> 28
         * @param year
         * @param month 0 based month number of the year. 0 == January , 11 == December
         * @returns {number}
         */
        static numDaysInMonth(year: number, month: number): number {
            return new Date(year, month + 1, 0).getDate();
        }
    }

    interface Time {
        hour: number;
        minute: number;
    }
}
