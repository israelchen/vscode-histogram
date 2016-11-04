'use strict';

export function leftPad(str: string, max: number, chars: string) {

    let result = "";

    for (let i = 0; i < max - str.length; i++) {
        result += chars;
    }

    return result + str;
}
