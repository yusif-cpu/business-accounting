export function formatMoney(value: number | string): string {
    return `$${Number(value).toFixed(2)}`;
}

export function formatDate(
    value: string | null | undefined,
    dateOnly = false,
): string {
    if (!value) {
        return '—';
    }

    const datePart = value.slice(0, 10);
    const [year, month, day] = datePart.split('-');

    if (!year || !month || !day) {
        return '—';
    }

    if (dateOnly) {
        return `${day}/${month}/${year}`;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '—';
    }

    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');

    return `${day}/${month}/${year}, ${hours}:${minutes}`;
}

export function formatInputDate(value: string): string {
    if (!value) {
        return '';
    }

    const [year, month, day] = value.slice(0, 10).split('-');

    if (!year || !month || !day) {
        return '';
    }

    return `${day}/${month}/${year}`;
}

export function parseInputDate(value: string): string {
    const numbers = value.replace(/\D/g, '').slice(0, 8);

    if (numbers.length !== 8) {
        return value;
    }

    const day = numbers.slice(0, 2);
    const month = numbers.slice(2, 4);
    const year = numbers.slice(4, 8);

    return `${year}-${month}-${day}`;
}