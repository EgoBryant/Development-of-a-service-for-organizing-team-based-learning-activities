export interface EventFormOption {
    value: string;
    label: string;
}

export const EVENT_TAG_OPTIONS: EventFormOption[] = [
    { value: "Культура", label: "Культура" },
    { value: "Спорт", label: "Спорт" },
    { value: "Обучение", label: "Обучение" },
    { value: "Наука", label: "Наука" },
    { value: "Встреча", label: "Встреча" },
    { value: "Другое", label: "Другое" }
];

export const EVENT_FORMAT_OPTIONS: EventFormOption[] = [
    { value: "Очный", label: "Очный" },
    { value: "Дистанционный", label: "Дистанционный" }
];
