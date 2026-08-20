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

    if (dateOnly) {
        const datePart = value.slice(0, 10);
        const [year, month, day] = datePart.split('-').map(Number);

        if (
            !year ||
            !month ||
            !day ||
            Number.isNaN(year) ||
            Number.isNaN(month) ||
            Number.isNaN(day)
        ) {
            return '—';
        }

        return new Intl.DateTimeFormat('en-US', {
            dateStyle: 'medium',
        }).format(
            new Date(
                year,
                month - 1,
                day,
                12,
                0,
                0,
            ),
        );
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '—';
    }

    return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'UTC',
    }).format(date);
}