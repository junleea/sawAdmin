export interface FormOption {
    list: FormOptionList[];
    labelWidth?: number | string;
    span?: number;

}

export interface FormOptionList {
    prop: string;
    label: string;
    type: string;
    placeholder?: string;
    rows?: number;
    disabled?: boolean;
    opts?: any[];
    format?: string;
    activeValue?: any;
    multiple?: boolean;
    inactiveValue?: any;
    activeText?: string;
    inactiveText?: string;
    required?: boolean;
}