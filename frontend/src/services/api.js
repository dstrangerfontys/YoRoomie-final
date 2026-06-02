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

export async function updateTask(taskId, payload) {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    return response.json();
}

export async function updateGrocery(itemId, payload) {
    const response = await fetch(`${API_BASE_URL}/groceries/${itemId}`, {
        method: "PATCH",
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

export async function createExpense(payload) {
    const response = await fetch(`${API_BASE_URL}/expenses`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    return response.json();
}

export async function getExpensesByHousehold(householdId) {
    const response = await fetch(`${API_BASE_URL}/expenses/${householdId}`);
    return response.json();
}

export async function createTask(payload) {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    return response.json();
}

export async function getTasksByHousehold(householdId) {
    const response = await fetch(`${API_BASE_URL}/tasks/${householdId}`);
    return response.json();
}

export async function completeTask(taskId) {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/complete`, {
        method: "PATCH",
    });

    return response.json();
}

export async function createGrocery(payload) {
    const response = await fetch(`${API_BASE_URL}/groceries`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    return response.json();
}

export async function getGroceriesByHousehold(householdId) {
    const response = await fetch(`${API_BASE_URL}/groceries/${householdId}`);
    return response.json();
}

export async function completeGrocery(itemId) {
    const response = await fetch(`${API_BASE_URL}/groceries/${itemId}/complete`, {
        method: "PATCH",
    });

    return response.json();
}

export async function getBalancesByHousehold(householdId) {
    const response = await fetch(`${API_BASE_URL}/expenses/${householdId}/balances`);
    return response.json();
}

export async function settleParticipant(participantId) {
    const response = await fetch(
        `${API_BASE_URL}/expenses/participants/${participantId}/settle`,
        {
            method: "PATCH",
        }
    );

    return response.json();
}

export async function getExpenseParticipants(expenseId) {
    const response = await fetch(`${API_BASE_URL}/expenses/${expenseId}/participants`);
    return response.json();
}

export async function getSettlementsByHousehold(householdId) {
    const response = await fetch(`${API_BASE_URL}/expenses/${householdId}/settlements`);
    return response.json();
}

export async function deleteTask(taskId) {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: "DELETE",
    });

    return response.json();
}

export async function deleteGrocery(itemId) {
    const response = await fetch(`${API_BASE_URL}/groceries/${itemId}`, {
        method: "DELETE",
    });

    return response.json();
}

export async function updateAvatar(payload) {
    const response = await fetch(`${API_BASE_URL}/auth/avatar`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    return response.json();
}
