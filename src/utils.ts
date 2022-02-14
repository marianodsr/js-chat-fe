import { EVENTS } from "./constants";

export const parseHeader = (header: string): string =>  {
    const upperHeader = header.toUpperCase()
    if(Object.values(EVENTS).includes(header.toUpperCase())) {
        return upperHeader
    }
    return EVENTS.MESSAGE
}