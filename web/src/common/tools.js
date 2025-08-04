

export function ranDate() {
    const date = chance.birthday()
    const formattedDate = date.toISOString().substring(0, 10);
    return formattedDate
    //const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
    //const localizedDate = new Intl.DateTimeFormat('es-MX', options).format(date);
    //return localizedDate
}
