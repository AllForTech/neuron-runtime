export interface FieldValidationRule {
    type:
        | "required"
        | "min"
        | "max"
        | "regex"
        | "custom";

    value?: any;

    message: string;
}