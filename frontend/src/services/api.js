const API_BASE_URL = "http://localhost:3001/api";

export async function registerUser(payload) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    return response.json();
}

export async function loginUser(payload) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    return response.json();
}

export async function createHousehold(payload) {
    const response = await fetch(`${API_BASE_URL}/households`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    return response.json();
}

export async function joinHousehold(payload) {
    const response = await fetch(`${API_BASE_URL}/households/join`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    return response.json();
}

export async function getUserHouseholds(userId) {
    const response = await fetch(`${API_BASE_URL}/households/${userId}`);
    return response.json();
}