// СЛОВАРЬ ЗНАЧЕНИЙ (RU)
const DISPLAY_MAP: Record<string, string> = {
    'SOLID': 'Твердое вещество', 'LIQUID': 'Жидкость', 'GAS': 'Газ', 'VAPOR': 'Пар', 'AEROSOL': 'Аэрозоль',
    'NONE': 'Без запаха', 'SHARP': 'Резкий', 'SPECIFIC': 'Специфический', 'FRUIT': 'Фруктовый', 'OTHER': 'Другое',
};

export const formatValue = (val: any) => {
    if (val === null || val === undefined || val === "") return "—";
    return DISPLAY_MAP[String(val)] || val;
};