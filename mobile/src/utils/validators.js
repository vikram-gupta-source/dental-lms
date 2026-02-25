export const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
};

export const validatePassword = (password) => {
    return password.length >= 6;
};

export const validateName = (name) => {
    return name.trim().length > 0;
};

export const validatePhoneNumber = (phone) => {
    const re = /^\d{10}$/;
    return re.test(String(phone));
};