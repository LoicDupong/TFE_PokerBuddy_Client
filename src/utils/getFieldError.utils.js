export function getFieldError(errors, field) {
    if (!errors) return null;
    const error = errors.find((err) => err.field === field);
    return error ? error.message : null;
}