export const FORM_OPTIONS = {
    appearance: [
        { value: 'SOLID', label: 'Твердое вещество' },
        { value: 'LIQUID', label: 'Жидкость' },
        { value: 'GAS', label: 'Газ' },
        { value: 'VAPOR', label: 'Пар' },
        { value: 'AEROSOL', label: 'Аэрозоль' }
    ],
    odor: [
        { value: 'NONE', label: 'Без запаха' },
        { value: 'SHARP', label: 'Резкий' },
        { value: 'SPECIFIC', label: 'Специфический' },
        { value: 'FRUIT', label: 'Фруктовый' },
        { value: 'OTHER', label: 'Другое' }
    ],
    state_in_air: [
        { value: 'P', label: 'Пары (п)' },
        { value: 'A', label: 'Аэрозоль (а)' },
        { value: 'PA', label: 'Смесь (п+а)' }
    ],
    limit_sign: [
        { value: 'REFLEX', label: 'Рефлекторный' },
        { value: 'RESORPTIVE', label: 'Резорбтивный' },
        { value: 'REF_RES', label: 'Рефлекторно-резорбтивный' },
        { value: 'SANITARY', label: 'Санитарно-бытовой' }
    ],
    yes_no_unknown: [
        { value: 'UNKNOWN', label: 'Нет сведений' },
        { value: 'YES', label: 'Да / Воздействует' },
        { value: 'NO', label: 'Нет / Не воздействует' }
    ],
    ghs_category: [
        { value: 'NC', label: 'Не классифицируется' },
        { value: '1', label: 'Категория 1' },
        { value: '1A', label: 'Категория 1A' },
        { value: '1B', label: 'Категория 1B' },
        { value: '2', label: 'Категория 2' },
        { value: '3', label: 'Категория 3' }
    ],
    sanpin_class: [
        { value: 'NC', label: 'Не классифицируется' },
        { value: '1', label: '1 - Чрезвычайно опасные' },
        { value: '2', label: '2 - Высокоопасные' },
        { value: '3', label: '3 - Умеренно опасные' },
        { value: '4', label: '4 - Малоопасные' }
    ],
    persistence: [
        { value: '', label: 'Не выбрано' },
        { value: 'LOW', label: 'Малоустойчивые (<20 дн)' },
        { value: 'MED', label: 'Среднеустойчивые (20-90 дн)' },
        { value: 'HIGH', label: 'Устойчивые (>90 дн)' }
    ],
    migration: [
        { value: '', label: 'Не выбрано' },
        { value: 'MOB', label: 'Подвижен' },
        { value: 'IMM', label: 'Малоподвижен' }
    ],
    sorption: [
        { value: '', label: 'Не выбрано' },
        { value: 'STR', label: 'Сильная' },
        { value: 'WEAK', label: 'Слабая' }
    ],
    signal_word: [
        { value: 'NONE', label: 'Нет' },
        { value: 'DANGER', label: 'ОПАСНО (Danger)' },
        { value: 'WARNING', label: 'ОСТОРОЖНО (Warning)' }
    ]
};